import { FC } from 'react'
import {
  Box,
  Flex,
  Button,
  Text,
  Spacer,
  HStack,
  Icon,
  SlideFade,
} from '@chakra-ui/react'
import { CustomRoundedCheckbox } from './MintButton/CustomRoundedCheckbox'
import { FaChevronCircleRight } from 'react-icons/fa'

export interface ExpandableCheckboxButtonProps {
  isDisabled: boolean
  isFullyChecked: boolean
  onSubmit: VoidFunction
  onCheckboxClick: (isFullyChecked: boolean) => void
  onExpandToggle: VoidFunction
  readyToSubmit: boolean
  isExpanded: boolean
  label: string
  submitButtonLabel: string
  width: number
}

const ExpandableButton: FC<ExpandableCheckboxButtonProps> = ({
  isDisabled,
  isFullyChecked,
  onSubmit,
  onCheckboxClick,
  onExpandToggle,
  readyToSubmit,
  isExpanded,
  label,
  submitButtonLabel,
  width,
}) => {
  return (
    <Button
      p={0}
      fontSize={'sm'}
      ml={2}
      borderRadius={5}
      border='2px'
      borderColor='black'
      bgColor={'white'}
      size={'md'}
      disabled={isDisabled}
      d='inline-block'
      style={{
        transition: 'width .3s ease',
        width: isExpanded ? '440px' : `${width}px`,
      }}
      _hover={{ bg: isExpanded ? 'transparent' : 'gray.200' }}
      _focus={{ boxShadow: isExpanded ? 'none' : 'initial' }}
      _active={{ bg: isExpanded ? 'transparent' : 'initial' }}
    >
      <Box>
        <Flex alignItems='center'>
          <Box
            mr={isExpanded ? 2 : 0}
            pl={4}
            pr={4}
            pt={2}
            pb={2}
            onClick={onExpandToggle}
          >
            <Text>{label}</Text>
          </Box>
          {isExpanded && (
            <Flex ml={'auto'}>
              <SlideFade
                transition={{
                  enter: {
                    duration: 0.1,
                    delay: 0.3,
                  },
                }}
                in={isExpanded}
              >
                <ExtendedCheckboxButtonElements
                  onCheckboxClick={onCheckboxClick}
                  isFullyChecked={isFullyChecked}
                  readyToSubmit={readyToSubmit}
                  onSubmit={onSubmit}
                  submitButtonLabel={submitButtonLabel}
                />
              </SlideFade>
            </Flex>
          )}
        </Flex>
      </Box>
    </Button>
  )
}

export default ExpandableButton

type ExtendedSelectToOperateButtonElementsProps = Pick<
  ExpandableCheckboxButtonProps,
  | 'isFullyChecked'
  | 'onSubmit'
  | 'onCheckboxClick'
  | 'readyToSubmit'
  | 'submitButtonLabel'
>

const ExtendedCheckboxButtonElements: FC<ExtendedSelectToOperateButtonElementsProps> =
  ({
    isFullyChecked,
    readyToSubmit,
    onSubmit,
    submitButtonLabel,
    onCheckboxClick,
  }) => {
    return (
      <>
        <Spacer />
        <HStack pr={4}>
          <CustomRoundedCheckbox
            onClick={() => onCheckboxClick(!isFullyChecked)}
            isFullyChecked={isFullyChecked}
            isPartiallyChecked={readyToSubmit}
            label={isFullyChecked ? 'Deselect All' : 'Select All'}
          />
          <Text fontSize={'sm'}>|</Text>
          <Flex>
            <Button
              fontSize={'sm'}
              variant='link'
              disabled={!readyToSubmit}
              _hover={{ textDecoration: 'none' }}
              color={readyToSubmit ? 'metaPrimary.500' : 'gray.600'}
              lineHeight='1'
              onClick={onSubmit}
            >
              {submitButtonLabel}
              <Icon ml={2} w={5} h={5} as={FaChevronCircleRight} />
            </Button>
          </Flex>
        </HStack>
      </>
    )
  }
