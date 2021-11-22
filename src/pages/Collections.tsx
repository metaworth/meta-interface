import {
  Box,
  Container,
  Flex,
  Button,
  useColorModeValue,
  useDisclosure,
  Grid,
} from '@chakra-ui/react'
import { useEffect } from 'react'
import { HiPlus } from 'react-icons/hi'
import Collection from '../components/Collections/Collection'
import CreateCollectionModal from '../components/Collections/CreateCollectionModal'
import CollectionInterface from '../interfaces/Collection'
const Collections = () => {
  const color = useColorModeValue('black', 'black')
  const { isOpen, onOpen, onClose } = useDisclosure()

  const onCreateCollection = () => {
    onOpen()
  }

  useEffect(() => {
    // TODO: Call api and save data to state
  })

  return (
    <Container color={color} maxW={{ lg: '7xl' }}>
      <Box as={Flex} justifyContent={'space-between'} alignItems={'center'}>
        <Box fontWeight={'bold'} fontSize={'2xl'}>
          Collections
        </Box>
        <Button
          colorScheme='metaPrimary'
          borderRadius={5}
          _active={{
            transform: 'scale(0.98)',
          }}
          leftIcon={<HiPlus />}
          size={'sm'}
          onClick={onCreateCollection}
          color='white'
        >
          Create Collection
        </Button>
      </Box>

      <Box minH={'calc(100vh - 60px)'} mt={3}>
        {/* TODO: No responsive designs given. Just adding 4 columns as default
        after following existing designs */}
        <Grid templateColumns='repeat(4, 1fr)' gap={5}>
          {mockCollectionsResponse.map((collection) => (
            <Collection collection={collection} key={collection.id} />
          ))}
        </Grid>
      </Box>
      <CreateCollectionModal onClose={onClose} isOpen={isOpen} />
    </Container>
  )
}

export default Collections

//TODO: Remove when connected to API
const mockCollectionsResponse: CollectionInterface[] = [
  {
    id: '1',
    name: 'Bored Ape Yatch Club 1',
    description:
      'The Bored Ape Yacht Club is a collection of 10,000 unique Bor',
    balance: 0,
    imageUrl: 'https://baconmockup.com/640/360',
  },
  {
    id: '2',
    name: 'Bored Ape Yatch Club 2',
    description:
      'The Bored Ape Yacht Club is a collection of 10,000 unique Bor',
    balance: 188,
    imageUrl: 'https://www.placecage.com/640/360',
  },
  {
    id: '3',
    name: 'Bored Ape Yatch Club 3',
    description:
      'The Bored Ape Yacht Club is a collection of 10,000 unique Bor',
    balance: 50,
    imageUrl: 'https://placekitten.com/640/360',
  },
  {
    id: '4',
    name: 'Bored Ape Yatch Club 4',
    description:
      'The Bored Ape Yacht Club is a collection of 10,000 unique Bor',
    balance: 100,
    imageUrl: 'https://baconmockup.com/640/360',
  },
  {
    id: '5',
    name: 'Bored Ape Yatch Club 5',
    description:
      'The Bored Ape Yacht Club is a collection of 10,000 unique Bor',
    balance: 0,
    imageUrl: 'https://baconmockup.com/640/360',
  },
]
