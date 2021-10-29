import { Box, Container, useColorModeValue } from '@chakra-ui/react'

const Mint = () => {
  const color = useColorModeValue("black", "black")
  return (
    <Container color={color} maxW={{ lg: '7xl' }}>
      <Box minH={'calc(100vh - 60px)'}>
        Comming soon
      </Box>
    </Container>
  )
}

export default Mint
