import {
  Buckets,
  Client,
  Identity,
  KeyInfo,
  ThreadID,
  PrivateKey,
} from '@textile/hub'

let client: Client
const version = 10000 //Math.floor(Math.random() * 1000)
const USER_THREAD_ID = `user-thread-${version}`

export interface ClientWithThreadID { 
  client: Client, 
  threadID: ThreadID 
}
export const getIdentity = async () => {
  const cached = localStorage.getItem('user-private-identity')
  if (cached) {
    return PrivateKey.fromString(cached)
  }
  const identity = await PrivateKey.fromRandom()
  localStorage.setItem('user-private-identity', identity.toString())
  return identity
}

export const getThreadDBClient = async (identity?: Identity) => {
  const _identity = identity || (await getIdentity())
  const keyInfo: KeyInfo = { key: process.env.REACT_APP_TEXTILE_API_KEY || '' }

  const _client = client || (await Client.withKeyInfo(keyInfo))
  await _client.getToken(_identity)
  client = _client
  return _client
}

const getThreadID = async (bucketName: string, identity?: Identity): Promise<ThreadID> => {
  const cached = localStorage.getItem(USER_THREAD_ID)
  if (cached) {
    return ThreadID.fromString(cached)
  }
  const { threadID } = await getBucketByName(bucketName, identity)
  if (!threadID) {
    return ThreadID.fromRandom()
  }

  localStorage.setItem(USER_THREAD_ID, threadID)
  return ThreadID.fromString(threadID)
}

const getBuckets = async (identity?: Identity) => {
  const _identity = identity || (await getIdentity())
  const keyInfo: KeyInfo = { key: process.env.REACT_APP_TEXTILE_API_KEY || '' }

  const buckets = await Buckets.withKeyInfo(keyInfo)
  await buckets.getToken(_identity)
  return buckets
}

export const getBucketByName = async (
  bucketName: string,
  identity?: Identity
) => {
  const buckets = await getBuckets(identity)
  const { root, threadID } = await buckets.getOrCreate(bucketName)
  if (!root) {
    throw new Error('Failed to open bucket')
  }

  return { buckets, threadID, bucketKey: root.key }
}

export const getThreadDbClientWithThreadID = async (
  bucketName: string,
  identity?: Identity
): Promise<ClientWithThreadID> => {
  const client = await getThreadDBClient(identity)
  const threadID = await getThreadID(bucketName, identity)
  return { client, threadID }
}

export const defaultThreadDbClientWithThreadID = getThreadDbClientWithThreadID('metaworth')
