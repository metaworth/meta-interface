import { useEffect, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useDispatch } from 'react-redux'
import {
  Box,
  Container,
  SimpleGrid,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react'
import { Update } from '@textile/hub'
import { Web3Storage } from 'web3.storage'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEvm } from '@dapptools/evm'
import { setLoading } from '../store'
import FileMetadata from '../interfaces/FileMetadata'
import NftAsset from '../interfaces/NftAsset'
import { AssetDrawer, AssetsHeader } from '../components/Assets'
import { TextileContext } from '../context'
import useTextile from '../hooks/useTextile'
import AssetPreviews from '../components/Assets/AssetPreviews'


const Assets = () => {
  const color = useColorModeValue('black', 'black')

  const { account, chainId } = useEvm()

  const { state: locationState } = useLocation()
  const navigate = useNavigate()

  const [assets, setAssets] = useState<FileMetadata[]>([])
  const [displayedAsset, setDisplayedAsset] = useState<NftAsset>()
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([])
  const [isAllSelected, setIsAllSelected] = useState(false)
  const [selectedToMint, setSelectedToMint] = useState(false)
  const [selectedToTransfer, setSelectedToTransfer] = useState(false)
  const [nftAssets, setNftAssets] = useState<NftAsset[]>([])
  const [web3Storage, setWeb3Storage] = useState<Web3Storage>()
  const [threadDBListener, setThreadDBListener] = useState<any>()
  const [contractAddress, setContractAddress] = useState<string>('')
  const [contractName, setContractName] = useState<string>('')
  const [onChainId, setOnChainId] = useState<number>()

  const {
    isOpen: isAssetDrawerOpen,
    onOpen: onOpenAssetDrawer,
    onClose: onCloseAssetDrawer,
  } = useDisclosure()

  const dispatch = useDispatch()

  const { threadDBClient, threadID } = useTextile()

  useEffect(() => {
    if (!locationState) {
      navigate('/collections')
      return
    }
console.log('locationState.chainId:', locationState)
    setContractAddress(locationState.contractAddress)
    setContractName(locationState.contractName)
    setOnChainId(locationState.chainId)
  }, [])

  const loadNFTAssets = useCallback(async () => {
    if (!threadDBClient || !threadID) return

    const collections = await threadDBClient.listCollections(threadID)
    let coll = collections.find((c) => c.name === contractAddress) 
    if (!coll) {
      await threadDBClient.newCollection(threadID, { name: contractAddress })
    }

    const nftAssets = await threadDBClient.find<NftAsset>(
      threadID,
      contractAddress,
      {}
    )
    console.log('nft assets:', nftAssets)
    // const ids = await nftAssets.map((instance: any) => instance['_id'])
    // await threadDBClient.delete(threadID, contractAddress, ids)

    setNftAssets(nftAssets || [])
    dispatch(setLoading(false))
  }, [contractAddress, dispatch, threadDBClient, threadID])

  const setupListener = useCallback(() => {
    if (!threadDBClient || !threadID) return
    const callback = (update?: Update<any>) => {
      if (!update || !update.instance) return
      console.log('New update:', update.instance.name, update)
      // loadNFTAssets()
    }
    const listener = threadDBClient?.listen(
      threadID,
      [],
      callback
    )
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
    if (!web3Storage) {
      setWeb3Storage(
        new Web3Storage({
          token: process.env.REACT_APP_WEB3_STORAGE_API_KEY || '',
        })
      )
    }
  }, [web3Storage])

  const upload = useCallback(
    async (assetsMeta: FileMetadata[]) => {
      // show the root cid as soon as it's ready
      const onRootCidReady = (cid: string) => {
        console.log('uploading files with cid:', cid)
      }

      const sFiles: FileMetadata[] = []
      // when each chunk is stored, update the percentage complete and display
      const totalSize = assetsMeta
        .map((f) => {
          sFiles.push(f)
          return f.size
        })
        .reduce((a, b) => a + b, 0)

      let uploaded = 0
      const onStoredChunk = (size: number) => {
        uploaded += size
        const pct = (uploaded / totalSize) * 100
        console.log(`Uploading... ${pct.toFixed(2)}% complete`)
      }

      const rootCid = await web3Storage?.put(sFiles, {
        onRootCidReady,
        onStoredChunk,
      })
      const res = rootCid && (await web3Storage?.get(rootCid))
      if (!res?.ok) {
        throw new Error(
          `failed to get ${rootCid} - [${res?.status}] ${res?.statusText}`
        )
      }

      const assetsWithCid: NftAsset[] = []
      // unpack File objects from the response
      const files = await res.files()
      for (const file of files) {
        const f = assetsMeta.filter((item) => item.name === file.name)
        const md = {
          // @ts-ignore
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
          ...f[0],
        }
        const asset = { contractAddress, modifier: account!, assetMetadata: md, _id: file.cid }
        
        await threadDBClient?.create(threadID!, contractAddress, [asset])
        
        assetsWithCid.push(asset)
      }

      setNftAssets((prevArray) => [...assetsWithCid, ...prevArray])
      dispatch(setLoading(false))
    },
    [contractAddress, dispatch, threadDBClient, threadID, web3Storage]
  )

  useEffect(() => {
    if (assets && assets.length > 0 && web3Storage) {
      upload(assets)
    }
  }, [assets, upload, web3Storage])

  useEffect(() => {
    if (!selectedAssetIds.length || nftAssets.length > selectedAssetIds.length)
      setIsAllSelected(false)
    else setIsAllSelected(true)
  }, [nftAssets.length, selectedAssetIds.length])

  const processFiles = (acceptedFiles: FileMetadata[]) => {
    const filteredFiles = acceptedFiles.filter((f: FileMetadata) => {
      if (assets.length === 0) return true

      const fAssets = assets?.filter((a) => a && a.name !== f.name)
      return fAssets && fAssets.length > 0
    })

    if (filteredFiles.length === 0) {
      dispatch(setLoading(false))
      return
    }

    filteredFiles.map((file: FileMetadata) => {
      return Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    })
    setAssets(filteredFiles)
  }

  const { getRootProps, getInputProps, open } = useDropzone({
    accept: 'image/*, video/*', // application/json, 
    noKeyboard: true,
    noClick: true,
    disabled: onChainId !== chainId,
    onDrop: (acceptedFiles: any) => {
      dispatch(setLoading(true))

      processFiles(acceptedFiles)
    },
  })

  const onDisplayAsset = (asset: NftAsset) => {
    setDisplayedAsset(asset)
    onOpenAssetDrawer()
  }

  const updateSelectedAssetIdsOnToggle = (assetId: string) => {
    const assetIds = [...selectedAssetIds]
    const assetIndex = assetIds.indexOf(assetId)
    if (assetIndex > -1) assetIds.splice(assetIndex, 1)
    else assetIds.push(assetId)

    setSelectedAssetIds(assetIds)
  }

  const onSelectAll = (isSelected: boolean) => {
    setIsAllSelected(isSelected)

    if (isSelected)
      setSelectedAssetIds(
        nftAssets.map((asset) => asset.assetMetadata.cid!)
      )
    else setSelectedAssetIds([])
  }

  const onBatch = () => {
    if (selectedToMint) onBatchMint()
    if (selectedToTransfer) onBatchTransfer()
  }

  const onBatchMint = () => {
    alert(
      `Calling Mint API endpoint with the following asset IDs: ${selectedAssetIds}`
    )
  }

  const onBatchTransfer = () => {
    alert(
      `Calling Transfer API endpoint with the following asset IDs: ${selectedAssetIds}`
    )
  }

  const onSelectToMint = () => {
    if (isDisableHeaderButtons) return

    setSelectedToMint(!selectedToMint)
    setSelectedToTransfer(false)
    setSelectedAssetIds([])
  }

  const onSelectToTransfer = () => {
    if (isDisableHeaderButtons) return

    setSelectedToMint(false)
    setSelectedToTransfer(!selectedToTransfer)
    setSelectedAssetIds([])
  }

  const isDisableHeaderButtons = chainId !== onChainId || !nftAssets || (nftAssets && nftAssets.length === 0)

  return (
    <Container color={color} maxW={{ lg: '7xl' }}>
      <AssetsHeader
        onSelectAllClick={onSelectAll}
        isAllSelected={isAllSelected}
        readyToBatch={!!selectedAssetIds.length}
        disableButtons={isDisableHeaderButtons}
        onUploadOpen={open}
        onSelectToMintClick={onSelectToMint}
        onSelectToTransferClick={onSelectToTransfer}
        selectedToMint={selectedToMint}
        selectedToTransfer={selectedToTransfer}
        onBatch={onBatch}
        collectionName={contractName}
        onChainId={onChainId}
      />

      <TextileContext.Provider
        value={{ threadID, threadDBClient, web3Storage }}
      >
        <Box
          mt={3}
          {...getRootProps()}
          w={'100%'}
          minH={'calc(100vh - 60px - 1rem)'}
        >
          <input {...getInputProps()} />

          {
            nftAssets && nftAssets.length === 0 ? (
              <Box>
                NFT Assets not found. You can drag & drop asset files to here, or
                click the Upload button on the top right to select asset files
              </Box>
            ) : (
              <SimpleGrid minChildWidth="15rem" spacing={3} mt={5}>
                <AssetPreviews
                  selectedAssetIds={selectedAssetIds}
                  nftAssets={nftAssets}
                  onOpenAssetDrawer={onDisplayAsset}
                  onAssetSelectionToggle={updateSelectedAssetIdsOnToggle}
                  isSelectionEnabled={selectedToMint || selectedToTransfer}
                />
              </SimpleGrid>
            )
          }
        </Box>

        {
          isAssetDrawerOpen && displayedAsset && contractAddress ?
            <AssetDrawer
              onClose={onCloseAssetDrawer}
              isOpen={isAssetDrawerOpen}
              selectedAsset={displayedAsset}
              contractAddress={contractAddress}
              onChainId={onChainId}
            />
            : ''
        }
      </TextileContext.Provider>
    </Container>
  )
}

export default Assets
