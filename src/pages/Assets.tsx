import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useDispatch } from 'react-redux'
import { 
  Box,
  Container,
  Image,
  SimpleGrid,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Grid,
  GridItem,
  Divider,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useBoolean,
  Center,
  CloseButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  useDisclosure,
  WrapItem,
  Link,
  Spinner,
  AlertDialogOverlay,
  Flex,
} from '@chakra-ui/react'
import {
  DeleteIcon,
  EditIcon,
  ExternalLinkIcon,
  CopyIcon,
  CheckIcon,
} from '@chakra-ui/icons'
import { FaPlus, FaMinus, FaGripVertical, FaGripHorizontal } from 'react-icons/fa'
import { HiUpload } from 'react-icons/hi'
import { BiSort } from 'react-icons/bi'
import { NFTStorage } from 'nft.storage'
// @ts-ignore
import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js'
import { setLoading } from '../store'
import FileMetadata from '../interfaces/FileMetadata'
import AssetMetadata from '../components/AssetMetadata'


interface NftAsset {
  fileMetadata: FileMetadata
  cid?: string
  title?: string
  desc?: string
  tokenId?: string
  sellOrder?: any
}

interface Upload {
  name: string
  cid: string
}

const Assets = () => {
  const [assets, setAssets] = useState<FileMetadata[]>([])
  const [assetSelected, setAssetSelected] = useState<FileMetadata>()
  const [title, setTitle] = useState()
  const [desc, setDesc] = useState()
  const [nftAssets, setNftAssets] = useState<NftAsset[]>([])
  const [files, setFiles] = useState<FileMetadata[]>([])
  const [nftStorage, setNftStorage] = useState<NFTStorage>()
  const [web3Storage, setWeb3Storage] = useState<Web3Storage>()
  const [tokenId, setTokenId] = useState('')
  const [isMinted, setIsMinted] = useState(false)

  const [showAssetInfo, setShowAssetInfo] = useBoolean()

  const cancelRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const { isOpen: isMintOpen, onOpen: onMintOpen, onClose: onMintClose } = useDisclosure()

  const dispatch = useDispatch()

  useEffect(() => {
    if (!nftStorage) {
      const client = new NFTStorage({ token: process.env.REACT_NFT_STORAGE_TOKEN || '' })
      setNftStorage(client)
    }

    if (!web3Storage) {
      setWeb3Storage(new Web3Storage({ token: process.env.REACT_APP_WEB3_STORAGE_API_KEY || '' }))
    }
    
  }, [nftStorage, web3Storage])

  const upload = useCallback(async (nftAssets: FileMetadata[]) => {
    // show the root cid as soon as it's ready
    const onRootCidReady = (cid: string) => {
      console.log('uploading files with cid:', cid)
    }

    const sFiles: FileMetadata[] = []
    // when each chunk is stored, update the percentage complete and display
    const totalSize = nftAssets.map(f => {
      sFiles.push(f)
      return f.size
    }).reduce((a, b) => a + b, 0)

    let uploaded = 0
    const onStoredChunk = (size: number) => {
      uploaded += size
      const pct = totalSize / uploaded
      console.log(`Uploading... ${pct.toFixed(2)}% complete`)
    }

    const rootCid = await web3Storage?.put(sFiles, { onRootCidReady, onStoredChunk })
    const res = rootCid && await web3Storage?.get(rootCid)
    if (!res?.ok) {
      throw new Error(`failed to get ${rootCid} - [${res?.status}] ${res?.statusText}`)
    }

    const assetsWithCid: NftAsset[] = []
    // unpack File objects from the response
    const files = await res.files()
    for (const file of files) {
      const f = nftAssets.filter(item => item.name === file.name)
      assetsWithCid.push({ fileMetadata: f[0], cid: file.cid })
    }
    setNftAssets((prevArray) => [...prevArray, ...assetsWithCid])
    dispatch(setLoading(false))
  }, [dispatch, web3Storage])
  
  useEffect(() => {
    if (assets.length > 0 && web3Storage) {
      upload(assets)
    }
  }, [assets, upload, web3Storage])

  const {
    getRootProps,
    getInputProps,
    open,
  } = useDropzone({
    accept: 'image/*',
    noKeyboard: true,
    noClick: true,
    onDrop: (acceptedFiles: any) => {
      dispatch(setLoading(true))

      setAssets(acceptedFiles.map((file: any) => {
        console.log(`${file.path} - ${file.size} bytes`)

        const md = Object.assign(file, {
          preview: URL.createObjectURL(file)
        })
        return md
      }))
    }
  })

  const onAssetSelected = (asset: FileMetadata) => {
    console.log('asset:', asset)
    if (!assetSelected || assetSelected?.name === asset.name) {
      setShowAssetInfo.toggle()
    }
    setAssetSelected(asset)
  }

  /**
	 * Mint Nft
	 */
	const lazyMint = async () => {
    onMintOpen()

    console.log('lazy mint')

    onMintClose()
	}

  const previews = nftAssets.map(({ fileMetadata: file, cid, title, desc }) => (
    <Box cursor="pointer" key={file.name} borderWidth="1px" maxW={'sm'} borderRadius="lg" overflow="hidden" onClick={() => onAssetSelected(file)}>
      <Flex height={300} alignItems={'center'} justifyContent={'center'}  overflow={'hidden'}>
        <Flex alignItems={'center'} justifyContent={'center'} overflow={'hidden'}>
          <Image src={file.preview} alt={file.name} className="abc"/>
        </Flex>
      </Flex>

      <Box p="3">
        <Box
          mt="1"
          fontWeight="semibold"
          as="h4"
          lineHeight="tight"
          isTruncated
          title={file?.name}
        >
          {file.name}
        </Box>

        <Box
          color="gray.500"
          fontWeight="extrabold"
          letterSpacing="wide"
          fontSize="xs"
          textTransform="uppercase"
        >
          {
            cid ? (
              <Link d="flex" alignItems="center" href={`https://ipfs.io/ipfs/${cid}`} isExternal title={cid}>
                {`${cid.slice(0, 8)}...${cid.substr(-8)}`} <ExternalLinkIcon ml={2} />
              </Link>
            ) : ''
          }
        </Box>
      </Box>

    </Box>
  ))

  return (
    <Container maxW={{ lg: '7xl' }}>
      <Box as={Flex} justifyContent={'space-between'} alignItems={'center'}>
        <Box></Box>
        <Button
          borderRadius={5}
          bg={'#4AD3A6'}
          _hover={{ bg: "#3BD3A5" }}
          _active={{
            bg: "#dddfe2",
            transform: "scale(0.98)",
            borderColor: "#bec3c9",
          }}
          leftIcon={<HiUpload />}
          size={'sm'}
          onClick={open}
          color='white'
        >Upload</Button>
      </Box>

      <Box as={Flex} justifyContent={'space-between'} alignItems={'center'} mt={3}>
        <Box>
          <Button
            borderRadius={5}
            border="2px"
            borderColor="black"
            bgColor={'white'}
            size={'sm'}
          >Select to Mint</Button>
          <Button
            ml={2}
            borderRadius={5}
            border="2px"
            borderColor="black"
            bgColor={'white'}
            size={'sm'}
          >Select to Transfer</Button>
        </Box>
        
        <Box as={Flex} alignItems={'center'}>
          <Button size={'sm'} bgColor={'white'}><FaGripHorizontal /></Button>
          <Button size={'sm'} ml={2} bgColor={'white'}><FaGripVertical /></Button>
          <Button size={'sm'} ml={2} bgColor={'white'}><BiSort />&nbsp;Sort By</Button>
        </Box>
      </Box>

      <Box
        mt={3}
        {...getRootProps()}
        w={'100%'}
        minH={'calc(100vh - 60px - 1rem)'}>
        <input {...getInputProps()} />

        {
          assets.length === 0 ? (
            <Box>Assets not found</Box>
          ) : (
              <Grid templateColumns="repeat(14, 1fr)">
                <GridItem colSpan={assetSelected ? 11 : 14}>
                  <SimpleGrid minChildWidth="15rem" spacing={2}>
                    {previews}
                  </SimpleGrid>
                </GridItem>
                
              </Grid>
          )
        }
      </Box>

      <AlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={() => {}}
        isOpen={assetSelected ? true : false}
        closeOnEsc={true}
        closeOnOverlayClick={true}
        isCentered
        size={'xl'}
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>Asset Data</AlertDialogHeader>
          <AlertDialogBody>
          <>
                <GridItem colSpan={3}>
                  <Stack mt={5}>
                    <Stack px={2} direction="row" justifyContent="space-between">
                      <Box></Box>
                      <Box>
                        <CloseButton onClick={() => setAssetSelected(undefined)} />
                      </Box>
                    </Stack>

                    <Accordion allowMultiple defaultIndex={[0, 1]} colorScheme="orange">
                      <AccordionItem>
                        {({ isExpanded }) => (
                          <>
                            <h2>
                              <AccordionButton bgColor="gray.100">
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
                              <AssetMetadata assetMetadata={assetSelected} />
                            </AccordionPanel>
                          </>
                        )}
                      </AccordionItem>

                      <AccordionItem>
                        {({ isExpanded }) => (
                          <>
                            <h2>
                              <AccordionButton bgColor="gray.100">
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
                                <Input placeholder="e.g. Awesome avatar" isReadOnly={!!tokenId} onChange={(e: any) => setTitle(e.target.value)} />
                              </FormControl>
                              <FormControl id="description" mt={2}>
                                <FormLabel>Description</FormLabel>
                                <Textarea placeholder="e.g. More details info about the awesome avatar" isReadOnly={!!tokenId} resize={'vertical'} onChange={(e: any) => setDesc(e.target.value)} />
                              </FormControl>
                              <Stack mt={2} spacing={30} direction="row" justifyContent="center">
                                {
                                  !tokenId ? (
                                    <Button colorScheme="teal" size="md" disabled={!title || !assetSelected} onClick={() => lazyMint()}>
                                      Lasy Mint
                                    </Button>
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
                            </AccordionPanel>
                          </>
                        )}
                      </AccordionItem>
                    </Accordion>
                  </Stack>
                  
                </GridItem>
              </>
          </AlertDialogBody>
          <AlertDialogFooter d="flex" alignItems="center" justifyContent={'center'}>
            <Button colorScheme="teal" onClick={onMintClose} isDisabled={!isMinted}>
              Close
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </Container>
  )
}

export default Assets
