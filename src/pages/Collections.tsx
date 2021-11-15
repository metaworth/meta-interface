import {
  Box,
  Container,
  Flex,
  Button,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { HiPlus } from 'react-icons/hi'
import CreateCollectionModal from '../components/Collections/CreateCollectionModal'

const Collections = () => {
  const color = useColorModeValue('black', 'black')
  const { isOpen, onOpen, onClose } = useDisclosure()

  const onCreateCollection = () => {
    onOpen()
  }

  return (
    <Container color={color} maxW={{ lg: '7xl' }}>
      <Box as={Flex} justifyContent={'space-between'} alignItems={'center'}>
        <Box fontWeight={'bold'} fontSize={'2xl'}>
          Collections
        </Box>
        <Button
          colorScheme='meta'
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

      <Box minH={'calc(100vh - 60px)'} mt={3}></Box>
      <CreateCollectionModal onClose={onClose} isOpen={isOpen} />
    </Container>
  )
}

export default Collections
