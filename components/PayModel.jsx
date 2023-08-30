import * as React from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import { useOrdersStore } from '@/components/store.js';

export default function PayModel() {
  const [ showPay, payData ] = useOrdersStore( state => [ state.showPay, state.payData ] );

  /*React.useEffect( () => {
    if( payData ){
      const checkout = new window.YooMoneyCheckoutWidget({
        confirmation_token: payData.confirmation.confirmation_data, //Токен, который перед проведением оплаты нужно получить от ЮKassa
        //return_url: 'https://jacofood.ru/'+this.state.city_name+'/profile', //Ссылка на страницу завершения оплаты, это может быть любая ваша страница

        //При необходимости можно изменить цвета виджета, подробные настройки см. в документации
        //customization: {
        //Настройка цветовой схемы, минимум один параметр, значения цветов в HEX
        //colors: {
            //Цвет акцентных элементов: кнопка Заплатить, выбранные переключатели, опции и текстовые поля
            //control_primary: '#00BF96', //Значение цвета в HEX

            //Цвет платежной формы и ее элементов
            //background: '#F2F3F5' //Значение цвета в HEX
        //}
        //},
        
        //bank_card
        //sberbank
        //sbp

        customization: {
            //payment_methods: ['bank_card']
        },
        error_callback: function(error) {
          console.log(error)
        }
      });

    

      setTimeout( () => {
        checkout.render('payment-form');
      }, 300 )
    }
  }, [payData] )*/

  return (
    <Dialog onClose={ () => {} } open={showPay}>
      <DialogTitle></DialogTitle>
      
      <div id="payment-form" style={{ marginTop: 50 }} />

      { !payData ? false :
        <iframe
          id="inlineFrameExample"
          title="Inline Frame Example"
          width="300"
          height="800"
          src={payData?.confirmation.confirmation_data}
        >
        </iframe>
      }

      <DialogActions>
        <Button autoFocus>Хорошо</Button>
      </DialogActions>
    </Dialog>
  );
}