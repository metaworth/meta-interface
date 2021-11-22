import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  Center,
  FormControl,
  FormLabel,
  Input,
  Textarea,
} from '@chakra-ui/react'
import { useState } from 'react'

interface CreateCollectionModalProps {
  isOpen: boolean
  onClose: VoidFunction
}

const CreateCollectionModal: React.FC<CreateCollectionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [collectionName, setCollectionName] = useState('')
  const [description, setDescription] = useState('')

  const createCollection = (event: any) => {
    event.preventDefault()
    alert(
      `Form submitted with collection name: ${collectionName} and description: ${description}`
    )
    onClose()
  }

  const formId = 'create-collection-form'

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={'full'}>
      <ModalOverlay />
      <ModalContent alignItems='center' borderRadius='none'>
        <Box maxW='sm' width='sm' marginTop='36'>
          <ModalHeader marginBottom='16' padding='0' fontSize='2xl'>
            <Center>Create your collection </Center>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={createCollection} id={formId}>
              <FormControl isRequired>
                <FormLabel fontSize='sm'>Collection name</FormLabel>
                <Input
                  placeholder='Name your collection'
                  onChange={(event) =>
                    setCollectionName(event.currentTarget.value)
                  }
                  fontSize='sm'
                  marginBottom='5'
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize='sm'>Description</FormLabel>
                <Textarea
                  fontSize='sm'
                  onChange={(event) =>
                    setDescription(event.currentTarget.value)
                  }
                />
              </FormControl>
            </form>
          </ModalBody>
          <ModalFooter justifyContent='space-between'>
            <Button
              colorScheme='metaPrimary'
              variant='outline'
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button colorScheme='metaPrimary' type='submit' form={formId}>
              Submit
            </Button>
          </ModalFooter>
        </Box>
      </ModalContent>
    </Modal>
  )
}

export default CreateCollectionModal
