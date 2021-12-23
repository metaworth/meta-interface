import { useRef, useState } from 'react'
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
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
} from '@chakra-ui/react'
import { CloseIcon, HamburgerIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { IoMoon, IoSunny } from 'react-icons/io5'
import { BiWallet } from 'react-icons/bi'
import { useEvm, shortenIfAddress, ChainId, useNetwork } from '@dapptools/evm'
import Logo from '../../assets/images/logo.svg'
import OasisEth from '../../assets/images/oasiseth.png'
import EthLogo from '../../assets/images/eth-logo.svg'
import Polygon from '../../assets/images/polygon-logo.svg'
import { MobileNav } from './MobileNav'
import { DesktopNav } from './DesktopNav'

const MUMBAI_TESTNET_PARAMS = {
  chainId: '80001',
  name: 'Polygon Testnet',
  nativeCurrency: {
    name: 'Polygon',
    symbol: 'MATIC',
    decimals: 18
  },
  rpc: ['https://rpc-mumbai.matic.today'],
  explorers: ['https://mumbai.polygonscan.com/']
}

const EMERALD_TESTNET_PARAMS = {
  chainId: '42261',
  name: 'Emerald Testnet',
  nativeCurrency: {
    name: 'Emerald Paratime',
    symbol: 'ROSE',
    decimals: 18
  },
  rpc: ['https://testnet.emerald.oasis.dev/', 'https://testnet.emerald.oasis.dev/ws'],
  explorers: ['https://testnet.oasisscan.com/paratimes/00000000000000000000000000000000000000000000000072c8215e60d5bca7']
}

export const Header = () => {
  const { isOpen: isMobileNavOpen, onToggle } = useDisclosure()
  const { colorMode, toggleColorMode } = useColorMode()

  const { activateBrowserWallet, account, deactivate, chainId } = useEvm()
  const { addNetwork } = useNetwork()

  const color = useColorModeValue('', 'gray.800')

  const timerRef = useRef() as React.MutableRefObject<number | undefined>
  const [isOpenMenu, setIsOpenMenu] = useState(false)

  const btnMouseEnterEvent = () => {
    setIsOpenMenu(true)
  }

  const btnMouseLeaveEvent = () => {
    timerRef.current = window.setTimeout(() => {
      setIsOpenMenu(false)
    }, 150)
  }

  const menuListMouseEnterEvent = () => {
    clearTimeout(timerRef.current)
    timerRef.current = undefined
    setIsOpenMenu(true)
  }

  const menuListMouseLeaveEvent = () => {
    setIsOpenMenu(false)
  }

  const SelectedChain = () => {
    if (chainId === ChainId.Mumbai) {
      return (
        <>
          <Image
            width={4}
            borderRadius="full"
            src={Polygon}
            alt="Mumbai Testnet"
            mr="0.5rem"
          />
          <span>Mumbai Testnet</span>
        </>
      )
    } else if (chainId === ChainId.EmeraldTestnet) {
      return (
        <>
          <Image
            width={4}
            borderRadius="full"
            src={OasisEth}
            alt="Emerald Paratime"
            mr="0.5rem"
          />
          <span>Emerald Paratime</span>
        </>
      )
    }

    return <></>
  }

  return (
    <Box>
      <Flex
        as={'header'}
        pos="fixed"
        top="0"
        w={'full'}
        minH={'60px'}
        boxShadow={'sm'}
        zIndex={1}
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
                Metaworth
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
            <Menu isOpen={isOpenMenu}>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                color={color}
                bgColor={'#FAFAFA'}
                minW={150}
                px={3}
                onMouseEnter={btnMouseEnterEvent}
                onMouseLeave={btnMouseLeaveEvent}
                fontWeight={'normal'}
              >
                <Box d={'flex'} justifyContent={'space-between'} alignItems={'center'} color={color}>
                  <SelectedChain />
                </Box>
              </MenuButton>
              <MenuList
                onMouseEnter={menuListMouseEnterEvent}
                onMouseLeave={menuListMouseLeaveEvent}
              >
                <MenuItem minH="40px" onClick={() => addNetwork(EMERALD_TESTNET_PARAMS, ChainId.EmeraldTestnet)}>
                  <Image
                    width={4}
                    borderRadius="full"
                    src={OasisEth}
                    alt="Emerald Paratime"
                    mr="0.5rem"
                  />
                  <span>Emerald Paratime</span>
                </MenuItem>
                <MenuItem minH="40px" onClick={() => addNetwork(MUMBAI_TESTNET_PARAMS, ChainId.Mumbai)}>
                  <Image
                    width={4}
                    borderRadius="full"
                    src={Polygon}
                    alt="Mumbai Testnet"
                    mr="0.5rem"
                  />
                  <span>Mumbai Testnet</span>
                </MenuItem>
                {/* <MenuItem minH="40px" onClick={() => switchNetwork('4')}>
                  <Image
                    width={4}
                    borderRadius="full"
                    src={EthLogo}
                    alt="Rinkeby Testnet"
                    mr="0.5rem"
                  />
                  <span>Rinkeby Testnet</span>
                </MenuItem> */}
              </MenuList>
            </Menu>

            {
              account ? (
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
                  onClick={deactivate}
                >
                  <BiWallet size="20" />
                  <Popover trigger={'hover'}>
                    <PopoverTrigger>
                      <Box ml={1}>{shortenIfAddress(account)}</Box>
                    </PopoverTrigger>
                    <PopoverContent width={'auto'}>
                      <PopoverArrow />
                      <PopoverBody>Click to disconnect your wallet</PopoverBody>
                    </PopoverContent>
                  </Popover>
                </Box>
              ) : (
                <Button onClick={() => activateBrowserWallet()}>Connect Wallet</Button>
              )
            }

            <IconButton
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
            />
          </Stack>
        </Container>
      </Flex>
      <MobileNav isOpen={isMobileNavOpen} onMobileNavToggle={onToggle} />
    </Box>
  )
}
