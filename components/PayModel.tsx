import { useEffect } from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Script from 'next/script';
import { useOrdersStore } from '@/components/store.js';

export default function PayModel() {
  const [showPay, payData, setShowPay, getCheckStatusPay] = useOrdersStore((state) => [
    state.showPay,
    state.payData,
    state.setShowPay,
    state.getCheckStatusPay,
  ]);

  useEffect(() => {
    if (!payData) {
      return;
    }

    const interval = window.setInterval(() => {
      getCheckStatusPay(payData.check_data);
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [getCheckStatusPay, payData]);

  return (
    <>
      {payData ? <Script src="./qr.nspk.ru_js_index-NF27QMF3.js" /> : null}

      <SwipeableDrawer
        anchor="bottom"
        open={showPay}
        onClose={() => setShowPay(false)}
        className="modalOrderPay"
        onOpen={() => {}}
      >
        <div className="lineModal" />

        <div id="payment-form" />

        <div id="app_url">{payData?.confirmation?.confirmation_data}</div>
      </SwipeableDrawer>
    </>
  );
}
