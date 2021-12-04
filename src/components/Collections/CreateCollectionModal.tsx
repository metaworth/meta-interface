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
  useToast
} from '@chakra-ui/react'
import { setLoading } from '../../store'
import { useState, useEffect } from 'react'
import { useContractFunction } from '@web3app/core'
import { Contract } from '@ethersproject/contracts'
import { useEthers } from 'web3-sdk'
import { useDispatch } from 'react-redux'

import * as textileClient from "../../data/textileClient";
import * as collectionData from "../../data/collections";

interface CreateCollectionModalProps {
  isOpen: boolean
  onClose: VoidFunction
}

const CollectionContractAddr = '0x3bc9f0Bb6b0c5e3dC9a7BF74a82325Ad1eB1E18c'
const CollectionContractAbi = [
  'function createNFT(uint256 _startPrice, uint256 _maxSupply, uint256 _nReserved, uint256 _maxTokensPerMint, string memory _uri, string memory _name, string memory _symbol) external'
];
const collectionContract = new Contract(CollectionContractAddr, CollectionContractAbi)

const CreateCollectionModal: React.FC<CreateCollectionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { account: ownerAddress } = useEthers();
  const [collectionName, setCollectionName] = useState('')
  const [description, setDescription] = useState('')
  const [symbol, setSymbol] = useState('')
  const [totalSupply, setTotalSupply] = useState(0)
  const toast = useToast()
  const dispatch = useDispatch()

  //Mock the state.status change behavoir
  const [status, setStatus] = useState('')

  // @ts-ignore
  const { state, send } = useContractFunction(collectionContract, 'createNFT');

  useEffect(() => {
    (async () => {
      if (status === 'Success') {
        if (!ownerAddress) return
        const collection: collectionData.Collection = {
          contractAddress: Math.random().toString(),
          ownerAddress,
          symbol: symbol.toUpperCase(),
          description,
          collectionName,
          totalSupply
        }
        const dbClient = await textileClient.defaultThreadDbClientWithThreadID;
        await collectionData.createCollection(dbClient, collection);
        toast({
          title: `${status}`,
          status: 'success',
          variant: 'left-accent',
          position: 'top-right',
          isClosable: true,
          render: () => (
            <Box color="white" p={3} bg={'teal'} borderRadius={5}>
              {
                (
                  <>
                    <Box>{status}</Box>
                    <span>Collection Name: {collectionName} for {ownerAddress}</span>
                  </>
                )
              }
            </Box>
          )
        })
        dispatch(setLoading(false))
        setStatus("")
        onClose();
      }
    })();
  }, [collectionName, description, onClose, ownerAddress, state, status, symbol, toast, totalSupply])

  const createCollection = (evt: React.FormEvent) => {
    evt.preventDefault();
    (async () => {
      // TODO: Step1: need to 
      // await send("3000000000000000000", '20', '2', '1', 'ipfs://testuri/', 'Meta Test' ,'ABC');
      dispatch(setLoading(true))
      setTimeout(() => {
        // Mock the state.status change behavoir
        setStatus('Success');
      }, 1000);
    })()
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
                <FormLabel fontSize='sm'>Total Supply</FormLabel>
                <Input
                  placeholder='Total Supply'
                  pattern="[0-9]*"
                  type='number'
                  onChange={(event) =>
                    setTotalSupply(parseInt(event.currentTarget.value))
                  }
                  fontSize='sm'
                  marginBottom='5'
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize='sm'>Symbol</FormLabel>
                <Input
                  placeholder='Symbol'
                  onChange={(event) =>
                    setSymbol(event.currentTarget.value)
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
