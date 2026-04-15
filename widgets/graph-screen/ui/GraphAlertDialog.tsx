import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';

export function GraphAlertDialog({
  open,
  text,
  globalFontSize,
  onClose,
}: {
  open: boolean;
  text: string;
  globalFontSize: number;
  onClose: () => void;
}) {
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle style={{ fontSize: globalFontSize }}>{text}</DialogTitle>

      <DialogActions>
        <Button onClick={onClose} autoFocus style={{ fontSize: globalFontSize }}>
          Хорошо
        </Button>
      </DialogActions>
    </Dialog>
  );
}
