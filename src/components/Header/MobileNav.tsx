import { SyntheticEvent } from 'react'
import {
  Collapse,
  Flex,
  Icon,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { NavLink } from 'react-router-dom'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { NAV_ITEMS, NavItem } from './navData'

interface MobileNavProps {
  isOpen: boolean
  onMobileNavToggle: any
}

export const MobileNav = ({ isOpen, onMobileNavToggle }: MobileNavProps) => {
  if (!isOpen) return null

  return (
    <Stack
      p={4}
      display={{ md: 'none' }}
      zIndex={2}
      pos="fixed"
      top="60px"
      w={'full'}
      bg={'white'}
      minH={'calc(100vh - 60px)'}
      css={{
        backdropFilter: 'saturate(180%) blur(5px)',
        // eslint-disable-next-line react-hooks/rules-of-hooks
        backgroundColor: useColorModeValue(
          'rgba(255, 255, 255, 0.8)',
          'rgba(26, 32, 44, 0.8)'
        ),
      }}>
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} onMobileNavToggle={onMobileNavToggle} />
      ))}
    </Stack>
  )
}

const MobileNavItem = ({ href, children, label, onMobileNavToggle }: NavItem) => {
  const { isOpen, onToggle } = useDisclosure()

  const handleToggle = (e: SyntheticEvent) => {
    if (children) {
      e.preventDefault()
      onToggle()
    }
  }

  const handleMobileNavToggle = (e: SyntheticEvent) => {
    onMobileNavToggle()
  }

  return (
    <Stack spacing={4} onClick={handleToggle}>
      
      {
        href === '/token' || href === '/generative' ? (
          <Flex
            py={2}
            justify={'space-between'}
            align={'center'}
            _hover={{
              textDecoration: 'none',
            }}>
            <Text
              fontWeight={600}
              // eslint-disable-next-line react-hooks/rules-of-hooks
              color={useColorModeValue('gray.600', 'gray.200')}>
              {label}
            </Text>
            {children && (
              <Icon
                as={ChevronDownIcon}
                transition={'all .25s ease-in-out'}
                transform={isOpen ? 'rotate(180deg)' : ''}
                w={6}
                h={6}
              />
            )}
          </Flex>
        ) : (
          <Flex
            py={2}
            as={NavLink}
            to={href ?? '#'}
            justify={'space-between'}
            onClick={handleMobileNavToggle}
            align={'center'}
            _hover={{
              textDecoration: 'none',
            }}>
              <Text
                fontWeight={600}
                // eslint-disable-next-line react-hooks/rules-of-hooks
                color={useColorModeValue('gray.600', 'gray.200')}>
                {label}
              </Text>
              {children && (
                <Icon
                  as={ChevronDownIcon}
                  transition={'all .25s ease-in-out'}
                  transform={isOpen ? 'rotate(180deg)' : ''}
                  w={6}
                  h={6}
                />
              )}
            </Flex>
        )
      }

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}>
          {children &&
            children.map((child) => (
              <Flex onClick={handleMobileNavToggle} as={NavLink} to={child.href} key={child.label} py={2}>
                {child.label}
              </Flex>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  )
}
