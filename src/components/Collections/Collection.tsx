import { Box, Image, Text } from '@chakra-ui/react'
import { useEvm } from '@dapplabs/evm'
import CollectionInterface from '../../interfaces/Collection'
import defaultCollImage from '../../assets/images/default-collection.png'

interface CollectionProps {
  collection: CollectionInterface
}

const Collection: React.FC<CollectionProps> = ({ collection }) => {
  const { totalSupply, description, collectionName } = collection

  const { chainId } = useEvm()

  const showCollectionDetails = () => {
    alert(`Should go to collection details page - ${chainId}`)
  }

  return (
    <Box
      maxW='sm'
      borderWidth='1px'
      borderRadius='lg'
      overflow='hidden'
      bg='#ffffff'
      p='5'
      _hover={{ bg: '', cursor: 'pointer' }}
      onClick={showCollectionDetails}
    >
      <Image src={defaultCollImage} borderRadius='lg' mb='5' />
      <Box fontSize='sm' fontWeight='bold' as='h4' mb='1.5'>
        {collectionName}
      </Box>
      <Box fontSize='xs' fontWeight='medium' mb='1.5'>
        <Text noOfLines={2}>{description}</Text>
      </Box>
      <Box color={'metaSecondary.500'} fontSize='xs' fontWeight='extrabold'>
        {totalSupply} NFTs
      </Box>
    </Box>
  )
}

export default Collection
