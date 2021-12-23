import { FC } from 'react'
import {
  Box,
  Flex,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Text,
  Icon,
} from '@chakra-ui/react'
import { InfoOutlineIcon } from '@chakra-ui/icons'
import { HiUpload } from 'react-icons/hi'
import { useEvm, getChainName } from '@dapptools/evm'
import ExpandableButton from './ExpandableButton'

interface AssetsHeaderProps {
  disableButtons: boolean
  isAllSelected: boolean
  onBatch: VoidFunction
  onSelectAllClick: (isAllSelected: boolean) => void
  onSelectToMintClick: VoidFunction
  onSelectToTransferClick: VoidFunction
  onUploadOpen: VoidFunction
  readyToBatch: boolean
  selectedToMint: boolean
  selectedToTransfer: boolean
  collectionName: string
  onChainId?: number
}

const AssetsHeader: FC<AssetsHeaderProps> = ({
  disableButtons,
  isAllSelected,
  onBatch,
  onSelectAllClick,
  onSelectToMintClick,
  onSelectToTransferClick,
  onUploadOpen,
  readyToBatch,
  selectedToMint,
  selectedToTransfer,
  collectionName,
  onChainId,
}) => {

  const { chainId } = useEvm()

  const commonButtonProps = {
    isDisabled: disableButtons,
    isFullyChecked: isAllSelected,
    onSubmit: onBatch,
    onCheckboxClick: onSelectAllClick,
    readyToSubmit: readyToBatch,
  }

  return (
    <>
      <Box as={Flex} justifyContent={'space-between'} alignItems={'center'}>
        <Box>
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink href='/collections'>Collection</BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem isCurrentPage>
              <Text> { collectionName }</Text>
            </BreadcrumbItem>
          </Breadcrumb>
        </Box>
        
        {
          onChainId !== chainId ? (
            <Flex direction={'row'} alignItems={'center'}>
              <Icon as={InfoOutlineIcon} h={3} />
              <Text fontSize='xs' color='tomato' pl={1}>
                Switch to {getChainName(onChainId!)} to upload assets.
              </Text>
            </Flex>
          ) : (
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
              disabled={onChainId !== chainId}
              color='white'
            >
              Upload
            </Button>
          )
        }
      </Box>

      <Box
        as={Flex}
        justifyContent={'space-between'}
        alignItems={'center'}
        pl={0}
        mt={3}
      >
        <Box>
          <ExpandableButton
            {...commonButtonProps}
            onExpandToggle={onSelectToMintClick}
            isExpanded={selectedToMint}
            label={'Select to Batch Mint'}
            submitButtonLabel={'Batch Mint'}
            width={158}
          />
          {/* <ExpandableButton
            {...commonButtonProps}
            onExpandToggle={onSelectToTransferClick}
            isExpanded={selectedToTransfer}
            label={'Select to Batch Transfer'}
            submitButtonLabel={'Batch Transfer'}
            width={188}
            ml={2}
          /> */}
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
