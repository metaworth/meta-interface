import { FC } from 'react'
import { Box, Flex, Text } from '@chakra-ui/react'

interface CustomRoundedCheckboxProps {
  isFullyChecked: boolean
  isPartiallyChecked?: boolean
  label?: string
  onClick?: () => void
}

export const CustomRoundedCheckbox: FC<CustomRoundedCheckboxProps> = ({
  isFullyChecked,
  isPartiallyChecked,
  label,
  onClick,
}) => {
  const isChecked = isFullyChecked || isPartiallyChecked

  const partiallyCheckedStyle =
    !isFullyChecked && isPartiallyChecked
      ? {
          height: 0,
          transform: 'none',
          top: '7px',
        }
      : undefined

  return (
    <Flex alignItems='center' onClick={onClick}>
      <Box
        fontSize={'sm'}
        position={'relative'}
        borderWidth='2px'
        borderRadius='lg'
        h='5'
        w='5'
        d='inline-flex'
        borderColor={isChecked ? 'metaPrimary.500' : 'black'}
        bgColor={isChecked ? 'metaPrimary.500' : 'transparent'}
        mr='2.5'
        cursor='pointer'
        _after={{
          position: 'absolute',
          opacity: isChecked ? 1 : 0,
          borderColor: 'white',
          borderWidth: '2px',
          borderTop: 'none',
          borderRight: 'none',
          content: '""',
          w: '2.5',
          h: '1.5',
          transform: 'rotate(-45deg)',
          top: '4px',
          left: '3px',
          ...partiallyCheckedStyle,
        }}
      >
        <input
          type='checkbox'
          id='select-all'
          style={{ visibility: 'hidden' }}
        />
      </Box>
      <Text>{label}</Text>
    </Flex>
  )
}
