import { useOrdersStore } from '@/components/store.js';

import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

export default function Modal_Finish() {
  const [actionFinishOrder, modalFinish, order_finish_id, is_map, setActiveConfirmFinish] = useOrdersStore(state => [state.actionFinishOrder, state.modalFinish, state.order_finish_id, state.is_map, state.setActiveConfirmFinish]);
  
  return (
    <Dialog
      fullWidth={true}
      maxWidth="sm"
      open={modalFinish}
      onClose={() => setActiveConfirmFinish(false)}
    >
      <DialogTitle>Подтвердите действие</DialogTitle>
      <DialogContent align="center" style={{ paddingBottom: 10, paddingTop: 10 }}>
        <Typography style={{ fontWeight: 'bold' }}>Точно завершить?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setActiveConfirmFinish(false)}>Отмена</Button>
        <Button onClick={() => actionFinishOrder(order_finish_id, is_map)} color="success">Завершить</Button>
      </DialogActions>
    </Dialog>
  );
}