import { Where } from '@textile/hub'

import { schema } from '../../models/collections/schema'
import { ClientWithThreadID } from '../textileClient'

export interface Collection {
  contractName: string
  totalSupply: number
  description: string
  contractAddress: string
  symbol: string
  _id?: string
  ownerAddress: string
  numberOfReserved?: number
  maxTokensPerWallet?: number
  chainId?: number
}

const TABLE_NAME = 'testCollections'

export const newCollectionCollection = async ({ client, threadID }: ClientWithThreadID) => {
  if (!client || !threadID) return

  await client.newCollection(threadID, { name: TABLE_NAME, schema })
}

export const getCollectionByOwerAddress = async (clientWithThreadID: ClientWithThreadID, ownerAddress: string) => {
  const {client, threadID } = clientWithThreadID

  if (!client || !threadID) return []

  try {
    const query = new Where('ownerAddress').eq(ownerAddress)
    const storedCollections: Collection[] = await client.find(threadID, TABLE_NAME, query) ?? []

    return storedCollections
  } catch (error: any) {
    console.error('error:', error.message || error)
    return []
  }
}

export const addDataToThread = async (clientWithThreadID: ClientWithThreadID, collection: Collection) => {
  const {client, threadID } = clientWithThreadID
  
  if (!client || !threadID) return

  const res = await client.listCollections(threadID)
  const exists = res.find((coll: any) => coll.name === TABLE_NAME)
  if (!exists) {
    await newCollectionCollection({ client, threadID })
  }

  await client.create(threadID, TABLE_NAME, [collection])
}
