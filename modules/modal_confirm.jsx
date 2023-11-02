import { useOrdersStore } from '@/components/store.js';

import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

export default function Modal_Confirm() {
  const [actionFinishOrder, modalConfirm, order_finish_id, is_map, setActiveConfirm, type_confirm, actionCencelOrder, actionFakeOrder] = useOrdersStore((state) => [
    state.actionFinishOrder, state.modalConfirm, state.order_finish_id, state.is_map, state.setActiveConfirm, state.type_confirm, state.actionCencelOrder, state.actionFakeOrder]);

  return (
    <Dialog
      fullWidth={true}
      maxWidth="xs"
      open={modalConfirm}
      onClose={() => setActiveConfirm(false, null, false, null)}
    >
      <Grid style={{ backgroundColor: type_confirm === 'finish' ? '#3caa3c' : type_confirm === 'cancel' ? '#fc2847' : '#ffcc00'}}>
        <DialogTitle style={{ color: type_confirm === 'fake' ? '#000' : '#fff' }}>Подтвердите действие</DialogTitle>
        <DialogContent style={{ textAlign: 'center', padding: '24px 22px' }}>
          <Typography style={{ fontWeight: 'bold', color: type_confirm === 'fake' ? '#000' : '#fff' }}>
            Точно{' '}{type_confirm === 'finish' ? 'завершить заказ' : type_confirm === 'cancel' ? 'отменить заказ' : 'клиент не вышел на связь'}{' '}?
          </Typography>
        </DialogContent>
        <DialogActions style={{ justifyContent: 'space-between', padding: 16 }}>
          <Button onClick={() => setActiveConfirm(false, null, false, null)} variant="contained" style={{ background: '#808080' }}>
            Закрыть
          </Button>
          <Button onClick={ type_confirm === 'finish' ? () => actionFinishOrder(order_finish_id, is_map) : type_confirm === 'cancel' ? () => actionCencelOrder(order_finish_id, is_map) : () => actionFakeOrder(order_finish_id, is_map)}
            variant="contained"
            style={{ background: '#000' }}
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Grid>
    </Dialog>
  );
}
