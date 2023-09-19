import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import { useOrdersStore } from '@/components/store.js';

import Script from 'next/script';

export default function PayModel() {
  const [showPay, payData, setShowPay] = useOrdersStore((state) => [state.showPay, state.payData, state.setShowPay]);

  const [is_load, setIsLoad] = useState(false);

  useEffect(() => {
    if (payData) {
      setTimeout(() => {
        setIsLoad(true);
      }, 300);
    }
  }, [payData]);

  return (
    <>
      {!is_load ? false : <Script src="./qr.nspk.ru_js_index-NF27QMF3.js" />}

      <Drawer
        anchor={'bottom'}
        open={showPay}
        onClose={() => setShowPay(false)}
        className="modalOrderPay"
      >
        <div className="lineModal" />

        <div id="payment-form" />

        <div id="app_url">{payData?.confirmation.confirmation_data}</div>

        <Button className="btnGOOD">Хорошо</Button>
      </Drawer>
    </>
  );
}
