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
  Link,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  InputGroup,
  InputRightAddon,
} from '@chakra-ui/react'
import {
  useEvm,
  useContractFunction,
  useContractCall,
  getExplorerTransactionLink,
  ChainId,
  shortenIfTransactionHash,
  getCurrencySymbol
} from '@dapptools/evm'
import { useDispatch } from 'react-redux'
import { Contract, ethers } from 'ethers'
import { Interface } from '@ethersproject/abi'

import { setLoading } from '../../store'
import { getThreadDbClientWithThreadID } from '../../data/textileClient'
import { Collection, addDataToThread } from '../../data/collections'
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
  const [maxTokensPerWallet, setMaxTokensPerWallet] = useState(1)
  const [contractAddress, setContractAddress] = useState<string>('')
  const [mintPrice, setMintPrice] = useState<string>('');
  const [contractAbi, setContractAbi] = useState<Interface>()
  const [contract, setContract] = useState<Contract>()

  const toast = useToast()
  const dispatch = useDispatch()

  useLayoutEffect(() => {
    if (chainId) {
      const collectionContract = getContract('factory', chainId)
      if (!collectionContract) return

      setContractAddress(collectionContract.address)
      setContractAbi(collectionContract.abi)

      const contract = new Contract(collectionContract.address, collectionContract.abi)
      setContract(contract)
    }
  }, [chainId])

  const { state, send } = useContractFunction(contract!, 'createNFT')
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
    if (!chainId || !state || state.status === 'None') return

    if (state.status === 'Success') {
      if (!ownerAddress) return
      const collection: Collection = {
        contractAddress: predictedMetaAddress,
        ownerAddress,
        contractName: collectionName,
        chainId,
        symbol: symbol.toUpperCase(),
        totalSupply: !!totalSupply ? totalSupply : 0,
        description,
        numberOfReserved: !!numberOfReserved ? numberOfReserved : 0,
        maxTokensPerWallet: !!maxTokensPerWallet ? maxTokensPerWallet : 1,
      }
      const dbClient = await getThreadDbClientWithThreadID()
      await addDataToThread(dbClient, collection)
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
                  <Link
                    isExternal={true}
                    href={`${getExplorerTransactionLink(state.transaction.hash, chainId || ChainId.Mainnet)}`}>
                      { shortenIfTransactionHash(state.transaction.hash) }
                  </Link>
                </>
              ) : ''
            }
          </Box>
        )
      })

      onModalClose()
      dispatch(setLoading(false))
      setIsCreating(false)
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
      dispatch(setLoading(false))
      setIsCreating(false)
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
      const price = mintPrice ? ethers.utils.parseEther(mintPrice) : 0
      await send(
        salt,
        price,
        totalSupply ? totalSupply : 0,
        numberOfReserved ? numberOfReserved : 0,
        maxTokensPerWallet ? maxTokensPerWallet : 1,
        '',
        collectionName,
        symbol
      )
    } catch (err: any) {
      console.error('Error to send create collection tx, error message:', err.message || err)
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
                onChange={(event) => setCollectionName(event.currentTarget.value)}
                fontSize='sm'
                marginBottom='5'
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize='sm'>Symbol</FormLabel>
              <Input
                placeholder='Symbol'
                onChange={(event) => setSymbol(event.currentTarget.value)}
                fontSize='sm'
                marginBottom='5'
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize='sm'>Total Supply</FormLabel>
              <NumberInput
                min={0}
                onChange={(value) => setTotalSupply(Number(value))}
                fontSize='sm'
                marginBottom='5'
              >
                <NumberInputField fontSize='sm' placeholder='Total Supply' />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel fontSize='sm'>Number of Reserved</FormLabel>
              <NumberInput
                min={1}
                onChange={(value) => setNumberOfReserved(Number(value))}
                fontSize='sm'
                marginBottom='5'
              >
                <NumberInputField fontSize='sm' placeholder='The number of reserved NFTs' />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel fontSize='sm'>Max Tokens per Wallet</FormLabel>
              <NumberInput
                min={1}
                onChange={(value) => setMaxTokensPerWallet(Number(value))}
                fontSize='sm'
                marginBottom='5'
              >
                <NumberInputField fontSize='sm' placeholder='The max NFTs per wallet' />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel fontSize='sm'>Mint Price</FormLabel>
              <InputGroup>
                <NumberInput
                  min={0}
                  onChange={(value) => setMintPrice(value)}
                  fontSize='sm'
                  marginBottom='5'
                >
                  <NumberInputField fontSize='sm' placeholder='Mint price, e.g. 0.03' borderRightRadius={0} />
                </NumberInput>
                <InputRightAddon children={getCurrencySymbol(chainId!)} />
              </InputGroup>
            </FormControl>
            <FormControl>
              <FormLabel fontSize='sm'>Description</FormLabel>
              <Textarea
                fontSize='sm'
                value={description}
                onChange={(event) => setDescription(event.currentTarget.value)}
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
