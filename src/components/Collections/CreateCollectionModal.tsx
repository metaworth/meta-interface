import { useCallback, useState, useEffect, useLayoutEffect } from 'react'
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
import { Contract } from '@ethersproject/contracts'
import {
  useEvm,
  useContractFunction,
  useContractCall,
  getExplorerTransactionLink,
  ChainId
} from '@dapplabs/evm'
import { useDispatch } from 'react-redux'
import { ethers } from 'ethers'
import { Interface } from '@ethersproject/abi'

import { setLoading } from '../../store'
import * as textileClient from '../../data/textileClient'
import * as collectionData from '../../data/collections'
import getContract from '../../helpers/contracts'

interface CreateCollectionModalProps {
  isOpen: boolean
  onClose: VoidFunction
}

const CreateCollectionModal: React.FC<CreateCollectionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { account: ownerAddress, chainId } = useEvm()

  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [predictedMetaAddress, setPredictedMetaAddress] = useState('')
  const [salt, setSalt] = useState('')
  const [collectionName, setCollectionName] = useState('')
  const [description, setDescription] = useState('')
  const [symbol, setSymbol] = useState('')
  const [totalSupply, setTotalSupply] = useState(0)
  const [numberOfReserved, setNumberOfReserved] = useState(0)
  const [maxTokensPerWallet, setMaxTokensPerWallet] = useState(0)
  const [contractAddress, setContractAddress] = useState<string>('')
  const [contractAbi, setContractAbi] = useState<Interface>()
  const [contract, setContract] = useState<Contract>()

  const toast = useToast()
  const dispatch = useDispatch()

  useLayoutEffect(() => {
    if (chainId) {
      const collectionContract = getContract('collection', chainId)
      if (!collectionContract) return

      setContractAddress(collectionContract.address)
      setContractAbi(collectionContract.abi)

      const contract = new Contract(collectionContract.address, collectionContract.abi)
      setContract(contract)
    }
  }, [chainId])

  // @ts-ignore
  const { state, send } = useContractFunction(contract, 'createNFT')
  const [predictedMetaAddr] = useContractCall(
    ownerAddress &&
      contractAddress && 
        contractAbi &&
          salt && {
            abi: contractAbi,
            address: contractAddress,
            method: 'predictMetaAddress',
            args: [salt],
          }
  ) ?? []

  useEffect(() => {
    if (predictedMetaAddr) {
      setPredictedMetaAddress(predictedMetaAddr)
    }
  }, [predictedMetaAddr])

  const checkTxStatus = useCallback(async () => {
    if (!state || state.status === 'None') return

    if (state.status === 'Success') {
      if (!ownerAddress) return
      const collection: collectionData.Collection = {
        contractAddress: predictedMetaAddress,
        ownerAddress,
        collectionName,
        symbol: symbol.toUpperCase(),
        totalSupply,
        description,
        numberOfReserved,
        maxTokensPerWallet
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

      onModalClose()
    } else if (state.status === 'Exception' || state.status === 'Fail') {
      toast({
        title: `${state.status}`,
        status: 'error',
        variant: 'left-accent',
        position: 'top-right',
        isClosable: true,
        render: () => (
          <Box color="white" p={3} bg="red" borderRadius={5}>
            { state.errorMessage }
          </Box>
        )
      })
    }
  }, [state])

  useEffect(() => {
    checkTxStatus()
  }, [state])

  const createCollection = async () => {
    setIsCreating(true)
    dispatch(setLoading(true))
    try {
      const salt = ethers.utils.formatBytes32String(`${collectionName}-${symbol}`)
      setSalt(salt)
      const price = ethers.utils.parseEther('0.03')
      await send(
        salt,
        price,
        totalSupply ? totalSupply : 0,
        numberOfReserved ? numberOfReserved : 0,
        maxTokensPerWallet ? maxTokensPerWallet : 0,
        '',
        collectionName,
        symbol
      )
    } catch (err: any) {
      console.error('Error to send create collection tx, error message:', err.message || err)
    } finally {
      dispatch(setLoading(false))
      setIsCreating(false)
    }
  }

  const resetForm = () => {
    setCollectionName('')
    setSymbol('')
    setTotalSupply(0)
    setNumberOfReserved(0)
    setMaxTokensPerWallet(0)
    setDescription('')
  }

  const onModalClose = () => {
    resetForm()
    onClose()
  }

  const isValidForm = !!collectionName && !!symbol && !!totalSupply

  return (
    <Modal isOpen={isOpen} onClose={onModalClose} size={'full'}>
      <ModalOverlay />
      <ModalContent alignItems='center' borderRadius='none'>
        <Box maxW='sm' width='sm' marginTop='16'>
          <ModalHeader marginBottom='5' fontSize='2xl'>
            <Center>Create your collection </Center>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel fontSize='sm'>Collection Name</FormLabel>
              <Input
                placeholder='Name the collection'
                onChange={(event) =>
                  setCollectionName(event.currentTarget.value)
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
              <FormLabel fontSize='sm'>Total Supply</FormLabel>
              <Input
                placeholder='Total Supply'
                pattern="[0-9]*"
                type='number'
                onChange={(event) =>
                  setTotalSupply(Number(event.currentTarget.value))
                }
                fontSize='sm'
                marginBottom='5'
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize='sm'>Number of Reserved</FormLabel>
              <Input
                placeholder='The number of reserved NFTs'
                pattern="[0-9]*"
                type='number'
                onChange={(event) =>
                  setNumberOfReserved(Number(event.currentTarget.value))
                }
                fontSize='sm'
                marginBottom='5'
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize='sm'>Max Tokens per Wallet</FormLabel>
              <Input
                placeholder='The max NFTs per wallet'
                pattern="[0-9]*"
                type='number'
                onChange={(event) =>
                  setMaxTokensPerWallet(Number(event.currentTarget.value))
                }
                fontSize='sm'
                marginBottom='5'
              />
            </FormControl>
            <FormControl>
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
              onClick={onModalClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button colorScheme='metaPrimary' type='submit' isLoading={isCreating} disabled={!isValidForm} onClick={() => createCollection()}>
              Submit
            </Button>
          </ModalFooter>
        </Box>
      </ModalContent>
    </Modal>
  )
}

export default CreateCollectionModal
