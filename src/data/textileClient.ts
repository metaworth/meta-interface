import {
  Client,
  Identity,
  KeyInfo,
  ThreadID,
  PrivateKey,
} from '@textile/hub'
import Cookies from 'universal-cookie'

let client: Client
const THREAD_ID = `meta-threads`
const cookies = new Cookies()

export interface ClientWithThreadID { 
  client?: Client, 
  threadID?: ThreadID 
}

export const getIdentity = async () => {
  const cached = cookies.get('user-private-identity')
  if (cached) {
    return PrivateKey.fromString(cached)
  }
  const privKey = process.env.REACT_APP_THREAD_PRIVATE_KEY || ''
  const identity = PrivateKey.fromString(privKey)
  cookies.set('user-private-identity', privKey)
  return identity
}

export const getThreadDBClient = async (identity?: Identity) => {
  try {
    const _identity = identity || (await getIdentity())
    const keyInfo: KeyInfo = { key: process.env.REACT_APP_TEXTILE_API_KEY || '' } // , secret: process.env.REACT_APP_TEXTILE_API_SECRET || ''

    // Create an expiration and create a signature. 60s or less is recommended.
    // const expiration = new Date(Date.now() + 60 * 1000)
    // const userAuth: UserAuth = await createUserAuth(keyInfo.key, keyInfo.secret ?? '', expiration)
    // await Client.withUserAuth(userAuth)

    const _client = client || (await Client.withKeyInfo(keyInfo))
    await _client.getToken(_identity)
    client = _client

    return _client
  } catch (err: any) {
    console.error('Error:', err.message || err)
    return new Client()
  }
}

const getOrCreateThreadDB = async (threadID: ThreadID, threadName: string) => {
  const res = await client.listDBs()
  const exists = res.find((db: any) => db.name === threadName)
  if (!exists) {
    await client.newDB(threadID, threadName)
  }
}

const getOrCreateThreadID = async (client: Client, threadName: string, threadID?: string): Promise<ThreadID> => {
  const cached = cookies.get(THREAD_ID)
  if (cached) {
    return ThreadID.fromString(cached)
  }

  let newThreadID: ThreadID = ThreadID.fromRandom()

  if (threadID) {
    const id = threadID
    const res = await client.listThreads()
    const exists = res.find((thread: any) => thread.id === id)
    if (!exists) {
      newThreadID = ThreadID.fromString(threadID)
      await getOrCreateThreadDB(newThreadID, threadName)
    }
  } else {
    try {
      const res = await client.getThread(threadName)
      newThreadID = typeof res.id === 'string' ? ThreadID.fromString(res.id) : ThreadID.fromBytes(res.id)
    } catch (error: any) {
      if (error.message !== 'Thread not found' && !error.message.includes('mongo: no documents in result')) {
        throw new Error(error.message)
      }

      await getOrCreateThreadDB(newThreadID, threadName)
    }
  }

  cookies.set(THREAD_ID, newThreadID.toString())
  return newThreadID
}

export const getThreadDbClientWithThreadID = async (
  threadName = 'metaworth',
  identity?: Identity
): Promise<ClientWithThreadID> => {
  const client = await getThreadDBClient(identity)
  const threadID = await getOrCreateThreadID(client, threadName)
  return { client, threadID }
}
