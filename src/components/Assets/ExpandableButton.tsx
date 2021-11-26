import { FC } from 'react'
import { Box, Flex, Button, Text, Spacer, HStack, Icon } from '@chakra-ui/react'
import { HiUpload } from 'react-icons/hi'
import { CustomRoundedCheckbox } from './MintButton/CustomRoundedCheckbox'
import { FaChevronCircleRight } from 'react-icons/fa'

interface ExpandableButtonProps {
  disableButtons: boolean
  isAllSelected: boolean
  onBatchOperate: VoidFunction
  onSelectAllClick: (isAllSelected: boolean) => void
  onSelectToOperateClick: VoidFunction
  onUploadOpen: VoidFunction
  readyToOperate: boolean
  selectedToOperate: boolean
  text: string
  batchOperateText: string
}

const ExpandableButton: FC<ExpandableButtonProps> = ({
  disableButtons,
  isAllSelected,
  onBatchOperate,
  onSelectAllClick,
  onSelectToOperateClick,
  readyToOperate,
  selectedToOperate,
  text,
  batchOperateText,
}) => {
  return (
    <Button
      p={0}
      fontSize={'sm'}
      ml={2}
      borderRadius={5}
      border="2px"
      borderColor="black"
      bgColor={'white'}
      size={'md'}
      disabled={disableButtons}
      d="inline-block"
      style={{
        transition: 'width .5s ease',
        width: selectedToOperate ? '394px' : '144px',
      }}
      _hover={{ bg: selectedToOperate ? 'transparent' : 'gray.200' }}
      _focus={{ boxShadow: selectedToOperate ? 'none' : 'initial' }}
      _active={{ bg: selectedToOperate ? 'transparent' : 'initial' }}
    >
      <Box>
        <Flex alignItems="center">
          <Box
            mr={selectedToOperate ? 2 : 0}
            pl={4}
            pr={4}
            pt={2}
            pb={2}
            onClick={onSelectToOperateClick}
          >
            <Text>{text}</Text>
          </Box>
          {selectedToOperate && (
            <ExtendedSelectToOperateButtonElements
              onSelectAllClick={onSelectAllClick}
              isAllSelected={isAllSelected}
              readyToOperate={readyToOperate}
              onBatchOperate={onBatchOperate}
              batchOperateText={batchOperateText}
            />
          )}
        </Flex>
      </Box>
    </Button>
  )
}

export default ExpandableButton

interface ExtendedSelectToOperateButtonElementsProps {
  isAllSelected: boolean
  onBatchOperate: VoidFunction
  onSelectAllClick: (isAllSelected: boolean) => void
  readyToOperate: boolean
  batchOperateText: string
}

const ExtendedSelectToOperateButtonElements: FC<ExtendedSelectToOperateButtonElementsProps> =
  ({
    onSelectAllClick,
    isAllSelected,
    readyToOperate,
    onBatchOperate,
    batchOperateText,
  }) => {
    return (
      <>
        <Spacer />
        <HStack pr={4}>
          <CustomRoundedCheckbox
            onClick={() => onSelectAllClick(!isAllSelected)}
            isFullyChecked={isAllSelected}
            isPartiallyChecked={readyToOperate}
            label={isAllSelected ? 'Deselect All' : 'Select All'}
          />
          <Text fontSize={'sm'}>|</Text>
          <Flex>
            <Button
              fontSize={'sm'}
              variant="link"
              disabled={!readyToOperate}
              _hover={{ textDecoration: 'none' }}
              color={readyToOperate ? 'metaPrimary.500' : 'gray.600'}
              lineHeight="1"
              onClick={onBatchOperate}
            >
              {batchOperateText}
              <Icon ml={2} w={5} h={5} as={FaChevronCircleRight} />
            </Button>
          </Flex>
        </HStack>
      </>
    )
  }
