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
import { Update } from '@textile/hub'
import { useEvm } from '@dapptools/evm'
import { useDispatch } from 'react-redux'

import Collection from '../components/Collections/Collection'
import CreateCollectionModal from '../components/Collections/CreateCollectionModal'
import useTextile from '../hooks/useTextile'
import CollectionInterface from '../interfaces/Collection'
import { getThreadDbClientWithThreadID } from '../data/textileClient'
import { getCollectionByOwerAddress } from '../data/collections'
import { setLoading } from '../store'


const loadCollections = async (ownerAddress: string): Promise<CollectionInterface[]> => {  
  const client = await getThreadDbClientWithThreadID()
  const storedCollections = await getCollectionByOwerAddress(client, ownerAddress)

  return storedCollections.map((collection) => ({
    ...collection,
    id: collection._id
  })) as CollectionInterface[]
}

const Collections = () => {
  const color = useColorModeValue('black', 'black')

  const { account: ownerAddress } = useEvm()
  const { threadDBClient, threadID } = useTextile()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const dispatch = useDispatch()

  const [threadDBListener, setThreadDBListener] = useState<any>()
  const [collections, setCollections] = useState<CollectionInterface[]>([])

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
      })()
    }

    const listener = threadDBClient.listen(
      threadID,
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
      const existedCollections = await loadCollections(ownerAddress)
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
          colorScheme={useColorModeValue('metaPrimary', 'metaPrimary')}
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
      {
        collections.length > 0 ? (
          <Grid templateColumns='repeat(4, 1fr)' gap={5}>
            {collections.map((collection) => (
              <Collection collection={collection} key={collection.id} />
            ))}
          </Grid>
        ) : (
          'No collections found'
        )
      }
      </Box>
      {
        isOpen  ? <CreateCollectionModal onClose={onClose} isOpen={isOpen} /> : ''
      }
    </Container>
  )
}

export default Collections
