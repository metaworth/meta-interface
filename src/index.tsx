import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ColorModeScript } from '@chakra-ui/react'
import { ChainId, Config, DAppProvider } from '@dapplabs/evm'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { store } from './store'
import theme from './helpers/theme'

const config: Config = {
  readOnlyChainId: ChainId.Mainnet,
  readOnlyUrls: {
    [ChainId.Mainnet]: process.env.REACT_APP_MAINNET_RPC_ENDPOINT || '',
    [ChainId.Rinkeby]: process.env.REACT_APP_RINKEBY_RPC_ENDPOINT || '',
    [ChainId.Polygon]: process.env.REACT_APP_POLYGON_RPC_ENDPOINT || '',
    [ChainId.Mumbai]: process.env.REACT_APP_MUMBAI_RPC_ENDPOINT || '',
    [ChainId.EmeraldTestnet]: process.env.REACT_APP_EMERALD_TESTNET_RPC_ENDPOINT || '',
  },
}

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <BrowserRouter>
        <Provider store={store}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <App />
        </Provider>
      </BrowserRouter>
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
