import { FC } from 'react'
import { Box, Flex, Button } from '@chakra-ui/react'
import { FaGripVertical, FaGripHorizontal } from 'react-icons/fa'
import { HiUpload } from 'react-icons/hi'
import { BiSort } from 'react-icons/bi'

interface AssetsHeaderProps {
  onUploadOpen: () => void
  disableButtons: boolean
}

const AssetsHeader: FC<AssetsHeaderProps> = ({ onUploadOpen, disableButtons }) => {
  return (
    <>
      <Box as={Flex} justifyContent={'space-between'} alignItems={'center'}>
        <Box></Box>
        <Button
          borderRadius={5}
          bg={'#4AD3A6'}
          _hover={{ bg: "#3BD3A5" }}
          _active={{
            bg: "#dddfe2",
            transform: "scale(0.98)",
            borderColor: "#bec3c9",
          }}
          leftIcon={<HiUpload />}
          size={'sm'}
          onClick={onUploadOpen}
          color='white'
        >Upload</Button>
      </Box>

      <Box as={Flex} justifyContent={'space-between'} alignItems={'center'} mt={3}>
        <Box>
          <Button
            borderRadius={5}
            border="2px"
            borderColor="black"
            bgColor={'white'}
            size={'sm'}
            disabled={disableButtons}
          >Select to Mint</Button>
          <Button
            ml={2}
            borderRadius={5}
            border="2px"
            borderColor="black"
            bgColor={'white'}
            size={'sm'}
            disabled={disableButtons}
          >Select to Transfer</Button>
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
