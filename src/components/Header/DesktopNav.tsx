/* eslint-disable react-hooks/rules-of-hooks */
import {
  useLocation,
  NavLink
} from 'react-router-dom'
import {
  Stack,
  Box,
  BoxProps,
  Popover,
  PopoverTrigger,
  Link,
  useColorModeValue,
  PopoverContent,
  Text,
  Flex,
  Icon,
  HStack,
  StackDivider,
  LinkBox,
  LinkOverlay
} from '@chakra-ui/react'
import { ChevronRightIcon } from '@chakra-ui/icons'
import { NAV_ITEMS, NavItem } from './navData'


export const DesktopNav = (props: BoxProps) => {
  const location = useLocation()
  const { pathname } = location
  const splitLocation = pathname.split('/')

  return (
    <HStack direction="row" divider={<StackDivider />} as="nav" {...props}>
      {NAV_ITEMS.map((navItem) => (
        <LinkBox
          key={navItem.label}
          px={2}
          py={1}
        >
          <Popover trigger={'hover'} placement={'bottom-start'} gutter={25}>
            {({ onClose }) => (
              <>
                <PopoverTrigger>
                  {
                    navItem.href && (navItem.href === '/token' || navItem.href === '/generative') ? (
                      <LinkOverlay
                        cursor={'pointer'}
                        fontSize={'sm'}
                        fontWeight={800}
                        style={`/${splitLocation[1]}` === navItem.href ? {
                          textDecoration: 'none',
                          color: useColorModeValue('#4AD3A6', '#4AD3A6'),
                          borderRadius: 10,
                        } : undefined}
                        _hover={{
                          textDecoration: 'none',
                          color: useColorModeValue('#4AD3A6', '#4AD3A6'),
                          rounded: 10,
                        }}
                      >
                        {navItem.label}
                      </LinkOverlay>
                    ) : (
                      <LinkOverlay
                        as={NavLink}
                        to={navItem.href ?? '/'}
                        fontSize={'sm'}
                        fontWeight={800}
                        style={`/${splitLocation[1]}` === navItem.href ? {
                          textDecoration: 'none',
                          color: useColorModeValue('#4AD3A6', '#4AD3A6'),
                          borderRadius: 10,
                        } : undefined}
                        _hover={{
                          textDecoration: 'none',
                          color: useColorModeValue('#4AD3A6', '#4AD3A6'),
                          rounded: 10,
                        }}
                      >
                        {navItem.label}
                      </LinkOverlay>
                    )
                  }
                </PopoverTrigger>

                {navItem.children && (
                  <PopoverContent
                    border={0}
                    role={'tooltip'}
                    boxShadow={'xl'}
                    bg={useColorModeValue('white', 'gray.800')}
                    p={2}
                    rounded={0}
                    roundedBottom={'xl'}
                    w={'md'}
                    minW={'sm'}>
                    <Stack>
                      {navItem.children.map((child) => (
                        <DesktopSubNav key={child.label} {...child} onMobileNavToggle={onClose} />
                      ))}
                    </Stack>
                  </PopoverContent>
                )}
              </>
            )}
          </Popover>
        </LinkBox>
      ))}
    </HStack>
  )
}

const DesktopSubNav = ({ label, href = '/', subLabel, onMobileNavToggle }: NavItem) => {
  return (
    <Link
      as={NavLink}
      to={href}
      role={'group'}
      display={'block'}
      onClick={onMobileNavToggle}
      p={2}
      rounded={'md'}
      _hover={{ bg: useColorModeValue('green.100', 'gray.900') }}>
      <Stack direction={'row'} align={'center'}>
        <Box>
          <Text
            transition={'all .3s ease'}
            _groupHover={{ color: 'green.400' }}
            fontWeight={500}>
            {label}
          </Text>
          <Text fontSize={'sm'} color={'gray.400'}>{subLabel}</Text>
        </Box>
        <Flex
          transition={'all .3s ease'}
          transform={'translateX(-10px)'}
          opacity={0}
          _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
          justify={'flex-end'}
          align={'center'}
          flex={1}>
          <Icon color={'green.400'} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Link>
  )
}
