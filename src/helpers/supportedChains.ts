import { ChainId, getChainName } from '@dapptools/evm'

const supportedChains = {
   [ChainId.Mumbai]: getChainName(ChainId.Mumbai),
   [ChainId.EmeraldTestnet]: getChainName(ChainId.EmeraldTestnet)
}

export default supportedChains
