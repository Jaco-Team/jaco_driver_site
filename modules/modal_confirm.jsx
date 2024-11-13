import { useOrdersStore, useHeaderStore } from '@/components/store.js';

import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

export default function Modal_Confirm() {
  const [actionFinishOrder, modalConfirm, order_finish_id, is_map, setActiveConfirm, type_confirm, actionCencelOrder, actionFakeOrder, order_finish_is_delete] = useOrdersStore((state) => [
    state.actionFinishOrder, state.modalConfirm, state.order_finish_id, state.is_map, state.setActiveConfirm, state.type_confirm, state.actionCencelOrder, state.actionFakeOrder, state.order_finish_is_delete]);

    const [ globalFontSize ] = useHeaderStore(state => [ state.globalFontSize ]);

  return (
    <Dialog
      fullWidth={true}
      maxWidth="xs"
      open={modalConfirm}
      onClose={() => setActiveConfirm(false, null, false, null, null)}
    >
      <Grid style={{ backgroundColor: type_confirm === 'finish' ? '#3caa3c' : type_confirm === 'cancel' ? '#fc2847' : '#ffcc00'}}>
        <DialogTitle style={{ color: type_confirm === 'fake' ? '#000' : '#fff', fontSize: globalFontSize }}>Подтвердите действие</DialogTitle>
        <DialogContent style={{ textAlign: 'center', padding: '24px 22px' }}>
          <Typography style={{ fontWeight: 'bold', color: type_confirm === 'fake' ? '#000' : '#fff', fontSize: globalFontSize }}>
            {type_confirm === 'finish' ? parseInt(order_finish_is_delete) ? 'Заказ был отменен, точно завершить заказ' : 'Точно завершить заказ' : type_confirm === 'cancel' ? 'Точно отменить заказ' : 'Точно клиент не вышел на связь'}{' '}?
          </Typography>
        </DialogContent>
        <DialogActions style={{ justifyContent: 'space-between', padding: 16 }}>
          <Button onClick={() => setActiveConfirm(false, null, false, null, null)} variant="contained" style={{ background: '#808080', fontSize: globalFontSize }}>
            Закрыть
          </Button>
          <Button 
            onClick={ type_confirm === 'finish' ? () => actionFinishOrder(order_finish_id, is_map) : type_confirm === 'cancel' ? () => actionCencelOrder(order_finish_id, is_map) : () => actionFakeOrder(order_finish_id, is_map)}
            variant="contained"
            style={{ background: '#000', fontSize: globalFontSize }}
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Grid>
    </Dialog>
  );
}
