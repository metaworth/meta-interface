import { FC } from 'react'
import { Box, Flex, Button } from '@chakra-ui/react'
import { HiUpload } from 'react-icons/hi'
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
}) => {
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
          <ExpandableButton
            {...commonButtonProps}
            onExpandToggle={onSelectToMintClick}
            isExpanded={selectedToMint}
            label={'Select to Mint'}
            submitButtonLabel={'Batch Mint'}
            width={128}
          />
          <ExpandableButton
            {...commonButtonProps}
            onExpandToggle={onSelectToTransferClick}
            isExpanded={selectedToTransfer}
            label={'Select to Transfer'}
            submitButtonLabel={'Batch Transfer'}
            width={155}
          />
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
