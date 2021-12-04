import {
  Box,
  Container,
  Flex,
  Button,
  useColorModeValue,
  useDisclosure,
  Grid,
} from '@chakra-ui/react'
import { useEffect, useState, useCallback } from 'react'
import { HiPlus } from 'react-icons/hi'
import { ThreadID } from '@textile/hub'
import { Update } from '@textile/hub'
import { useEthers } from 'web3-sdk'
import { useDispatch } from 'react-redux'


import Collection from '../components/Collections/Collection'
import CreateCollectionModal from '../components/Collections/CreateCollectionModal'
import useTextile from '../hooks/use-textile'
import CollectionInterface from '../interfaces/Collection'
import * as textileClient from "../data/textileClient";
import * as collectionData from "../data/collections";
import { setLoading } from '../store'

const loadCollections = async (ownerAddress: string): Promise<CollectionInterface[]> => {  
  const client = await textileClient.defaultThreadDbClientWithThreadID;
  const storedCollections = await collectionData.getCollectionByOwerAddress(client, ownerAddress)

  return storedCollections.map((collection) => ({
    ...collection,
    id: collection._id
  })) as CollectionInterface[]
}

const Collections = () => {
  const { account: ownerAddress } = useEthers();
  const color = useColorModeValue('black', 'black')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { threadDBClient, threadID } = useTextile()
  const [threadDBListener, setThreadDBListener] = useState<any>()
  const dispatch = useDispatch()

  const [collections, setCollections] = useState<CollectionInterface[]>([]);
  const onCreateCollection = () => {
    onOpen()
  }

  const setupListener = useCallback(() => {
    if (!threadDBClient || !threadID || !ownerAddress) return
    const callback = (update?: Update<any>) => {
      if (!update || !update.instance) return

      (async () => {
        const existedCollections = await loadCollections(ownerAddress)
        setCollections(existedCollections)
      })();
    }
    const listener = threadDBClient?.listen(
      ThreadID.fromString(threadID),
      [],
      callback
    )
    setThreadDBListener(listener)
  }, [ownerAddress, threadDBClient, threadID])

  useEffect(() => {
    if (!threadDBClient || !threadID) return

    if (!threadDBListener) {
      setupListener()
    }
  }, [threadDBClient, threadID, threadDBListener, setupListener])

  useEffect(() => {
    dispatch(setLoading(true))
    if (!threadDBClient || !threadID || !ownerAddress) return
    (async () => {
      const existedCollections = await loadCollections(ownerAddress);
      setCollections(existedCollections)
      dispatch(setLoading(false))
    })()
  }, [dispatch, ownerAddress, threadDBClient, threadID])

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
        {/* TODO: No responsive designs given. Just adding 4 columns as default after following existing designs */}
        <Grid templateColumns='repeat(4, 1fr)' gap={5}>
          {collections.map((collection) => (
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
const mockCollections: CollectionInterface[] = [
  {
    id: '1',
    collectionName: 'Bored Ape Yatch Club 1',
    description:
      'The Bored Ape Yacht Club is a collection of 10,000 unique Bor',
    totalSupply: 0,
    imageUrl: 'https://baconmockup.com/640/360',
    symbol: "BORED1",
    contractAddress: Math.random().toString()
  },
  {
    id: '2',
    collectionName: 'Bored Ape Yatch Club 2',
    description:
      'The Bored Ape Yacht Club is a collection of 10,000 unique Bor',
    totalSupply: 188,
    imageUrl: 'https://www.placecage.com/640/360',
    symbol: "BORED2",
    contractAddress: Math.random().toString()
  },
  {
    id: '3',
    collectionName: 'Bored Ape Yatch Club 3',
    description:
      'The Bored Ape Yacht Club is a collection of 10,000 unique Bor',
    totalSupply: 50,
    imageUrl: 'https://placekitten.com/640/360',
    symbol: "BORED3",
    contractAddress: Math.random().toString()
  },
  {
    id: '4',
    collectionName: 'Bored Ape Yatch Club 4',
    description:
      'The Bored Ape Yacht Club is a collection of 10,000 unique Bor',
    totalSupply: 100,
    imageUrl: 'https://baconmockup.com/640/360',
    symbol: "BORED4",
    contractAddress: Math.random().toString()
  },
  {
    id: '5',
    collectionName: 'Bored Ape Yatch Club 5',
    description:
      'The Bored Ape Yacht Club is a collection of 10,000 unique Bor',
    totalSupply: 0,
    imageUrl: 'https://baconmockup.com/640/360',
    symbol: "BORED5",
    contractAddress: Math.random().toString()
  },
]
