import { Colors, extendTheme, ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const colors: Colors = {
  meta: {
    50: '#4ad3a616',
    100: '#f7fafc',
    // 200: 'blue',
    // 300: 'red',
    // 400: 'green',
    500: '#4AD3A6',
    600: '#3BD3A5',
    700: '#dddfe2',
    // 800: 'black',
    900: '#1a202c',
  },
}

const theme = extendTheme({ config, colors })

export default theme
