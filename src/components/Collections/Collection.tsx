import { Box, Image, Text, Link, Badge } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { getExplorerAddressLink, shortenIfAddress, ChainId, getChainName } from '@dapptools/evm'
import { ExternalLinkIcon } from '@chakra-ui/icons'
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
      _hover={{ cursor: 'pointer' }}
    >
      <Image src={defaultCollImage} borderRadius='lg' mb='5' onClick={showCollectionDetails} />
      <Box fontSize='sm' fontWeight='bold' as='h4' mb='1.5' onClick={showCollectionDetails}>
        <Badge borderRadius='full' px='2' colorScheme='teal'>{getChainName(chainId!)}</Badge>
      </Box>
      <Box fontSize='sm' fontWeight='bold' as='h4' mb='1.5' onClick={showCollectionDetails}>
        <Text noOfLines={2}>{contractName}</Text>
      </Box>
      <Box fontSize='xs' fontWeight='medium' mb='1.5' onClick={showCollectionDetails}>
        <Text noOfLines={2}>{description}</Text>
      </Box>
      <Box color={'metaSecondary.500'} fontSize='xs' fontWeight='extrabold' onClick={showCollectionDetails}>
        {totalSupply} NFTs
      </Box>
      <Link
        fontSize='xs'
        isExternal={true}
        href={`${getExplorerAddressLink(contractAddress, chainId || ChainId.Mainnet)}`}>
          { shortenIfAddress(contractAddress) } <ExternalLinkIcon mx='2px' />
      </Link>
    </Box>
  )
}

export default Collection
