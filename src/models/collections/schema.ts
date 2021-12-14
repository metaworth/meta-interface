export const schema = {
  title: "Collections",
  type: "object",
  required: ["_id"],
  properties: {
    _id: {
      type: "string",
      description: "The instance's id.",
    },
    contractAddress: {
      type: "string",
      description: "Collection Contract Address",
    },
    ownerAddress: {
      type: "string",
      description: "Owner Address",
    },
    symbol: {
      type: "string",
      description: "Symbol",
    },
    description: {
      type: "string",
      description: "The description of the Collection",
    },
    collectionName: {
      type: "string",
      description: "The collections name.",
    },
    totalSupply: {
      description: "The number of supply",
      type: "integer",
      minimum: 0,
    },
  },
}
