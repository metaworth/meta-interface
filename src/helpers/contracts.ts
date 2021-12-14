import { ChainId } from '@dapplabs/evm'
import { Interface } from 'ethers/lib/utils'

type Address = {
  [key: number]: string
}

type Contracts = {
  [key: string]: {
    address: Address,
    abi: Interface
  }
}

const contracts: Contracts = {
  'collection': {
    address: {
      [ChainId.EmeraldTestnet]: '0x54BcEf0006E2072d6EC0ef4E1fD087751AdC3cED',
      [ChainId.Mumbai]: '0xa6c5bE3B80BFf6EB7852B059a06A7eE9B05938bf',
    },
    abi: new Interface([
      'function predictMetaAddress(bytes32 salt) external view returns (address)',
      'function createNFT(bytes32 salt, uint256 _startPrice, uint256 _maxSupply, uint256 _nReserved, uint256 _maxTokensPerMint, string memory _uri, string memory _name, string memory _symbol) external'
    ])
  }
}

export default function getContract(name: string, chainId: ChainId | undefined) {
  if (!name || !chainId) return undefined
  const contractData = contracts[name]
  return {
    address: contractData.address[chainId],
    abi: contractData.abi
  }
}
