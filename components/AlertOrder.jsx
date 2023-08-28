import * as React from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { useOrdersStore } from '@/components/store.js';

export default function AlertOrder() {
  const [ showErrOrder, textErrOrder, closeErrOrder ] = useOrdersStore( state => [ state.showErrOrder, state.textErrOrder, state.closeErrOrder ] );

  return (
    <Dialog onClose={closeErrOrder} open={showErrOrder}>
      <DialogTitle>{textErrOrder}</DialogTitle>
      
      <DialogActions>
        <Button onClick={closeErrOrder} autoFocus>Хорошо</Button>
      </DialogActions>
    </Dialog>
  );
}