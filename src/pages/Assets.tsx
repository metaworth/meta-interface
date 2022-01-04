import { useEffect, useState, useCallback, useLayoutEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { useDispatch } from 'react-redux'
import {
  Box,
  Container,
  SimpleGrid,
  useDisclosure,
  useColorModeValue,
  useToast,
  Link,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react'
import { Update } from '@textile/hub'
import { Web3Storage } from 'web3.storage'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  useEvm,
  useContractFunction,
  getExplorerTransactionLink,
  shortenIfTransactionHash,
  ChainId
} from '@dapptools/evm'
import { Contract } from 'ethers'
import sortBy from 'lodash/sortBy'
import { setLoading } from '../store'
import FileMetadata from '../interfaces/FileMetadata'
import NftAsset from '../interfaces/NftAsset'
import { AssetDrawer, AssetsHeader } from '../components/Assets'
import { TextileContext } from '../context'
import useTextile from '../hooks/useTextile'
import AssetPreviews from '../components/Assets/AssetPreviews'
import getContract from '../helpers/contracts'


const Assets = () => {
  const color = useColorModeValue('black', 'black')

  const { account, chainId, library } = useEvm()

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
  const [contract, setContract] = useState<Contract>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { state, send } = useContractFunction(contract!, 'batchMint')
  
  const toast = useToast()

  const {
    isOpen: isAssetDrawerOpen,
    onOpen: onOpenAssetDrawer,
    onClose: onCloseAssetDrawer,
  } = useDisclosure()

  const dispatch = useDispatch()

  const { threadDBClient, threadID } = useTextile()

  useLayoutEffect(() => {
    if (contractAddress && chainId && library && account) {
      const implContract = getContract('metaImplementation', chainId)
      const contract = new Contract(contractAddress, implContract.abi, library)
      setContract(contract)
    }
  }, [chainId, library, account, contractAddress])

  useEffect(() => {
    if (!locationState) {
      navigate('/collections')
      return
    }

    // @ts-ignore
    setContractAddress(locationState.contractAddress)
    // @ts-ignore
    setContractName(locationState.contractName)
    // @ts-ignore
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
    // const ids = await nftAssets.map((instance: any) => instance['_id'])
    // await threadDBClient.delete(threadID, contractAddress, ids)

    setNftAssets(nftAssets || [])
    setIsLoading(false)
  }, [contractAddress, dispatch, threadDBClient, threadID])

  const setupListener = useCallback(() => {
    if (!threadDBClient || !threadID) return
    const callback = (update?: Update<any>) => {
      if (!update || !update.instance) return
      loadNFTAssets()
    }
    const listener = threadDBClient?.listen(
      threadID,
      [],
      callback
    )
    setThreadDBListener(listener)
  }, [threadDBClient, threadID])

  useEffect(() => {
    setIsLoading(true)
    if (!threadDBClient || !threadID) return
    loadNFTAssets()
  }, [threadDBClient, threadID, loadNFTAssets, dispatch])

  useEffect(() => {
    if (!threadDBClient || !threadID) return

    if (!threadDBListener) {
      setupListener()
    }
    return () => threadDBListener && threadDBListener.close()
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
        // console.log('uploading files with cid:', cid)
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
        // console.log(`Uploading... ${pct.toFixed(2)}% complete`)
      }
      try {
        const rootCid = await web3Storage?.put(sFiles, {
          onRootCidReady,
          onStoredChunk,
        })
        if (!rootCid) {
          console.error('no root id in web3 storage upload file response')
          return
        }
        const res = await web3Storage?.get(rootCid)
        if (!res || !res?.ok) {
          throw new Error(
            `failed to get ${rootCid} - [${res?.status}] ${res?.statusText}`
          )
        }
        
        const assetsWithCid: NftAsset[] = []
        // unpack File objects from the response
        const files = await res.files()
        for (const file of files) {
          const f = assetsMeta.filter((item) => item.name === file.name)
          const { cid, name, size, ...rest } = f[0]
          const md = {
            cid: cid ? cid : file.cid,
            name: name ? name : file.name,
            size: size ? size : file.size,
            ...rest
          }
          
          const asset = { contractAddress, modifier: account!, assetMetadata: md, _id: file.cid }
          await threadDBClient?.create(threadID!, contractAddress, [asset])
          assetsWithCid.push(asset)
        }
  
        setNftAssets((prevArray) => [...assetsWithCid, ...prevArray])
      } catch(err) {
        console.error(err)
      } finally {
        dispatch(setLoading(false))
      }
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

  const updateAsset = async (tokenIds: string[]) => {
    const sortedAssets = sortBy(nftAssets, ['name', 'assetMetadata.cid'])
      .filter((asset) => selectedAssetIds.includes(asset.assetMetadata.cid))

    try {
      sortedAssets.forEach(async (asset, idx) => {
        asset.creator = account!
        asset.minted = true
        asset.tokenId = tokenIds[idx] ? tokenIds[idx].toString() : ''
        await threadDBClient?.save(threadID!, contractAddress, [asset])
      })
    } catch(error: any) {
      console.error('Error to update asset, message:', error.message || error)
    }
    onSelectToMint()
    dispatch(setLoading(false))
  }

  useEffect(() => {
    if (!state || state.status === 'None') return

    if (state.status === 'Mining' || state.status === 'Success') {
      if (state.status === 'Success') {
        // @ts-ignore
        const tokenIds = state.receipt?.events?.find(e => e.event === 'BatchMintCompleted').args._tokenIds
        updateAsset(tokenIds)
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
      dispatch(setLoading(false))
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

  const onBatchMint = async () => {
    dispatch(setLoading(true))
    const tokenURIs = sortBy(nftAssets, ['name', 'assetMetadata.cid'])
      .filter((asset) => selectedAssetIds.includes(asset.assetMetadata.cid))
      .map((asset) => `https://ipfs.io/ipfs/${asset.nftMetadadtaCid}/${asset.name}.json`)
      
    await send(tokenURIs)
  }

  const onBatchTransfer = () => {}

  const onSelectToMint = () => {
    if (isDisableHeaderButtons) return
    const flag = !selectedToMint
    setSelectedToMint(flag)
    setSelectedToTransfer(false)
    setSelectedAssetIds([])

    if (flag) {
      setNftAssets(mintableAssets)
    } else {
      setNftAssets([])
      setIsLoading(true)
      loadNFTAssets()
    }
  }

  const onSelectToTransfer = () => {
    if (isDisableHeaderButtons) return

    setSelectedToMint(false)
    setSelectedToTransfer(!selectedToTransfer)
    setSelectedAssetIds([])
  }

  const mintableAssets = nftAssets.filter((asset) => !asset.tokenId && !asset.nftMetadadtaCid && !asset.minted)

  const isDisableHeaderButtons = chainId !== onChainId || !nftAssets || (nftAssets && nftAssets.length === 0) || mintableAssets.length === 0

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
          pb={'calc(60px + 1rem)'}
          {...getRootProps()}
          minH={'calc(100vh - 60px - 1rem)'}
        >
          <input {...getInputProps()} />

          {
            isLoading ? (
              <SimpleGrid columns={{sm: 2, md: 4}} spacing={3} mt={5}>
                {
                  Array.of(1, 2, 3, 4, 5, 6, 7, 8).map((v) => {
                    return (
                      <Box
                        key={v}
                        borderWidth='1px'
                        maxW={'sm'}
                        borderRadius='lg'
                        p={5}
                      >
                        <Skeleton
                          lineHeight={15}
                          borderRadius="lg"
                        >&nbsp;</Skeleton>
                        <SkeletonText mt='5' noOfLines={5} spacing='5' />
                      </Box>
                    )
                  })
                }
              </SimpleGrid>
            )
            : nftAssets && nftAssets.length === 0 ? (
              <Box>
                NFT Assets not found. You can drag & drop asset files to here, or
                click the Upload button on the top right to select asset files
              </Box>
            ) : (
              <SimpleGrid columns={{sm: 2, md: 4}} spacing={3} mt={5}>
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
