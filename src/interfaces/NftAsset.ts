import FileMetadata from './FileMetadata'

interface NftAsset {
  id?: string
  assetMetadata: FileMetadata
  nftMetadadtaCid?: string
  title?: string
  desc?: string
  tokenId?: string
  sellOrder?: any
}

export default NftAsset
