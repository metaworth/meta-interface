import { createContext } from 'react'
import { Client, ThreadID } from '@textile/hub'
import { Web3Storage } from 'web3.storage'

interface TextileInterface {
  threadDBClient?: Client
  threadID?: ThreadID
  web3Storage?: Web3Storage
}

const TextileContext = createContext<TextileInterface>({})

export { TextileContext }
