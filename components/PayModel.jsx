import * as React from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { useOrdersStore } from '@/components/store.js';

export default function AlertOrder() {
  const [ showPay ] = useOrdersStore( state => [ state.showPay ] );

  return (
    <Dialog onClose={ () => {} } open={showPay}>
      <DialogTitle></DialogTitle>
      
      <DialogActions>
        <Button autoFocus>Хорошо</Button>
      </DialogActions>
    </Dialog>
  );
}