import { useRef, useLayoutEffect, useState, useEffect } from 'react'
import { Container, useColorModeValue, AspectRatio, useToast, Box, Link } from '@chakra-ui/react'
import { ChainId, getExplorerTransactionLink, shortenIfTransactionHash, useContractFunction, useEvm } from '@dapptools/evm'
import { Contract, ethers } from 'ethers'
import { useDispatch } from 'react-redux'
import { NFTStorage, File } from 'nft.storage'
import { v4 as uuidv4 } from 'uuid';
import getContract from '../helpers/contracts'
import { setLoading } from '../store'
import { Token } from 'nft.storage/dist/src/lib/interface'

declare const window: any;

const GenerativeCard = () => {
  const color = useColorModeValue('black', 'black')

  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [contract, setContract] = useState<Contract>()

  const { chainId, library, account } = useEvm()

  const { state, send } = useContractFunction(contract!, 'batchMintWithSameURI')

  const toast = useToast()
  const dispatch = useDispatch()
  
  useLayoutEffect(() => {
    if (chainId && library && account) {
      const cardContract = getContract('card', chainId)
      const contract = new Contract(cardContract.address, cardContract.abi, library)
      setContract(contract)
    }
  }, [chainId, library, account])

  useEffect(() => {
    if (!chainId || !state || state.status === 'None') return

    if (state.status === 'Success') {
      toast({
        title: `${state.status}`,
        status: 'success',
        variant: 'left-accent',
        position: 'top-right',
        isClosable: true,
        render: () => (
          <Box color="white" p={3} bg={'teal'} borderRadius={5}>
            {
              state.transaction?.hash ? (
                <>
                  <Box>{state.status}</Box>
                  <span>Tx hash: </span>
                  <Link
                    isExternal={true}
                    href={`${getExplorerTransactionLink(state.transaction.hash, chainId || ChainId.Mainnet)}`}>
                      { shortenIfTransactionHash(state.transaction.hash) }
                  </Link>
                </>
              ) : ''
            }
          </Box>
        )
      })

      // @ts-ignore
      iframeRef.current!.contentWindow!.nftMinted()

      dispatch(setLoading(false))
    } else if (state.status === 'Exception' || state.status === 'Fail') {
      toast({
        title: `${state.status}`,
        status: 'error',
        variant: 'left-accent',
        position: 'top-right',
        isClosable: true,
        render: () => (
          <Box color="white" p={3} bg="red" borderRadius={5}>
            { state.errorMessage }
          </Box>
        )
      })

      // @ts-ignore
      iframeRef.current!.contentWindow!.nftMinted(state.errorMessage)

      dispatch(setLoading(false))
    }
  }, [state, chainId])

  const uploadToIPFS = async (base64: string, name: string, desc: string) : Promise<Token<any>> => {
    const client = new NFTStorage({ token: process.env.REACT_APP_NFT_STORAGE_API_KEY || '' })

    const { mimeType, image } = await base64ToFile(base64, uuidv4())
    const metadata = await client.store({
      name,
      description: desc,
      image,
      properties: {
        'mintFrom': 'https://metaworth.io',
        mimeType
      }
    })

    return metadata
  }

  const mintCard = async (base64: string, sendTo: string, name: string, desc: string) => {
    let lines = sendTo.split(/\n/u).filter(Boolean)
    try {
      dispatch(setLoading(true))
      const addresses: string[] = []

      lines.forEach((l: string) => {
        const aa = l.split(/[ ,=]+/).filter(Boolean)
        aa.forEach(item => {
          ethers.utils.getAddress(String(item))
          addresses.push(item)
        })
      })

      const md = await uploadToIPFS(base64, name, desc)
      await send(addresses, md.url)
    } catch (e) {
      toast({
        title: 'Invalid wallet address is found',
        description: 'Please make sure you\'ve provided the correct wallet addresses',
        status: 'error',
        duration: 9000,
        isClosable: true,
        position: 'bottom-right'
      })

      // @ts-ignore
      iframeRef.current!.contentWindow!.invalidWalletAddr('Invalid wallet address is found')

      dispatch(setLoading(false))
    }
  }

  const base64ToFile = async (url: string, fileName: string, mimeType?: string) : Promise<{mimeType: string, image: File}> => {
    mimeType = mimeType || (url.match(/^data:([^;]+);/)||'')[1];
    const image = await fetch(url)
      .then((res) => res.arrayBuffer())
      .then((buf) => new File([buf], `${fileName}`, { type: mimeType }))

    return { mimeType, image }
  }

  window.mintCard = mintCard

  return (
    <Container color={color} maxW={{ lg: '7xl' }}>
      <AspectRatio minH={'calc(100vh - 85px)'} w={'auto'}>
        <iframe title='card iframe' ref={iframeRef} src="/card/index.html" style={{height: '100%', width: '100%'}} allowFullScreen />
      </AspectRatio>
    </Container>
  )
}

export default GenerativeCard
