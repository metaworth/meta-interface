import { FC } from 'react'
import { SimpleGrid } from '@chakra-ui/react'
import NftAsset from '../../interfaces/NftAsset'
import AssetPreview from './AssetPreview'

interface AssetPreviewsProps {
  nftAssets: NftAsset[]
  selectedAssetIds: string[]
  onOpenAssetDrawer: (asset: NftAsset) => void
  onAssetSelectionToggle: (assetId: string) => void
  isSelectionEnabled: boolean
}

const AssetPreviews: FC<AssetPreviewsProps> = ({
  nftAssets,
  onOpenAssetDrawer,
  onAssetSelectionToggle,
  isSelectionEnabled,
  selectedAssetIds,
}) => {
  const previews = nftAssets.map((asset) => (
    <AssetPreview
      key={asset.assetMetadata.cid}
      asset={asset}
      onOpenAssetDrawer={onOpenAssetDrawer}
      onAssetSelectionToggle={onAssetSelectionToggle}
      isSelectionEnabled={isSelectionEnabled}
      isSelected={selectedAssetIds.includes(asset.assetMetadata.cid!)}
    />
  ))

  return (
    <>
      {previews}
    </>
  )
}

export default AssetPreviews
