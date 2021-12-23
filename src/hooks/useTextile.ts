import { useEffect, useState } from 'react'
import { Client, ThreadID } from '@textile/hub'
import * as textileClient from '../data/textileClient'

export default function useTextile() {
  const [threadDBClient, setThreadDBClient] = useState<Client>()
  const [threadID, setThreadID] = useState<ThreadID>()

  useEffect(() => {
    const getThreadDBClient = async () => {
      const { client, threadID } =  await textileClient.getThreadDbClientWithThreadID('metaworth')
      setThreadDBClient(client)
      setThreadID(threadID)
    }

    if (!threadDBClient) {
      getThreadDBClient()
    }

  }, [threadDBClient])

  return { threadDBClient, threadID }
}
