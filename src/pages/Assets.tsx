import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useDispatch } from 'react-redux'
import { 
  Box,
  Container,
  Image,
  SimpleGrid,
  Grid,
  GridItem,
  useBoolean,
  useDisclosure,
  Link,
  useColorModeValue,
  Flex,
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { NFTStorage } from 'nft.storage'
// @ts-ignore
import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js'
import { setLoading } from '../store'
import FileMetadata from '../interfaces/FileMetadata'
import { AssetDrawer, AssetsHeader } from '../components/Assets'

interface NftAsset {
  fileMetadata: FileMetadata
  cid?: string
  title?: string
  desc?: string
  tokenId?: string
  sellOrder?: any
}

const Assets = () => {
  const color = useColorModeValue('black', 'black')

  const [assets, setAssets] = useState<FileMetadata[]>([])
  const [selectedAsset, setSelectedAsset] = useState<FileMetadata>()

  const [nftAssets, setNftAssets] = useState<NftAsset[]>([])
  const [files, setFiles] = useState<FileMetadata[]>([])
  const [nftStorage, setNftStorage] = useState<NFTStorage>()
  const [web3Storage, setWeb3Storage] = useState<Web3Storage>()

  const [showAssetInfo, setShowAssetInfo] = useBoolean()
  const { isOpen: isAssetDrawerOpen, onOpen: onOpenAssetDrawer, onClose: onCloseAssetDrawer } = useDisclosure()
  const cancelRef = useRef() as React.MutableRefObject<HTMLInputElement>

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
    if (!selectedAsset || selectedAsset?.name === asset.name) {
      setShowAssetInfo.toggle()
    }
    setSelectedAsset(asset)
    onOpenAssetDrawer()
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
    <Container color={color} maxW={{ lg: '7xl' }}>
      <AssetsHeader disableButtons={assets.length === 0} onUploadOpen={open} />

      <Box
        mt={3}
        {...getRootProps()}
        w={'100%'}
        minH={'calc(100vh - 60px - 1rem)'}>
        <input {...getInputProps()} />

        {
          assets.length === 0 ? (
            <Box>Assets not found. You can drag & drop files here, or click the Upload button on the top right to select files</Box>
          ) : (
              <Grid templateColumns="repeat(5, 1fr)">
                <GridItem colSpan={selectedAsset ? 11 : 14}>
                  <SimpleGrid minChildWidth="15rem" spacing={2}>
                    {previews}
                  </SimpleGrid>
                </GridItem>
              </Grid>
          )
        }
      </Box>

      <AssetDrawer onClose={onCloseAssetDrawer} isOpen={isAssetDrawerOpen} selectedAsset={selectedAsset}  />
    </Container>
  )
}

export default Assets
