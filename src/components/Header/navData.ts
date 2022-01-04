export interface NavItem {
  label: string
  subLabel?: string
  children?: Array<NavItem>
  href?: any
  onMobileNavToggle?: any
}

export const NAV_ITEMS: Array<NavItem> = [
  {
    label: 'Asset Collection',
    href: '/collections',
  },
  {
    label: 'Generative Art',
    href: '/generative',
    children: [
      {
        label: 'Gift Card',
        subLabel: 'Mint NFTs as gift cards to your friends, community & family',
        href: '/generative/card',
      },
      // {
      //   label: 'Meta Engine',
      //   subLabel: 'Generate NFT assets with layered designs',
      //   href: '/generative/engine',
      // },
    ],
  },
  // {
  //   label: 'Social Token',
  //   href: '/token',
  //   children: [
  //     {
  //       label: 'Mint',
  //       subLabel: 'Launch a personal or community token',
  //       href: '/token/mint',
  //     },
  //     {
  //       label: 'Campaign',
  //       subLabel: 'Send rewards in batch to community and loyalty members, or someone who completed the specified task',
  //       href: '/token/campaign',
  //     },
  //   ],
  // },
]
