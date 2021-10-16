import {
  Box,
  Flex,
  Container,
  Stack,
  useDisclosure,
  IconButton,
  useColorModeValue,
  Image,
  useColorMode,
  Heading,
  HStack,
} from '@chakra-ui/react'
import { CloseIcon, HamburgerIcon } from '@chakra-ui/icons'
import { IoMoon, IoSunny } from 'react-icons/io5'
import { BiWallet } from 'react-icons/bi'
import Logo from '../../assets/images/logo.svg'
import OasisEth from '../../assets/images/oasiseth.png'
import { MobileNav } from './MobileNav'
import { DesktopNav } from './DesktopNav'

export const Header = () => {
  const { isOpen: isMobileNavOpen, onToggle } = useDisclosure()
  const { colorMode, toggleColorMode } = useColorMode()

  const color = useColorModeValue('', "gray.800")

  return (
    <Box>
      <Flex
        as={'header'}
        pos="fixed"
        top="0"
        w={'full'}
        minH={'60px'}
        boxShadow={'sm'}
        zIndex="998"
        justify={'center'}
        css={{
          backdropFilter: 'saturate(180%) blur(5px)',
          backgroundColor: useColorModeValue(
            'rgba(255, 255, 255, 0.8)',
            'rgba(26, 32, 44, 0.8)'
          ),
        }}>
        <Container as={Flex} maxW={'7xl'} align={'center'}>
          <Flex
            flex={{ base: '0', md: 'auto' }}
            ml={{ base: -2 }}
            mr={{ base: 6, md: 0 }}
            display={{ base: 'flex', md: 'none' }}>
            <IconButton
              onClick={onToggle}
              icon={
                isMobileNavOpen ? (
                  <CloseIcon w={3} h={3} />
                ) : (
                  <HamburgerIcon w={5} h={5} />
                )
              }
              variant={'ghost'}
              size={'sm'}
              aria-label={'Toggle Navigation'}
            />
          </Flex>

          <Flex
            flex={{ base: 1, md: 'auto' }}
            justify={{ base: 'start', md: 'start' }}>
            <Stack
              as={'a'}
              href="/"
              direction={'row'}
              alignItems={'center'}
              spacing={{ base: 1, sm: 4 }}>
              <Image src={Logo} w={{ base: 8 }} h={{ base: 8 }} />
              <Heading
                as={'h1'}
                fontSize={'xl'}
                color={'#4AD3A6'}
                ml={1}
                display={{ base: 'none', md: 'block' }}>
                Meta Worth
              </Heading>
            </Stack>
            <HStack pl={{ base: 2, sm: 4 }} alignItems={'center'}>
              <DesktopNav display={{ base: 'none', md: 'flex' }} />
            </HStack>
          </Flex>

          <Stack
            direction={'row'}
            align={'center'}
            spacing={{ base: 4, md: 4, lg: 8 }}
            flex={{ base: 1, md: 'auto' }}
            justify={'flex-end'}>
            <Box
              ml={3}
              minW={120}
              p={2}
              px={3}
              d={'flex'}
              justifyContent={'space-between'}
              cursor={'pointer'}
              alignItems={'center'}
              rounded={'5'}
              bg="#FAFAFA"
              color={color}
              onClick={() => console.log('oasis')}
            >
              <Image src={OasisEth} width={4} /> Oasis ETH
            </Box>

            <Box
              p={2}
              px={{ base: 0, md: 3 }}
              d={'flex'}
              cursor={'pointer'}
              justifyContent={'space-between'}
              alignItems={'center'}
              rounded={'5'}
              bg="#FAFAFA"
              color={color}
              onClick={() => console.log('logout')}
            >
              <BiWallet size="20" />&nbsp;{'0x7476E...3158'}
            </Box>

            {/* <IconButton
              size={'sm'}
              variant={'ghost'}
              aria-label={'Toggle Color Mode'}
              onClick={toggleColorMode}
              icon={
                colorMode === 'light' ? (
                  <IoMoon size={18} />
                ) : (
                  <IoSunny size={18} />
                )
              }
            /> */}
          </Stack>
        </Container>
      </Flex>
      <MobileNav isOpen={isMobileNavOpen} onMobileNavToggle={onToggle} />
    </Box>
  )
}
