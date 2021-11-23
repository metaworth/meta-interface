import { FC } from 'react'
import { Box, Flex, Button, Text, Spacer, HStack, Icon } from '@chakra-ui/react'
import { HiUpload } from 'react-icons/hi'
import { CustomRoundedCheckbox } from './MintButton/CustomRoundedCheckbox'
import { FaChevronCircleRight } from 'react-icons/fa'

interface AssetsHeaderProps {
  disableButtons: boolean
  isAllSelected: boolean
  onBatchMint: VoidFunction
  onSelectAllClick: (isAllSelected: boolean) => void
  onSelectToMintClick: VoidFunction
  onUploadOpen: VoidFunction
  readyToMint: boolean
  selectedToMint: boolean
}

const AssetsHeader: FC<AssetsHeaderProps> = ({
  disableButtons,
  isAllSelected,
  onBatchMint,
  onSelectAllClick,
  onSelectToMintClick,
  onUploadOpen,
  readyToMint,
  selectedToMint,
}) => {
  return (
    <>
      <Box as={Flex} justifyContent={'space-between'} alignItems={'center'}>
        <Box></Box>
        <Button
          borderRadius={5}
          bg={'#4AD3A6'}
          _hover={{ bg: '#3BD3A5' }}
          _active={{
            bg: '#dddfe2',
            transform: 'scale(0.98)',
            borderColor: '#bec3c9',
          }}
          leftIcon={<HiUpload />}
          size={'sm'}
          onClick={onUploadOpen}
          color='white'
        >
          Upload
        </Button>
      </Box>

      <Box
        as={Flex}
        justifyContent={'space-between'}
        alignItems={'center'}
        mt={3}
      >
        <Box>
          <Button
            p={0}
            fontSize={'sm'}
            ml={2}
            borderRadius={5}
            border='2px'
            borderColor='black'
            bgColor={'white'}
            size={'md'}
            disabled={disableButtons}
            d='inline-block'
            style={{
              transition: 'width .5s ease',
              width: selectedToMint ? '394px' : '144px',
            }}
            _hover={{ bg: selectedToMint ? 'transparent' : 'gray.200' }}
            _focus={{ boxShadow: selectedToMint ? 'none' : 'initial' }}
            _active={{ bg: selectedToMint ? 'transparent' : 'initial' }}
          >
            <Box>
              <Flex alignItems='center'>
                <Box
                  mr={selectedToMint ? 2 : 0}
                  pl={4}
                  pr={4}
                  pt={2}
                  pb={2}
                  onClick={onSelectToMintClick}
                >
                  <Text>Select to Mint</Text>
                </Box>
                {selectedToMint && (
                  <ExtendedSelectToMintButtonElements
                    onSelectAllClick={onSelectAllClick}
                    isAllSelected={isAllSelected}
                    readyToMint={readyToMint}
                    onBatchMint={onBatchMint}
                  />
                )}
              </Flex>
            </Box>
          </Button>
          <Button
            fontSize={'sm'}
            ml={2}
            borderRadius={5}
            border='2px'
            borderColor='black'
            bgColor={'white'}
            size={'md'}
            disabled={disableButtons}
          >
            Select to Transfer
          </Button>
        </Box>

        {/* <Box as={Flex} alignItems={'center'}>
          <Button
            size={'sm'}
            bgColor={'white'}
            disabled={disableButtons}
          >
            <FaGripHorizontal />
          </Button>
          <Button
            size={'sm'}
            ml={2}
            bgColor={'white'}
            disabled={disableButtons}
          >
            <FaGripVertical />
          </Button>
          <Button
            size={'sm'}
            ml={2}
            bgColor={'white'}
            disabled={disableButtons}
          >
            <BiSort />&nbsp;Sort By
          </Button>
        </Box> */}
      </Box>
    </>
  )
}

export default AssetsHeader

const ExtendedSelectToMintButtonElements: FC<
  Pick<
    AssetsHeaderProps,
    'onSelectAllClick' | 'isAllSelected' | 'readyToMint' | 'onBatchMint'
  >
> = ({ onSelectAllClick, isAllSelected, readyToMint, onBatchMint }) => {
  return (
    <>
      <Spacer />
      <HStack pr={4}>
        <CustomRoundedCheckbox
          onClick={() => onSelectAllClick(!isAllSelected)}
          isFullyChecked={isAllSelected}
          isPartiallyChecked={readyToMint}
          label={isAllSelected ? 'Deselect All' : 'Select All'}
        />
        <Text fontSize={'sm'}>|</Text>
        <Flex>
          <Button
            fontSize={'sm'}
            variant='link'
            disabled={!readyToMint}
            _hover={{ textDecoration: 'none' }}
            color={readyToMint ? 'metaPrimary.500' : 'gray.600'}
            lineHeight='1'
            onClick={onBatchMint}
          >
            Batch Mint
            <Icon ml={2} w={5} h={5} as={FaChevronCircleRight} />
          </Button>
        </Flex>
      </HStack>
    </>
  )
}
