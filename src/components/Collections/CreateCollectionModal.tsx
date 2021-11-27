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
import { useState, useEffect } from 'react'
import { useContractFunction } from '@web3app/core'
import { Contract } from '@ethersproject/contracts'
import { ThreadID } from '@textile/hub'
import useTextile from '../../hooks/use-textile'
import { useEthers } from 'web3-sdk'

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

  const { threadDBClient, threadID } = useTextile()

  //Mock the state.status change behavoir
  const [status, setStatus] = useState('')

  // @ts-ignore
  const { state, send } = useContractFunction(collectionContract, 'createNFT');

  useEffect(() => {
    (async () => {
      // const schema = {
      //   title: "Collections",
      //   type: "object",
      //   required: ["_id"],
      //   properties: {
      //     _id: {
      //       type: "string",
      //       description: "The instance's id.",
      //     },
      //     contractAddress: {
      //       type: "string",
      //       description: "Collection Contract Address",
      //     },
      //     ownerAddress: {
      //       type: "string",
      //       description: "Owner Address",
      //     },
      //     symbol: {
      //       type: "string",
      //       description: "Symbol",
      //     },
      //     description: {
      //       type: "string",
      //       description: "The description of the Collection",
      //     },
      //     collectionName: {
      //       type: "string",
      //       description: "The collections name.",
      //     },
      //     totalSupply: {
      //       description: "The number of supply",
      //       type: "integer",
      //       minimum: 0,
      //     },
      //   },
      // }
      // await threadDBClient?.newCollection(ThreadID.fromString(threadID), { name: 'testCollections', schema });
      if (status === 'Success') {
        if (!ownerAddress) return
        const collection = {
          contractAddress: Math.random().toString(),
          ownerAddress,
          symbol: symbol.toUpperCase(),
          description,
          collectionName,
          totalSupply
        }
        ownerAddress && await threadDBClient?.create(ThreadID.fromString(threadID), "testCollections", [collection])
        setStatus("")
        onClose();
      }
    })();
  }, [collectionName, description, onClose, ownerAddress, state, status, symbol, threadDBClient, threadID, totalSupply])

  const createCollection = (evt: React.FormEvent) => {
    evt.preventDefault();
    (async () => {
      // TODO: Step1: need to 
      // await send("3000000000000000000", '20', '2', '1', 'ipfs://testuri/', 'Meta Test' ,'ABC');
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
