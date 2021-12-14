import { useEffect, useState } from 'react'
import { Client, Identity } from '@textile/hub'
import * as textileClient from "../data/textileClient";

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
  const identity = await textileClient.getIdentity();
  setIdentity(identity)
}

const getBuckets = async (bucketName: string, identity: Identity, setBuckets: any, setThreadId: any, setBucketKey: any) => {
  const {buckets, threadID, bucketKey} = await textileClient.getBucketByName(bucketName, identity);

  setBuckets(buckets)
  setThreadId(threadID)
  setBucketKey(bucketKey)
}

const getThreadDBClient = async (identity: Identity, setThreadDBClient: any) => {
  const client = await textileClient.getThreadDBClient(identity);
  setThreadDBClient(client)
}
