interface FileMetadata extends File {
  name: string
  path?: string
  size: number
  type: string
  lastModified: number
  lastModifiedDate?: Date
  preview?: string
  cid: string
}

export default FileMetadata
