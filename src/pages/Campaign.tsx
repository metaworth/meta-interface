import { Box, Container, Flex } from '@chakra-ui/react'

const Campaign = () => {

  return (
    <Container margin={'auto'} as={Flex}>
      <Box
        maxW={'3xl'}
        w={{ base: 'xl', sm: 'sm', md: '3xl' }}
        minH={950}>
        Comming soon
      </Box>
    </Container>
  )
}

export default Campaign
