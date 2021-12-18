import { FC } from 'react'
import { Box, Image, Link, Flex, SlideFade } from '@chakra-ui/react'
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
      _hover={{ boxShadow: '0 10px 16px 0 rgb(0 0 0 / 20%), 0 6px 20px 0 rgb(0 0 0 / 19%)' }}
      p={4}
      onClick={onClick}
    >
      <Box height='10'>
        {isSelectionEnabled && (
          <Box mb='2'>
            <SlideFade offsetY='10px' in={isSelectionEnabled}>
              <CustomRoundedCheckbox
                isFullyChecked={isSelected}
              ></CustomRoundedCheckbox>
            </SlideFade>
          </Box>
        )}
      </Box>
      <Flex alignItems={'center'} height={200} justifyContent={'center'} overflow={'hidden'}>
        <Flex
          alignItems={'center'}
          justifyContent={'center'}
          overflow={'hidden'}
        >
          {
            file?.type?.startsWith('video') ? (
              <video
                width="90%"
                src={`${
                  file.cid ? `https://ipfs.io/ipfs/${file.cid}` : `${file.preview}`
                }`}
                autoPlay
                loop
                muted
                data-loaded="loaded"
                style={{'borderRadius': '0.5rem', 'maxHeight': '250px'}}
              />
            ) : (
              <Image
                src={`${
                  file.cid ? `https://ipfs.io/ipfs/${file.cid}` : `${file.preview}`
                }`}
                alt={file.name}
                maxH={200}
                lineHeight={200}
                borderRadius="lg"
              />
            )
          }
        </Flex>
      </Flex>

      <Box pt={2}>
        <Box
          fontWeight='semibold'
          as='h4'
          lineHeight='tight'
          isTruncated
          title={title || file?.name || file?.path}
        >
          {title || file?.name || file?.path}
        </Box>

        <Box
          fontWeight='extrabold'
          letterSpacing='wide'
          fontSize='xs'
          textTransform='uppercase'
        >
          {
            file.cid ? (
              <Flex direction={'row'}>
                IMAGE CID:&nbsp;
                <Link
                  d='flex'
                  color='gray.500'
                  alignItems='center'
                  href={`https://ipfs.io/ipfs/${file.cid}`}
                  isExternal
                  title={file.cid}
                >
                  {`${file.cid.slice(0, 8)}...${file.cid.substr(-8)}`}
                  <ExternalLinkIcon ml={2} />
                </Link>
              </Flex>
            ) : ''
          }
        </Box>
      </Box>
    </Box>
  )
}

export default AssetPreview
