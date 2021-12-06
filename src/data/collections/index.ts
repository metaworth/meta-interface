import { Where } from '@textile/hub'

import { schema } from '../../models/collections/schema'
import { ClientWithThreadID } from '../textileClient'

export interface Collection {
  collectionName: string
  totalSupply: number
  description: string
  contractAddress: string
  symbol: string
  _id?: string
  ownerAddress: string
}

const TABLE_NAME = 'testCollections'

export const newCollectionCollection =async ({client, threadID}: ClientWithThreadID) => {
  // await client.updateCollection(ThreadID.fromString(':'), { name: 'collections', schema })
  await client?.newCollection(threadID, { name: TABLE_NAME, schema })
}

export const getCollectionByOwerAddress = async (clientWithThreadID: ClientWithThreadID, ownerAddress: string) => {
  const {client, threadID } = clientWithThreadID
  const query = new Where('ownerAddress').eq(ownerAddress)
  const storedCollections: Collection[] = await client.find(threadID, TABLE_NAME, query)

  return storedCollections
}

export const createCollection = async (clientWithThreadID: ClientWithThreadID, collection: Collection) => {
  const {client, threadID } = clientWithThreadID
  await client.create(threadID, TABLE_NAME, [collection])
}
