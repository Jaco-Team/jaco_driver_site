import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import type { Breakpoint } from '@mui/material/styles';

export function useFullscreen(bp: Breakpoint = 'xs'): boolean {
  const theme = useTheme();
  const query = bp === 'xs' ? theme.breakpoints.down('sm') : theme.breakpoints.down(bp);

  return useMediaQuery(query);
}
