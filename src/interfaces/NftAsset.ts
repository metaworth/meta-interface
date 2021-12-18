import FileMetadata from './FileMetadata'

interface NftAsset {
  id?: string
  assetMetadata: FileMetadata
  nftMetadadtaCid?: string
  name?: string
  desc?: string
  tokenId?: string
  sellOrder?: any
  minted?: boolean
  creator?: string
  contractAddress?: string
  modifier?: string
}

export default NftAsset
