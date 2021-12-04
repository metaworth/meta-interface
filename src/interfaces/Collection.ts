import {Collection} from '../data/collections';

type CollectionInterface =  Omit<Collection, "ownerAddress"> & {
  id: string
  imageUrl?: string
}

export default CollectionInterface
