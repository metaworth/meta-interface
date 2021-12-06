import { FC, useEffect } from 'react'
import { Flex } from '@chakra-ui/react'

interface OverlayProps {
  active: boolean
}

const Overlay: FC<OverlayProps> = ({ active, children }) => {
  useEffect(() => {
    // This prevents scrolling of the body while the overlay is open.
    document.body.style.overflow = active ? 'hidden' : 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [active])

  if (!active) return null

  return (
    <Flex
      bg="blackAlpha.600"
      pos="absolute"
      top="0"
      left="0"
      bottom="0"
      right="0"
      overflow="hidden"
      zIndex="3"
      alignItems="center"
      justifyContent="center"
    >
      {children}
    </Flex>
  )
}

export default Overlay
