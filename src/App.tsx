import { Switch, Route, Redirect } from 'react-router-dom'
import {
  ChakraProvider,
  useColorModeValue,
  CSSReset,
  Box,
  Button,
  Flex,
  VStack,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react'
import { connect } from 'react-redux'
import { useEvm, useNetwork, ChainId, getChainName } from '@dapplabs/evm'
import LoadingOverlay from './components/Overlay'
import ClockLoader from 'react-spinners/ClockLoader'
import { Header } from './components/Header/index'
import Campaign from './pages/Campaign'
import Collections from './pages/Collections'
import Assets from './pages/Assets'
import Mint from './pages/Mint'
import theme from './helpers/theme'
import supportedChains from './helpers/supportedChains'

function App({ isLoadingActive }: { isLoadingActive: boolean }) {
  const { activateBrowserWallet, account, chainId } = useEvm()

  const { switchNetwork } = useNetwork()

  const isInSupportedChains = () => {
    if (chainId) {
      return Object.keys(supportedChains).includes(chainId.toString())
    }
    return false
  }

  return (
    <ChakraProvider theme={theme}>
      <CSSReset />

      <LoadingOverlay active={isLoadingActive}>
        <ClockLoader color="rgb(74, 211, 166)" />
      </LoadingOverlay>

      <Box bg={useColorModeValue('gray.50', 'gray.900')}>
        {
          !account ? (
            <Flex alignItems={'center'} minH={'100vh'} margin={'auto'} justifyContent={'center'}>
              <VStack>
                <Button colorScheme={'teal'} onClick={() => activateBrowserWallet()}>Connect wallet</Button>
              </VStack>
            </Flex>
          ) : !isInSupportedChains() ? (
              <Flex alignItems={'center'} minH={'100vh'} margin={'auto'} justifyContent={'center'}>
                <VStack>
                  <Menu isLazy>
                    <MenuButton as={Button} colorScheme={'teal'}>Switch Network</MenuButton>
                    <MenuList>
                      <MenuItem onClick={() => switchNetwork(ChainId.EmeraldTestnet)}>
                        { getChainName(ChainId.EmeraldTestnet) }
                      </MenuItem>
                      <MenuItem onClick={() => switchNetwork(ChainId.Mumbai)}>
                        { getChainName(ChainId.Mumbai) }
                      </MenuItem>
                    </MenuList>
                  </Menu>

                  <Text size={'sm'} display={'block'} color={'red'}>* You are connected to an unsupported network</Text>
                </VStack>
              </Flex>
            ) : (
              <>
                <Header />
        
                <Box pt={'calc(60px + 1rem)'}>
                  <Switch>
                    <Route exact path="/collections">
                      <Collections />
                    </Route>
                    <Route exact path="/collections/assets">
                      <Assets />
                    </Route>
                    <Route path="/token/mint">
                      <Mint />
                    </Route>
                    <Route path="/token/campaign">
                      <Campaign />
                    </Route>
        
                    <Redirect from="/" to="/collections" />
                  </Switch>
                </Box>
              </>
            )
        }
      </Box>
     
    </ChakraProvider>
  )
}

const mapStateToProps = (state: any) => {
  return {
    isLoadingActive: state.isLoading,
  }
}

export default connect(mapStateToProps)(App)
