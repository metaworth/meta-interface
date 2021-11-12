import { Box, Container, Flex, Button, useColorModeValue } from '@chakra-ui/react'
import { HiPlus } from 'react-icons/hi'


const Collections = () => {
  const color = useColorModeValue('black', 'black')

  const onCreateCollection = () => {}

  return (
    <Container color={color} maxW={{ lg: '7xl' }}>
      <Box as={Flex} justifyContent={'space-between'} alignItems={'center'}>
        <Box fontWeight={'bold'} fontSize={'2xl'}>Collections</Box>
        <Button
          borderRadius={5}
          bg={'#4AD3A6'}
          _hover={{ bg: "#3BD3A5" }}
          _active={{
            bg: "#dddfe2",
            transform: "scale(0.98)",
            borderColor: "#bec3c9",
          }}
          leftIcon={<HiPlus />}
          size={'sm'}
          onClick={onCreateCollection}
          color='white'
        >Create Collection</Button>
      </Box>

      <Box
        minH={'calc(100vh - 60px)'}
        mt={3}
      >
        
      </Box>
    </Container>
  )
}

export default Collections
