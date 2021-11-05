import { useCallback } from 'react'
import { useEthers, ChainId } from 'web3-sdk'

const EMERALD_MAINNET_PARAMS = {
  chainId: '0xA86A',
  chainName: 'Avalanche Mainnet C-Chain',
  nativeCurrency: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18
  },
  rpcUrls: ['https://emerald.rpc'],
  blockExplorerUrls: ['https://explorer.emerald.network/']
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

type NetworkId = ChainId

interface NativeCurrency {
  name: string
  symbol: string
  decimals: number
}

export interface Network {
  name: string
  chainId: ChainId | string
  shortName?: string
  chain?: string
  network?: string
  networkId?: NetworkId
  nativeCurrency: NativeCurrency
  rpc: string[]
  faucets?: string[]
  explorers?: string[]
  infoURL?: string
}

export function useNetwork() {
  const { library, chainId: connectedChainId } = useEthers()

  const addNetwork = useCallback(async (network: Network) => {
    const hexedChainId = verifyChainId(network.chainId)
    if (!library || !library.provider) return

    await library.provider.request!({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: hexedChainId,
          chainName: network.name,
          nativeCurrency: network.nativeCurrency,
          rpcUrls: network.rpc,
          blockExplorerUrls: network.explorers
        }
      ]
    })
  }, [library])

  const switchNetwork = async (chainId: ChainId | string) => {
    const cId = verifyChainId(chainId)
    // Check if the user wallet is already on `chainId`
    const currentNetwork = fromDecimalToHex(connectedChainId || -1)
    if (currentNetwork === cId) return
    await library && library?.provider && library.provider.request!({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: cId }],
    })
  }

  const addPolygonMainnet = async (chainId: string | number) => {
    chainId = verifyChainId(chainId)
    // Check if the user wallet is already on `chainId`
    const currentNetwork = fromDecimalToHex(connectedChainId || -1)
    if (currentNetwork === chainId) return

    if (library && library.provider) {
      await library.provider.request!({
        method: 'wallet_addEthereumChain',
        params: [POLYGON_MAINNET_PARAMS]
      })
    }
  }

  return { addNetwork, switchNetwork, addPolygonMainnet }
}

function fromDecimalToHex(number: number) {
  if (typeof number !== 'number') throw Error('The input provided should be a number')
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
