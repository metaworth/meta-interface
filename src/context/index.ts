import { createContext } from 'react'
import { Client } from '@textile/hub'
import { Web3Storage } from 'web3.storage'

interface TextileInterface {
  threadDBClient?: Client
  threadID?: string
  web3Storage?: Web3Storage
}

const TextileContext = createContext<TextileInterface>({})

export { TextileContext }
