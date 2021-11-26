import { FC } from 'react'
import { Box, Image, Link, Flex, ScaleFade, Slide, SlideFade } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import NftAsset from '../../interfaces/NftAsset'
import { CustomRoundedCheckbox } from './MintButton/CustomRoundedCheckbox'

interface AssetPreviewProps {
  asset: NftAsset
  isSelected: boolean
  isSelectionEnabled: boolean
  onAssetSelectionToggle: (assetId: string) => void
  onOpenAssetDrawer: (asset: NftAsset) => void
}

const AssetPreview: FC<AssetPreviewProps> = ({
  asset,
  isSelected,
  isSelectionEnabled,
  onAssetSelectionToggle,
  onOpenAssetDrawer,
}) => {
  const { assetMetadata: file, name: title } = asset

  const onClick = () => {
    if (!isSelectionEnabled) {
      onOpenAssetDrawer(asset)
      return
    }
    if (asset.assetMetadata.cid) onAssetSelectionToggle(asset.assetMetadata.cid) // Not sure why id is optional
  }

  return (
    <Box
      cursor='pointer'
      key={file.cid}
      borderWidth='1px'
      maxW={'sm'}
      borderRadius='lg'
      overflow='hidden'
      p='5'
      onClick={onClick}
    >
      <Box height='10'>
        {isSelectionEnabled && (
          <Box mb='5'>
            <SlideFade offsetY='10px' in={isSelectionEnabled}>
              <CustomRoundedCheckbox
                isFullyChecked={isSelected}
              ></CustomRoundedCheckbox>
            </SlideFade>
          </Box>
        )}
      </Box>
      <Flex alignItems={'center'} justifyContent={'center'} overflow={'hidden'}>
        <Flex
          alignItems={'center'}
          justifyContent={'center'}
          overflow={'hidden'}
        >
          <Image
            src={`${
              file.cid ? `https://ipfs.io/ipfs/${file.cid}` : `${file.preview}`
            }`}
            alt={file.name}
            className='abc'
          />
        </Flex>
      </Flex>

      <Box p='3'>
        <Box
          mt='1'
          fontWeight='semibold'
          as='h4'
          lineHeight='tight'
          isTruncated
          title={title || file?.name || file?.path}
        >
          {title || file?.name || file?.path}
        </Box>

        <Box
          color='gray.500'
          fontWeight='extrabold'
          letterSpacing='wide'
          fontSize='xs'
          textTransform='uppercase'
        >
          {file.cid ? (
            <Link
              d='flex'
              alignItems='center'
              href={`https://ipfs.io/ipfs/${file.cid}`}
              isExternal
              title={file.cid}
            >
              {`${file.cid.slice(0, 8)}...${file.cid.substr(-8)}`}
              <ExternalLinkIcon ml={2} />
            </Link>
          ) : (
            ''
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default AssetPreview
