import { FC, useState } from 'react'
import {
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  GridItem,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'
import { FaPlus, FaMinus } from 'react-icons/fa'
import AssetMetadata from '../AssetMetadata'
import FileMetadata from '../../interfaces/FileMetadata'

interface AssetDrawerProps {
  isOpen: boolean
  selectedAsset: FileMetadata | undefined
  onClose: () => void
}

const AssetDrawer: FC<AssetDrawerProps> = ({ onClose, isOpen, selectedAsset }) => {
  const color = useColorModeValue('black', 'black')

  const [title, setTitle] = useState()
  const [desc, setDesc] = useState()
  const [tokenId, setTokenId] = useState('')
  const [isMinted, setIsMinted] = useState(false)

  const { isOpen: isMintOpen, onOpen: onMintOpen, onClose: onMintClose } = useDisclosure()

  /**
	 * Mint Nft
	 */
	const lazyMint = async () => {
    onMintOpen()

    console.log('lazy mint')

    onMintClose()
	}

  return (
    <>
      <Drawer
        placement="right"
        onClose={onClose}
        isOpen={isOpen}
        closeOnEsc={true}
        closeOnOverlayClick={true}
        size={'xl'}
      >
        <DrawerOverlay />

        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Asset Data</DrawerHeader>
          <DrawerBody>
          <>
            <GridItem colSpan={3}>
              <Stack mt={5}>
                <Accordion allowMultiple defaultIndex={[0, 1]} colorScheme="orange">
                  <AccordionItem>
                    {({ isExpanded }) => (
                      <>
                        <h2>
                          <AccordionButton bgColor="gray.100" color={color}>
                            <Box flex="1" textAlign="left">
                              Asset Metadata
                            </Box>
                            {isExpanded ? (
                              <FaMinus />
                            ) : (
                              <FaPlus />
                            )}
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          <AssetMetadata assetMetadata={selectedAsset} />
                        </AccordionPanel>
                      </>
                    )}
                  </AccordionItem>

                  <AccordionItem>
                    {({ isExpanded }) => (
                      <>
                        <h2>
                          <AccordionButton bgColor="gray.100" color={color}>
                            <Box flex="1" textAlign="left">
                              NFT Metadata
                            </Box>
                            {isExpanded ? (
                              <FaMinus />
                            ) : (
                              <FaPlus />
                            )}
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          <FormControl id="title" isRequired>
                            <FormLabel>Title</FormLabel>
                            <Input
                              placeholder="e.g. Awesome avatar"
                              isReadOnly={!!tokenId}
                              onChange={(e: any) => setTitle(e.target.value)}
                            />
                          </FormControl>
                          <FormControl id="description" mt={2}>
                            <FormLabel>Description</FormLabel>
                            <Textarea
                              placeholder="e.g. More details info about the awesome avatar"
                              isReadOnly={!!tokenId}
                              resize={'vertical'}
                              onChange={(e: any) => setDesc(e.target.value)}
                            />
                          </FormControl>
                        </AccordionPanel>
                      </>
                    )}
                  </AccordionItem>
                </Accordion>
              </Stack>
              
            </GridItem>
          </>
          </DrawerBody>
          <DrawerFooter d="flex" alignItems="center" justifyContent={'center'}>
            <Stack mt={2} spacing={30} direction="row">
              {
                !tokenId ? (
                  <Button colorScheme="teal" size="md" disabled={!title || !selectedAsset} onClick={() => lazyMint()}>
                    Lazy Mint
                  </Button>
                ) : ''
              }

              {
                tokenId ? (
                  <Button colorScheme="teal" size="md" onClick={() => console.log('create sell order')}>
                    Create Sell Order
                  </Button>
                ) : ''
              }
              <Button colorScheme="teal" onClick={onMintClose} isDisabled={!isMinted}>
                Close
              </Button>
            </Stack>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default AssetDrawer
