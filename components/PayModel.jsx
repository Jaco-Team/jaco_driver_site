import { useState, useEffect } from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { useOrdersStore } from '@/components/store.js';

import Script from 'next/script';

export default function PayModel() {
  const [showPay, payData, setShowPay, getCheckStatusPay] = useOrdersStore((state) => [state.showPay, state.payData, state.setShowPay, state.getCheckStatusPay]);

  const [is_load, setIsLoad] = useState(false);

  useEffect(() => {
    if (payData) {
      setTimeout(() => {
        setIsLoad(true);
      }, 300);

      const interval = setInterval(() => {
        getCheckStatusPay(payData.check_data);
      }, 5000);
       
      return () => clearInterval(interval);
    }
  }, [payData]);

  return (
    <>
      {!is_load ? false : <Script src="./qr.nspk.ru_js_index-NF27QMF3.js" />}

      <SwipeableDrawer
        anchor={'bottom'}
        open={showPay}
        onClose={() => setShowPay(false)}
        className="modalOrderPay"
        onOpen={ () => {} }
      >
        <div className="lineModal" />

        <div id="payment-form" />

        <div id="app_url">{payData?.confirmation.confirmation_data}</div>
      </SwipeableDrawer>
    </>
  );
}
