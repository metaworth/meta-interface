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
} from '@chakra-ui/react'
import { CloseIcon, HamburgerIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { IoMoon, IoSunny } from 'react-icons/io5'
import { BiWallet } from 'react-icons/bi'
import { useEthers, shortenIfAddress } from 'web3-sdk'
import Logo from '../../assets/images/logo.svg'
import OasisEth from '../../assets/images/oasiseth.png'
import EthLogo from '../../assets/images/eth-logo.svg'
import Polygon from '../../assets/images/polygon-logo.svg'
import Avalanche from '../../assets/images/avax-logo.svg'
import BinanceSmartChain from '../../assets/images/bnb-logo.svg'
import Harmony from '../../assets/images/harmony-logo.svg'
import Near from '../../assets/images/near-logo.svg'
import Solana from '../../assets/images/solana-logo.svg'
import Theta from '../../assets/images/theta-logo.svg'
import { MobileNav } from './MobileNav'
import { DesktopNav } from './DesktopNav'
import { useNetwork } from '../../hooks/useNetwork'

export const Header = () => {
  const { isOpen: isMobileNavOpen, onToggle } = useDisclosure()
  const { colorMode, toggleColorMode } = useColorMode()

  const { activateBrowserWallet, account, deactivate } = useEthers()
  const { addAvalancheMainnet, addPolygonMainnet } = useNetwork()

  const color = useColorModeValue('', "gray.800")

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
            <Menu isOpen={isOpenMenu}>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                bgColor={'#FAFAFA'}
                minW={150}
                px={3}
                onMouseEnter={btnMouseEnterEvent}
                onMouseLeave={btnMouseLeaveEvent}
              >
                <Box d={'flex'} justifyContent={'space-between'} alignItems={'center'} color={color}>
                  <Image src={OasisEth} width={4} /> Oasis ETH
                </Box>
              </MenuButton>
              <MenuList
                onMouseEnter={menuListMouseEnterEvent}
                onMouseLeave={menuListMouseLeaveEvent}
              >
                <MenuItem minH="48px">
                  <Image
                    width={4}
                    borderRadius="full"
                    src={OasisEth}
                    alt="OasisETH"
                    mr="0.5rem"
                  />
                  <span>Oasis ETH</span>
                </MenuItem>
                <MenuItem minH="40px">
                  <Image
                    width={4}
                    borderRadius="full"
                    src={EthLogo}
                    alt="ETH Mainnet"
                    mr="0.5rem"
                  />
                  <span>ETH Mainnet</span>
                </MenuItem>
                <MenuItem minH="40px" onClick={() => addPolygonMainnet(137)}>
                  <Image
                    width={4}
                    borderRadius="full"
                    src={Polygon}
                    alt="Polygon Mainnet"
                    mr="0.5rem"
                  />
                  <span>Polygon Mainnet</span>
                </MenuItem>
                <MenuItem minH="40px" onClick={() => addAvalancheMainnet('43114')}>
                  <Image
                    width={4}
                    borderRadius="full"
                    src={Avalanche}
                    alt="Avalanche Mainnet"
                    mr="0.5rem"
                  />
                  <span>Avalanche Mainnet</span>
                </MenuItem>
                <MenuItem minH="40px">
                  <Image
                    width={4}
                    borderRadius="full"
                    src={BinanceSmartChain}
                    alt="BSC Mainnet"
                    mr="0.5rem"
                  />
                  <span>BSC Mainnet</span>
                </MenuItem>
                <MenuItem minH="40px">
                  <Image
                    width={4}
                    borderRadius="full"
                    src={Harmony}
                    alt="Harmony Mainnet"
                    mr="0.5rem"
                  />
                  <span>Harmony Mainnet</span>
                </MenuItem>
                <MenuItem minH="40px">
                  <Image
                    width={4}
                    borderRadius="full"
                    src={Near}
                    alt="Near Mainnet"
                    mr="0.5rem"
                  />
                  <span>Near Mainnet</span>
                </MenuItem>
                <MenuItem minH="40px">
                  <Image
                    width={4}
                    borderRadius="full"
                    src={Solana}
                    alt="Solana Mainnet"
                    mr="0.5rem"
                  />
                  <span>Solana Mainnet</span>
                </MenuItem>
                <MenuItem minH="40px">
                  <Image
                    width={4}
                    borderRadius="full"
                    src={Theta}
                    alt="Theta Mainnet"
                    mr="0.5rem"
                  />
                  <span>Theta Mainnet</span>
                </MenuItem>
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
                  <BiWallet size="20" />&nbsp{shortenIfAddress(account)}
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
