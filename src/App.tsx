import { Switch, Route, Redirect } from 'react-router-dom'
import {
  ChakraProvider,
  useColorModeValue,
  CSSReset,
  Box,
} from '@chakra-ui/react'
import { connect } from 'react-redux'
import LoadingOverlay from './components/Overlay'
import ClockLoader from 'react-spinners/ClockLoader'
import { Header } from './components/Header/index'
import Campaign from './pages/Campaign'
import Collections from './pages/Collections'
import Assets from './pages/Assets'
import Mint from './pages/Mint'
import theme from './helpers/theme'

function App({ isLoadingActive }: { isLoadingActive: boolean }) {
  return (
    <ChakraProvider theme={theme}>
      <CSSReset />

      <LoadingOverlay active={isLoadingActive}>
        <ClockLoader color="rgb(74, 211, 166)" />
      </LoadingOverlay>
      <Header />

      <Box
        bg={useColorModeValue('gray.50', 'gray.900')}
        pt={'calc(60px + 1rem)'}
      >
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
    </ChakraProvider>
  )
}

const mapStateToProps = (state: any) => {
  return {
    isLoadingActive: state.isLoading,
  }
}

export default connect(mapStateToProps)(App)
