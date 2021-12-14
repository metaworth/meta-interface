import { FC, useState, useRef, useContext, useEffect } from 'react'
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
import AssetMetadata from '../AssetMetadata'
import { TextileContext } from '../../context'
import { setLoading } from '../../store'
import { ThreadID } from '@textile/hub'
import NftAsset from '../../interfaces/NftAsset'
import { useEvm, useContractFunction, getExplorerTransactionLink, ChainId } from '@dapplabs/evm'
import { Contract } from '@ethersproject/contracts'


interface AssetDrawerProps {
  isOpen: boolean
  selectedAsset: NftAsset | undefined
  onClose: () => void
}

const MetaContractAddr = '0xaE97e70B20a8dc81d3183598B3E8905b8D24F871'
const MetaContractAbi = [
  'function mint(string memory _tokenURI) external payable returns (uint256)'
]
const contract = new Contract(MetaContractAddr, MetaContractAbi)

const AssetDrawer: FC<AssetDrawerProps> = ({ onClose, isOpen, selectedAsset }) => {
  const color = useColorModeValue('black', 'black')

  const { chainId } = useEvm()

  const [title, setTitle] = useState<string | undefined>()
  const [desc, setDesc] = useState<string | undefined>()
  const [tokenId] = useState('')

  const cancelRef = useRef() as React.MutableRefObject<HTMLInputElement>

  const { threadDBClient, threadID, web3Storage } = useContext(TextileContext)

  const toast = useToast()

  const dispatch = useDispatch()

  // @ts-ignore
  const { state, send } = useContractFunction(contract, 'mint', { transactionName: 'mintNFT' })

  useEffect(() => {
    if (!state || state.status === 'None') return

    if (state.status === 'Mining' || state.status === 'Success') {
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
                  <Link isExternal={true} href={`${getExplorerTransactionLink(state.transaction?.hash, chainId || ChainId.Mainnet)}`}>{`${state.transaction?.hash.substr(0, 8)}...${state.transaction?.hash.substr(-8)}`}</Link>
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
            {
              state.transaction?.hash ? (
                <>
                  <span>Tx hash:</span>
                  <Link isExternal={true} href={`https://mumbai.polygonscan.com/tx/${state.transaction?.hash}`}>{`${state.transaction?.hash.substr(0, 8)}...${state.transaction?.hash.substr(-8)}`}</Link>
                </>
              ) : ''
            }
          </Box>
        )
      })
    }
  }, [state, toast])

  /**
	 * Mint Nft
	 */
	const lazyMint = async () => {
    if (!threadDBClient || !threadID || !selectedAsset) return

    dispatch(setLoading(true))

    const asset = await threadDBClient?.findByID<NftAsset>(ThreadID.fromString(threadID), 'metaworth', selectedAsset.assetMetadata.cid!)
    if (asset) {
      asset.name = title
      asset.desc = desc
    }

    // call web3 storage to save data
    const blob = new Blob([JSON.stringify({...asset, image: `https://${asset.assetMetadata.cid}.ipfs.dweb.link/`})], {type : 'application/json'})
  
    const files = [new File([blob], `${title}.json`)]
    const cid = await web3Storage?.put(files)

    await send(`https://${cid}.ipfs.dweb.link/${title}.json`)

    console.log('state status:', state.status)
    if (state.status === 'Success') {
      asset.minted = true
      asset.nftMetadadtaCid = cid
    }
    await threadDBClient.save(ThreadID.fromString(threadID), 'metaworth', [asset])

    dispatch(setLoading(false))
    onDrawerClose()
	}

  useEffect(() => {
    if (selectedAsset) {
      setTitle(selectedAsset.name)
      setDesc(selectedAsset.desc)
    }
  }, [selectedAsset])

  const onDrawerClose = () => {
    setTitle(undefined)
    setDesc(undefined)

    onClose()
  }

  const onSave = async () => {
    if (!threadDBClient || !threadID || !selectedAsset) return

    dispatch(setLoading(true))
    const asset = await threadDBClient?.findByID<NftAsset>(ThreadID.fromString(threadID), 'metaworth', selectedAsset.assetMetadata.cid!)

    if (asset) {
      asset.name = title
      asset.desc = desc

      await threadDBClient.save(ThreadID.fromString(threadID), 'metaworth', [asset])
    }

    dispatch(setLoading(false))

    toast({
      description: `Metadata updated`,
      status: 'success',
      variant: 'left-accent',
      position: 'top-right',
      isClosable: true,
    })
    onClose()
  }

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
                              isReadOnly={!!tokenId}
                              value={title}
                              onChange={(e: any) => setTitle(e.target.value)}
                            />
                          </FormControl>
                          <FormControl id="description" mt={2}>
                            <FormLabel>Description</FormLabel>
                            <Textarea
                              placeholder="e.g. More details info about the awesome avatar"
                              isReadOnly={!!tokenId}
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
                !tokenId ? (
                  <>
                    <Button colorScheme="blue" size="md" disabled={!title || !selectedAsset} onClick={() => onSave()}>
                      Save
                    </Button>
                    
                    <Button colorScheme="teal" size="md" disabled={!title || !selectedAsset} onClick={() => lazyMint()}>
                      Mint
                    </Button>
                  </>
                ) : ''
              }

              {
                tokenId ? (
                  <Button colorScheme="teal" size="md" onClick={() => console.log('create sell order')}>
                    Create Sell Order
                  </Button>
                ) : ''
              }
            </Stack>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default AssetDrawer
