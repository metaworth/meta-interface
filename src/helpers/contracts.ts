import { ChainId } from '@dapptools/evm'
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
  'factory': {
    address: {
      [ChainId.EmeraldTestnet]: '0x87d5159313b3a9f8Aa7eCCd5Df5C29a41AC4Db3d',
      [ChainId.Mumbai]: '0xc426A786898B9d9f786a0c2b6AeB2289AAd15548',
    },
    abi: new Interface([
      'function predictMetaAddress(bytes32 salt) external view returns (address)',
      'function createNFT(bytes32 salt, uint256 _startPrice, uint256 _maxSupply, uint256 _nReserved, uint256 _maxTokensPerMint, string memory _uri, string memory _name, string memory _symbol) external'
    ])
  },
  'metaImplementation': {
    address: {},
    abi: new Interface([
      'function mint(string memory _tokenURI) external payable returns (uint256)',
      'function batchMint(string[] calldata _tokenURIs) external returns (uint256[] memory)',
      'function walletOfOwner(address _owner) external view returns(uint256[] memory)',
      'event MetaMintCompleted(address indexed _owner, uint256 indexed _tokenId)',
      'event BatchMintCompleted(address indexed _owner, uint256[] _tokenIds)'
    ])
  }
}

export default function getContract(name: string, chainId: ChainId | undefined) {
  if (!name || !chainId) return { address: '', abi: new Interface([]) }
  const contractData = contracts[name]
  return {
    address: contractData.address[chainId],
    abi: contractData.abi
  }
}
