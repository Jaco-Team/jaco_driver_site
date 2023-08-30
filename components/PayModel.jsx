import * as React from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { useOrdersStore } from '@/components/store.js';

import Script from 'next/script'

export default function PayModel() {
  const [ showPay, payData ] = useOrdersStore( state => [ state.showPay, state.payData ] );

  const [ is_load, setIsLoad ] = React.useState(false);

  React.useEffect( () => {
    if( payData ){
      setTimeout( () => {
        setIsLoad(true)
      }, 300 )
    }
  }, [payData] )

  return (
    <>
      
      { !is_load ? false : <Script src="./qr.nspk.ru_js_index-NF27QMF3.js" /> }
      

      <Dialog onClose={ () => {} } open={showPay}>
        <DialogTitle></DialogTitle>
        
        <div id="payment-form" style={{ marginTop: 50 }} />

        <div id="app_url">{payData?.confirmation.confirmation_data}</div>

        <DialogActions>
          <Button>Хорошо</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}