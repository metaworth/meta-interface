import React, { useEffect, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useDispatch } from 'react-redux'
import {
  Box,
  Container,
  SimpleGrid,
  Grid,
  GridItem,
  useBoolean,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react'
import { ThreadID, Update } from '@textile/hub'
import { NFTStorage } from 'nft.storage'
// @ts-ignore
import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js'
import { setLoading } from '../store'
import FileMetadata from '../interfaces/FileMetadata'
import NftAsset from '../interfaces/NftAsset'
import { AssetDrawer, AssetsHeader, AssetPreview } from '../components/Assets'
import { TextileContext } from '../context'
import useTextile from '../hooks/use-textile'


const Assets = () => {
  const color = useColorModeValue('black', 'black')

  const [assets, setAssets] = useState<FileMetadata[]>([])
  const [selectedAsset, setSelectedAsset] = useState<FileMetadata>()

  const [nftAssets, setNftAssets] = useState<NftAsset[]>([])
  const [nftStorage, setNftStorage] = useState<NFTStorage>()
  const [web3Storage, setWeb3Storage] = useState<Web3Storage>()
  const [threadDBListener, setThreadDBListener] = useState<any>()
  const [collName] = useState('metaworth')

  const [showAssetInfo, setShowAssetInfo] = useBoolean()
  const { isOpen: isAssetDrawerOpen, onOpen: onOpenAssetDrawer, onClose: onCloseAssetDrawer } = useDisclosure()

  const dispatch = useDispatch()

  const { identity, buckets, threadDBClient, bucketKey, threadID } = useTextile()

  const loadNFTAssets = useCallback(async () => {
    if (!threadDBClient || !threadID) return

    const collections = await threadDBClient?.listCollections(ThreadID.fromString(threadID))
    let coll = collections?.find(c => c.name === collName)
    if (!coll) {
      await threadDBClient?.newCollection(ThreadID.fromString(threadID), { name: collName })
    }

    const nftAssets = await threadDBClient?.find<NftAsset>(ThreadID.fromString(threadID), collName, {})
    // const ids = await nftAssets.map((instance: any) => instance['_id'])
    // await threadDBClient.delete(ThreadID.fromString(threadID), collName, ids)
    
    setNftAssets(nftAssets || [])
    dispatch(setLoading(false))
  }, [collName, dispatch, threadDBClient, threadID])

  const setupListener = useCallback(() => {
    if (!threadDBClient || !threadID) return
    const callback = (update?: Update<any>) => {
      if (!update || !update.instance) return
      console.log('New update:', update.instance.name, update)
      // loadNFTAssets()
    }
    const listener = threadDBClient?.listen(ThreadID.fromString(threadID), [], callback)
    setThreadDBListener(listener)
  }, [threadDBClient, threadID])

  useEffect(() => {
    dispatch(setLoading(true))
    if (!threadDBClient || !threadID) return
    loadNFTAssets()
  }, [threadDBClient, threadID, loadNFTAssets, dispatch])

  useEffect(() => {
    if (!threadDBClient || !threadID) return
    
    if (!threadDBListener) {
      setupListener()
    }
  }, [threadDBClient, threadID, threadDBListener, setupListener])

  useEffect(() => {
    if (!nftStorage) {
      const client = new NFTStorage({ token: process.env.REACT_NFT_STORAGE_TOKEN || '' })
      setNftStorage(client)
    }

    if (!web3Storage) {
      setWeb3Storage(new Web3Storage({ token: process.env.REACT_APP_WEB3_STORAGE_API_KEY || '' }))
    }
    
  }, [nftStorage, web3Storage])

  const upload = useCallback(async (assetsMeta: FileMetadata[]) => {
    // show the root cid as soon as it's ready
    const onRootCidReady = (cid: string) => {
      console.log('uploading files with cid:', cid)
    }

    const sFiles: FileMetadata[] = []
    // when each chunk is stored, update the percentage complete and display
    const totalSize = assetsMeta.map(f => {
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
      const f = assetsMeta.filter(item => item.name === file.name)
      const md = {
        cid: file.cid,
        // @ts-ignore
        name: file.name,
        // @ts-ignore
        size: file.size,
        // @ts-ignore
        lastModified: f[0].lastModified,
        lastModifiedDate: f[0].lastModifiedDate,
        path: f[0].path,
        // @ts-ignore
        type: f[0].type,
        ...f[0]
      }
      const asset = { assetMetadata: md, '_id': file.cid }
      // save it to textile
      threadDBClient?.create(ThreadID.fromString(threadID), collName, [asset])
      assetsWithCid.push(asset)
    }

    setNftAssets((prevArray) => [...assetsWithCid, ...prevArray])
    dispatch(setLoading(false))
  }, [collName, dispatch, threadDBClient, threadID, web3Storage])
  
  useEffect(() => {
    if (assets && assets.length > 0 && web3Storage) {
      upload(assets)
    }
  }, [assets, upload, web3Storage])

  const processFiles = (acceptedFiles: FileMetadata[]) => {
    const filteredFiles = acceptedFiles.filter((f: FileMetadata) => {
      if (assets.length === 0) return true

      const fAssets = assets?.filter(a => a && a.name !== f.name)
      return fAssets && fAssets.length > 0
    })
    
    if (filteredFiles.length === 0) {
      dispatch(setLoading(false))
      return
    }

    filteredFiles.map((file: FileMetadata) => {
      // console.log(`${JSON.stringify(file)} - ${file.path} - ${file.size} bytes`)

      return Object.assign(file, {
        preview: URL.createObjectURL(file)
      })
    })
    setAssets(filteredFiles)
  }

  const {
    getRootProps,
    getInputProps,
    open,
  } = useDropzone({
    accept: 'image/*',
    noKeyboard: true,
    noClick: true,
    onDrop: (acceptedFiles: FileMetadata[]) => {
      dispatch(setLoading(true))

      processFiles(acceptedFiles)
    }
  })

  const onAssetSelected = (asset: FileMetadata) => {
    if (!selectedAsset || selectedAsset?.name === asset.name) {
      setShowAssetInfo.toggle()
    }
    setSelectedAsset(asset)
    onOpenAssetDrawer()
  }

  return (
    <Container color={color} maxW={{ lg: '7xl' }}>
      <AssetsHeader disableButtons={!nftAssets || (nftAssets && nftAssets.length === 0)} onUploadOpen={open} />

      <TextileContext.Provider value={{identity, buckets, bucketKey, threadID, threadDBClient}}>
        <Box
          mt={3}
          {...getRootProps()}
          w={'100%'}
          minH={'calc(100vh - 60px - 1rem)'}>
          <input {...getInputProps()} />

          {
            nftAssets && nftAssets.length === 0 ? (
              <Box>NFT Assets not found. You can drag & drop asset files here, or click the Upload button on the top right to select asset files</Box>
            ) : (
                <Grid templateColumns="repeat(5, 1fr)">
                  <GridItem colSpan={selectedAsset ? 11 : 14}>
                    <SimpleGrid minChildWidth="15rem" spacing={2}>
                      <AssetPreview nftAssets={nftAssets} onAssetSelected={onAssetSelected} />
                    </SimpleGrid>
                  </GridItem>
                </Grid>
            )
          }
        </Box>
      
        <AssetDrawer onClose={onCloseAssetDrawer} isOpen={isAssetDrawerOpen} selectedAsset={selectedAsset} />
      </TextileContext.Provider>
    </Container>
  )
}

export default Assets
