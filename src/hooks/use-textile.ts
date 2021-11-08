import { useEffect, useState } from 'react'
import { Buckets, Client, Identity, KeyInfo, PrivateKey } from '@textile/hub'


export default function useTextile (bucketName: string = 'metaworth') {
  const [identity, setIdentity] = useState()
  const [buckets, setBuckets] = useState()
  const [threadDBClient, setThreadDBClient] = useState<Client>()
  const [bucketKey, setBucketKey] = useState()
  const [threadId, setThreadId] = useState<string>('')

  useEffect(() => {
    if (!identity) {
      getIdentity(setIdentity)
    }

    if (identity && !buckets) {
      getBuckets(bucketName, identity, setBuckets, setThreadId, setBucketKey)
    }

    if (identity && !threadDBClient) {
      getThreadDBClient(identity, setThreadDBClient)
    }
  }, [identity, buckets, threadDBClient, bucketName])

  return { identity, buckets, threadDBClient, threadID: threadId, bucketKey }
}

const getIdentity = async (setIdentity: any) => {
  const cached = localStorage.getItem('user-private-identity')
  if (cached) {
    setIdentity(PrivateKey.fromString(cached))
  }
  const identity = await PrivateKey.fromRandom()
  localStorage.setItem('user-private-identity', identity.toString())
  setIdentity(identity)
}

const getBuckets = async (bucketName: string, identity: Identity, setBuckets: any, setThreadId: any, setBucketKey: any) => {
  if (!identity) return

  const keyInfo: KeyInfo = { key: process.env.REACT_APP_TEXTILE_API_KEY || '' }

  const buckets = await Buckets.withKeyInfo(keyInfo)
  await buckets.getToken(identity)

  const { root, threadID } = await buckets.getOrCreate(bucketName)
  if (!root) {
    throw new Error('Failed to open bucket')
  }

  setBuckets(buckets)
  setThreadId(threadID)
  setBucketKey(root.key)
}

const getThreadDBClient = async (identity: Identity, setThreadDBClient: any) => {
  if (!identity) return

  const keyInfo: KeyInfo = { key: process.env.REACT_APP_TEXTILE_API_KEY || '' }

  const client = await Client.withKeyInfo(keyInfo)
  await client.getToken(identity)

  setThreadDBClient(client)
}
