import * as React from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { useOrdersStore } from '@/components/store.js';

export default function PayModel() {
  const [ showPay, payData ] = useOrdersStore( state => [ state.showPay, state.payData ] );

  React.useEffect( () => {
    if( payData ){
      
      

      //

    }
  }, [payData] )

  return (
    <Dialog onClose={ () => {} } open={showPay}>
      <DialogTitle></DialogTitle>
      
      <div id="payment-form" style={{ marginTop: 50 }} />

      

      <DialogActions>
        <Button autoFocus>Хорошо</Button>
      </DialogActions>
    </Dialog>
  );
}