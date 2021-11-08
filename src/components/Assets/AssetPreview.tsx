import { FC } from 'react'
import {
  Box,
  Image,
  Link,
  Flex,
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import NftAsset from '../../interfaces/NftAsset'
import FileMetadata from '../../interfaces/FileMetadata'

interface AssetPreviewProps {
  nftAssets: NftAsset[]
  onAssetSelected: (asset: FileMetadata) => void
}

const AssetPreview: FC<AssetPreviewProps> = ({ nftAssets, onAssetSelected }) => {

  const previews = nftAssets.map(({ assetMetadata: file, title, desc }) => (
    <Box cursor="pointer" key={file.cid} borderWidth="1px" maxW={'sm'} borderRadius="lg" overflow="hidden" onClick={() => onAssetSelected(file)}>
      <Flex height={300} alignItems={'center'} justifyContent={'center'}  overflow={'hidden'}>
        <Flex alignItems={'center'} justifyContent={'center'} overflow={'hidden'}>
          <Image src={`${file.cid ? `https://ipfs.io/ipfs/${file.cid}` : `${file.preview}`}`} alt={file.name} className="abc"/>
        </Flex>
      </Flex>

      <Box p="3">
        <Box
          mt="1"
          fontWeight="semibold"
          as="h4"
          lineHeight="tight"
          isTruncated
          title={title || file?.name || file?.path}
        >
          {title || file?.name || file?.path}
        </Box>

        <Box
          color="gray.500"
          fontWeight="extrabold"
          letterSpacing="wide"
          fontSize="xs"
          textTransform="uppercase"
        >
          {
            file.cid ? (
              <Link d="flex" alignItems="center" href={`https://ipfs.io/ipfs/${file.cid}`} isExternal title={file.cid}>
                {`${file.cid.slice(0, 8)}...${file.cid.substr(-8)}`} <ExternalLinkIcon ml={2} />
              </Link>
            ) : ''
          }
        </Box>
      </Box>

    </Box>
  ))

  return (
    <>
      {previews}
    </>
  )
}

export default AssetPreview
