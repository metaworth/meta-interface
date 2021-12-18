import { Box, Image, Text } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import CollectionInterface from '../../interfaces/Collection'
import defaultCollImage from '../../assets/images/default-collection.png'

interface CollectionProps {
  collection: CollectionInterface
}

const Collection: React.FC<CollectionProps> = ({ collection }) => {
  const { totalSupply, description, contractName, contractAddress, chainId } = collection

  const navigate = useNavigate()

  const showCollectionDetails = () => {
    navigate('/collections/assets',{ state: { contractAddress, contractName, chainId } })
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
        {contractName}
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
