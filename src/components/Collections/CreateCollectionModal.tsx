import { useCallback } from 'react'
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
  useToast,
  Link
} from '@chakra-ui/react'
import { setLoading } from '../../store'
import { useState, useEffect } from 'react'
import { Contract } from '@ethersproject/contracts'
import {
  useEthers,
  useContractFunction,
  useContractCall,
  getExplorerTransactionLink,
  ChainId
} from '@web3app/core'
import { useDispatch } from 'react-redux'
import { ethers } from 'ethers'
import { Interface } from '@ethersproject/abi'

import * as textileClient from '../../data/textileClient'
import * as collectionData from '../../data/collections'

interface CreateCollectionModalProps {
  isOpen: boolean
  onClose: VoidFunction
}

const CollectionContractAddr = '0xa6c5bE3B80BFf6EB7852B059a06A7eE9B05938bf'
const CollectionContractAbi = new Interface([
  'function predictMetaAddress(bytes32 salt) external view returns (address)',
  'function createNFT(bytes32 salt, uint256 _startPrice, uint256 _maxSupply, uint256 _nReserved, uint256 _maxTokensPerMint, string memory _uri, string memory _name, string memory _symbol) external'
])
const collectionContract = new Contract(CollectionContractAddr, CollectionContractAbi)

const CreateCollectionModal: React.FC<CreateCollectionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { account: ownerAddress, chainId } = useEthers()

  const [contractAddress, setContractAddress] = useState('')
  const [salt, setSalt] = useState('')
  const [collectionName, setCollectionName] = useState('')
  const [description, setDescription] = useState('')
  const [symbol, setSymbol] = useState('')
  const [totalSupply, setTotalSupply] = useState(0)
  const toast = useToast()
  const dispatch = useDispatch()

  // @ts-ignore
  const { state, send } = useContractFunction(collectionContract, 'createNFT')
  const [contractAddr] = useContractCall(
    ownerAddress &&
      CollectionContractAddr && 
        salt && {
          abi: CollectionContractAbi,
          address: CollectionContractAddr,
          method: 'predictMetaAddress',
          args: [salt],
        }
  ) ?? []

  useEffect(() => {
    if (contractAddr) {
      setContractAddress(contractAddr)
    }
  }, [contractAddr])

  const checkTxStatus = useCallback(async () => {
    if (!state || state.status === 'None') return

    if (state.status === 'Success') {
      if (!ownerAddress) return
      const collection: collectionData.Collection = {
        contractAddress: contractAddress,
        ownerAddress,
        symbol: symbol.toUpperCase(),
        description,
        collectionName,
        totalSupply
      }
      const dbClient = await textileClient.defaultThreadDbClientWithThreadID
      await collectionData.createCollection(dbClient, collection)
      toast({
        title: `${state.status}`,
        status: 'success',
        variant: 'left-accent',
        position: 'top-right',
        isClosable: true,
        render: () => (
          <Box color="white" p={3} bg={'teal'} borderRadius={5}>
            {
              state.transaction?.hash ? (
                <>
                  <Box>{state.status}</Box>
                  <span>Tx hash: </span>
                  <Link isExternal={true} href={`${getExplorerTransactionLink(state.transaction?.hash, chainId || ChainId.Mainnet)}`}>{`${state.transaction?.hash.substr(0, 8)}...${state.transaction?.hash.substr(-8)}`}</Link>
                </>
              ) : ''
            }
          </Box>
        )
      })
      onClose()
    } else if (state.status === 'Exception' || state.status === 'Fail') {
      toast({
        title: `${state.status}`,
        status: 'error',
        variant: 'left-accent',
        position: 'top-right',
        isClosable: true,
        render: () => (
          <Box color="white" p={3} bg="red" borderRadius={5}>
            {
              state.transaction?.hash ? (
                <>
                  <span>Tx hash:</span>
                  <Link isExternal={true} href={`${getExplorerTransactionLink(state.transaction?.hash, chainId || ChainId.Mainnet)}`}>{`${state.transaction?.hash.substr(0, 8)}...${state.transaction?.hash.substr(-8)}`}</Link>
                </>
              ) : ''
            }
          </Box>
        )
      })
    }
  }, [state])

  useEffect(() => {
    checkTxStatus()
  }, [state])

  const createCollection = async () => {
    dispatch(setLoading(true))
    try {
      const salt = ethers.utils.formatBytes32String(`${collectionName}-${symbol}`)
      setSalt(salt)
      const price = ethers.utils.parseEther('0.03')
      await send(salt, price, totalSupply, '1', '1', '', collectionName, symbol)
    } catch (err: any) {
      console.error('Error to send create collection tx, error message:', err.message || err)
    } finally {
      dispatch(setLoading(false))
    }
  }

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
          </ModalBody>
          <ModalFooter justifyContent='space-between'>
            <Button
              colorScheme='metaPrimary'
              variant='outline'
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button colorScheme='metaPrimary' type='submit' onClick={() => createCollection()}>
              Submit
            </Button>
          </ModalFooter>
        </Box>
      </ModalContent>
    </Modal>
  )
}

export default CreateCollectionModal
