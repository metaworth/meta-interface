import { ChainId, getChainName } from '@dapptools/evm'

const supportedTestnets = {
  [ChainId.EmeraldTestnet]: getChainName(ChainId.EmeraldTestnet),
  [ChainId.Stardust]: getChainName(ChainId.Stardust),
  [ChainId.Mumbai]: getChainName(ChainId.Mumbai),
}

const supportedMainnets = {
  [ChainId.Emerald]: getChainName(ChainId.Emerald),
}

const getSupportedChains = () => {
  const hostname = window.location.hostname

  if (hostname && hostname.startsWith('app')) {
    return supportedMainnets
  }

  return supportedTestnets
}

const supportedChains = getSupportedChains()

export default supportedChains
