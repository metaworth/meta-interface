import { FC, useState, useRef, useContext, useEffect, useLayoutEffect } from 'react'
import {
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  GridItem,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useColorModeValue,
  useToast,
  Link
} from '@chakra-ui/react'
import { useDispatch } from 'react-redux'
import { FaPlus, FaMinus } from 'react-icons/fa'
import cloneDeep from 'lodash/cloneDeep'
import AssetMetadata from '../AssetMetadata'
import { TextileContext } from '../../context'
import { setLoading } from '../../store'
import NftAsset from '../../interfaces/NftAsset'
import {
  useEvm,
  useContractFunction,
  getExplorerTransactionLink,
  ChainId,
  shortenIfTransactionHash
} from '@dapptools/evm'
import { Contract } from '@ethersproject/contracts'
import getContract from '../../helpers/contracts'


interface AssetDrawerProps {
  isOpen: boolean
  contractAddress: string
  selectedAsset: NftAsset | undefined
  onClose: () => void
  onChainId?: number
}

const AssetDrawer: FC<AssetDrawerProps> = ({ onClose, isOpen, selectedAsset, contractAddress, onChainId }) => {
  const color = useColorModeValue('black', 'black')

  const { chainId, account } = useEvm()

  const [title, setTitle] = useState<string>('')
  const [desc, setDesc] = useState<string>('')
  const [contract, setContract] = useState<Contract>()
  const [asset, setAsset] = useState<NftAsset>()
  const [metadataCid, setMetadataCid] = useState<string>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const cancelRef = useRef() as React.MutableRefObject<HTMLInputElement>

  const { threadDBClient, threadID, web3Storage } = useContext(TextileContext)

  const toast = useToast()

  const dispatch = useDispatch()

  const { state, send } = useContractFunction(contract!, 'mint', { transactionName: 'mintNFT' })

  useLayoutEffect(() => {
    if (chainId) {
      const collectionContract = getContract('metaImplementation', chainId)
      if (!collectionContract) return

      const contract = new Contract(contractAddress, collectionContract.abi)
      setContract(contract)
    }
  }, [chainId])

  useEffect(() => {
    if (!state || state.status === 'None') return

    if (state.status === 'Mining' || state.status === 'Success') {
      if (asset && state.status === 'Success') {
        // @ts-ignore
        const tokenId = state.receipt?.events?.find(e => e.event === 'MetaMintCompleted').args._tokenId

        asset.name = title
        asset.desc = desc
        asset.creator = account!
        asset.minted = true
        asset.nftMetadadtaCid = metadataCid
        asset.tokenId = tokenId ? tokenId.toString() : ''
        asset.transactionHash = state.receipt?.transactionHash

        threadDBClient?.save(threadID!, contractAddress, [asset])
      }
      
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
    }
  }, [state, toast])

	const lazyMint = async () => {
    if (!threadDBClient || !threadID || !selectedAsset || !account) return

    dispatch(setLoading(true))
    setIsLoading(true)

    const asset = await threadDBClient.findByID<NftAsset>(threadID, contractAddress, selectedAsset.assetMetadata.cid)
    setAsset(asset)

    const metadata = cloneDeep(asset)
    // @ts-ignore
    delete metadata._id
    // @ts-ignore
    delete metadata._mod
    delete metadata.assetMetadata.preview

    // call web3 storage to save data
    const blob = new Blob([JSON.stringify({...metadata, image: `https://${asset.assetMetadata.cid}.ipfs.dweb.link/`})], { type : 'application/json' })
  
    const files = [new File([blob], `${title}.json`)]
    const cid = await web3Storage?.put(files)
    setMetadataCid(cid)

    await send(`https://${cid}.ipfs.dweb.link/${title}.json`)

    dispatch(setLoading(false))
    onDrawerClose()
    setIsLoading(false)
	}

  useEffect(() => {
    if (selectedAsset) {
      setTitle(selectedAsset.name || '')
      setDesc(selectedAsset.desc || '')
    }
  }, [selectedAsset])

  const onDrawerClose = () => {
    setTitle('')
    setDesc('')

    onClose()
  }

  const onSave = async () => {
    if (!account || !threadDBClient || !threadID || !selectedAsset) return

    dispatch(setLoading(true))
    setIsLoading(true)

    const asset = await threadDBClient?.findByID<NftAsset>(threadID, contractAddress, selectedAsset.assetMetadata.cid)
    if (asset) {
      asset.name = title
      asset.desc = desc
      asset.modifier = account

      const metadata = cloneDeep(asset)
      // @ts-ignore
      delete metadata._id
      // @ts-ignore
      delete metadata._mod
      delete metadata.assetMetadata.preview

      // call web3 storage to save data
      const blob = new Blob([JSON.stringify({...metadata, image: `https://${asset.assetMetadata.cid}.ipfs.dweb.link/`})], { type : 'application/json' })
    
      const files = [new File([blob], `${title}.json`)]
      const cid = await web3Storage?.put(files)

      asset.nftMetadadtaCid = cid

      await threadDBClient.save(threadID, contractAddress, [asset])
      toast({
        description: `Metadata updated`,
        status: 'success',
        variant: 'left-accent',
        position: 'top-right',
        isClosable: true,
      })
    } else {
      console.error('NFT asset is not found for the cid', selectedAsset.assetMetadata.cid)
    }
    
    dispatch(setLoading(false))
    onClose()
    setIsLoading(false)
  }

  const isReadOnly = selectedAsset?.minted
  const isButtonsHidden = isReadOnly && selectedAsset?.nftMetadadtaCid

  return (
    <>
      <Drawer
        placement="right"
        onClose={onDrawerClose}
        isOpen={isOpen}
        closeOnEsc={true}
        closeOnOverlayClick={true}
        size={'xl'}
        finalFocusRef={cancelRef}
      >
        <DrawerOverlay />

        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Asset Data</DrawerHeader>
          <DrawerBody>
          <>
            <GridItem colSpan={3}>
              <Stack mt={5}>
                <Accordion allowMultiple defaultIndex={[0, 1]} colorScheme="orange">
                  <AccordionItem>
                    {({ isExpanded }) => (
                      <>
                        <h2>
                          <AccordionButton bgColor="gray.100" color={color}>
                            <Box flex="1" textAlign="left">
                              Asset Metadata
                            </Box>
                            {isExpanded ? (
                              <FaMinus />
                            ) : (
                              <FaPlus />
                            )}
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          <AssetMetadata assetMetadata={selectedAsset?.assetMetadata} />
                        </AccordionPanel>
                      </>
                    )}
                  </AccordionItem>

                  <AccordionItem>
                    {({ isExpanded }) => (
                      <>
                        <h2>
                          <AccordionButton bgColor="gray.100" color={color}>
                            <Box flex="1" textAlign="left">
                              NFT Metadata
                            </Box>
                            {isExpanded ? (
                              <FaMinus />
                            ) : (
                              <FaPlus />
                            )}
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          <FormControl id="title" isRequired>
                            <FormLabel>Title</FormLabel>
                            <Input
                              placeholder="e.g. Awesome avatar"
                              isReadOnly={isReadOnly}
                              value={title}
                              onChange={(e: any) => setTitle(e.target.value)}
                            />
                          </FormControl>
                          <FormControl id="description" mt={2}>
                            <FormLabel>Description</FormLabel>
                            <Textarea
                              placeholder="e.g. More details info about the awesome avatar"
                              isReadOnly={isReadOnly}
                              resize={'vertical'}
                              value={desc}
                              onChange={(e: any) => setDesc(e.target.value)}
                            />
                          </FormControl>
                        </AccordionPanel>
                      </>
                    )}
                  </AccordionItem>
                </Accordion>
              </Stack>
              
            </GridItem>
          </>
          </DrawerBody>
          <DrawerFooter d="flex" alignItems="center" justifyContent={'center'}>
            <Stack mt={2} spacing={30} direction="row">
              <Button colorScheme="teal" variant="outline" onClick={onDrawerClose}>
                Cancel
              </Button>

              {
                isButtonsHidden ? '' : (
                  <>
                    <Button colorScheme="blue" size="md" isLoading={isLoading} disabled={!title || !selectedAsset} onClick={() => onSave()}>
                      Save
                    </Button>
                    
                    {
                      onChainId !== chainId ? '' : (
                        <Button colorScheme="teal" size="md" isLoading={isLoading} disabled={!title || !selectedAsset} onClick={() => lazyMint()}>
                          Mint
                        </Button>
                      )
                    }
                  </>
                )
              }
            </Stack>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default AssetDrawer
