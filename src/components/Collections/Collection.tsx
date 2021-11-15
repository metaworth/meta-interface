import { Box, Image, Text } from '@chakra-ui/react'
import CollectionInterface from '../../interfaces/Collection'

interface CollectionProps {
  collection: CollectionInterface
}

const Collection: React.FC<CollectionProps> = ({ collection }) => {
  const { balance, imageUrl, description, name } = collection

  const showCollectionDetails = () => {
    alert(`Should go to collection details page`)
  }

  return (
    <Box
      maxW='sm'
      borderWidth='1px'
      borderRadius='lg'
      overflow='hidden'
      bg='#ffffff'
      p='5'
      // TODO: Not sure what hover color is meant to be
      _hover={{ bg: '', cursor: 'pointer' }}
      onClick={showCollectionDetails}
    >
      {/* TODO: Not sure about image sizing. Not sure if the images will be
      correctly sized or this element needs a set height and width */}
      <Image src={imageUrl} borderRadius='lg' mb='5' />
      <Box fontSize='sm' fontWeight='bold' as='h4' mb='1.5'>
        {name}
      </Box>
      <Box fontSize='xs' fontWeight='medium' mb='1.5'>
        <Text noOfLines={2}>{description}</Text>
      </Box>
      <Box color={'metaSecondary.500'} fontSize='xs' fontWeight='extrabold'>
        {balance} NFTs
      </Box>
    </Box>
  )
}

export default Collection
