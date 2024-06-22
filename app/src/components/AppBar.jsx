import { useContext } from 'react'
import { Context } from './State'

import { Badge, Box, IconButton } from '@chakra-ui/react'
import { PiHandCoinsDuotone } from 'react-icons/pi'

export const AppBar = () => {
  const ctx = useContext(Context)

  return (
    <Box
      backgroundColor="blue.200"
      position="fixed"
      zIndex={1}
      boxShadow="md"
      p={1}
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Badge colorScheme="blue">Connected Account:</Badge>
        <span className="address">{ctx.account}</span>
      </Box>

      <IconButton
        onClick={() => ctx.dispatch({ type: 'TOGGLE_ESCROW_FORM' })}
        colorScheme="blue"
        icon={<PiHandCoinsDuotone />}
      ></IconButton>
    </Box>
  )
}
