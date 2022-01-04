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
      // Mainnets
      [ChainId.Emerald]: '0x579249D214f09BDFE36f53Ff8a43E0A786f3Ad29',
      // Testnets
      [ChainId.EmeraldTestnet]: '0x89B399CddAD46d1BFd29d160eCd542Dd3D2868f5',
      [ChainId.Mumbai]: '0x9097E978b7F4Be9F01f5502038Eb066736EcC4C7',
      [ChainId.Stardust]: '0x89B399CddAD46d1BFd29d160eCd542Dd3D2868f5',
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
  },
  'card': {
    address: {
      // Mainnets
      [ChainId.Emerald]: '0xE91Db1A1C57B9672CF91E86bf43171b45905B823',
      // Testnets
      [ChainId.Stardust]: '0xf569dFA98374d4e593f81173A9B307151be2E597',
      [ChainId.Mumbai]: '0xEF4F751BB428F501f3392a777869165bC776EeA1',
      [ChainId.EmeraldTestnet]: '0xf569dFA98374d4e593f81173A9B307151be2E597',
    },
    abi: new Interface([
      'function batchMintWithSameURI(address[] calldata _addrs, string calldata _tokenURI) external returns (uint256[] memory)'
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
