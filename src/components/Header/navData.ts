export interface NavItem {
  label: string
  subLabel?: string
  children?: Array<NavItem>
  href?: any
  onMobileNavToggle?: any
}

export const NAV_ITEMS: Array<NavItem> = [
  {
    label: 'Assets Inventory',
    href: '/',
  },
  {
    label: 'Social Token',
    href: '/token',
    children: [
      {
        label: 'Mint',
        subLabel: 'Launch a personal or community token',
        href: '/token/mint',
      },
      {
        label: 'Campaign',
        subLabel: 'Send rewards in batch to community and loyalty members, or someone who completed the specified task',
        href: '/token/campaign',
      },
    ],
  },
]
