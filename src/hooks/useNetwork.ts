import { useCallback } from 'react'
import { useEthers, ChainId } from 'web3-sdk'


const AVALANCHE_MAINNET_PARAMS = {
  chainId: '0xA86A',
  chainName: 'Avalanche Mainnet C-Chain',
  nativeCurrency: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18
  },
  rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://cchain.explorer.avax.network/']
}

const AVALANCHE_TESTNET_PARAMS = {
  chainId: '0xA869',
  chainName: 'Avalanche Fuji Testnet',
  nativeCurrency: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18
  },
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://cchain.explorer.avax-test.network/']
}

const POLYGON_MAINNET_PARAMS = {
  chainId: verifyChainId('137'),
  chainName: 'Polygon Mainnet',
  nativeCurrency: {
    name: 'Polygon',
    symbol: 'MATIC',
    decimals: 18
  },
  rpcUrls: ['https://rpc-mainnet.matic.network', 'wss://ws-mainnet.matic.network'],
  blockExplorerUrls: ['https://polygonscan.com']
}

export function useNetwork() {
  const { library, chainId: currChainId } = useEthers()

  const addNetwork = useCallback(async (
    chainId: string | number,
    chainName: string,
    currencyName: string,
    currencySymbol: string,
    currencyDecimals = 18,
    rpcUrls: string | string[],
    blockExplorerUrls: string | string[]
  ) => {
    chainId = verifyChainId(chainId)
    if (!library || !library.provider) return
    await library.provider.request!({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId,
          chainName,
          nativeCurrency: {
            name: currencyName,
            symbol: currencySymbol,
            decimals: currencyDecimals,
          },
          rpcUrls,
          blockExplorerUrls
        }
      ]
    })
  }, [library])

  const switchNetwork = async (chainId: ChainId) => {
    const cId = verifyChainId(chainId)
    // Check if the user wallet is already on `chainId`
    const currentNetwork = fromDecimalToHex(currChainId || -1)
    if (currentNetwork === cId) return
    await library && library?.provider && library.provider.request!({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: cId }],
    })
  }

  const addAvalancheTestnet = async () => {
    if (library && library.provider) {
      await library.provider.request!({
        method: 'wallet_addEthereumChain',
        params: [AVALANCHE_TESTNET_PARAMS]
      })
    }
  }

  const addAvalancheMainnet = async (chainId: string) => {
    chainId = verifyChainId(chainId)
    // Check if the user wallet is already on `chainId`
    const currentNetwork = fromDecimalToHex(currChainId || -1)
    if (currentNetwork === chainId) return

    if (library && library.provider) {
      await library.provider.request!({
        method: 'wallet_addEthereumChain',
        params: [AVALANCHE_MAINNET_PARAMS]
      })
    }
  }

  const addPolygonMainnet = async (chainId: string | number) => {
    chainId = verifyChainId(chainId)
    // Check if the user wallet is already on `chainId`
    const currentNetwork = fromDecimalToHex(currChainId || -1)
    if (currentNetwork === chainId) return

    if (library && library.provider) {
      await library.provider.request!({
        method: 'wallet_addEthereumChain',
        params: [POLYGON_MAINNET_PARAMS]
      })
    }
  }

  return { addNetwork, switchNetwork, addAvalancheMainnet, addAvalancheTestnet, addPolygonMainnet }
}

function fromDecimalToHex(number: number) {
  if (typeof number !== 'number') throw 'The input provided should be a number'
  return `0x${number.toString(16)}`
}

// Convert the chainId to hex if it's a numeric type
function verifyChainId(chainId: number | string) {
  if (typeof chainId === 'number') {
    chainId = fromDecimalToHex(chainId)
  } else if (!chainId.startsWith('0x')) {
    chainId = `0x${Number(chainId).toString(16)}`
  }
  return chainId
}
