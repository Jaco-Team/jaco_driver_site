import { useState } from 'react';

import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import type { GraphErrorModal } from '@/entities/graph/model/types';
import { useHeaderStore } from '@/features/header/model/header.store';
import { GraphAlertDialog } from './GraphAlertDialog';
import { GraphErrorDrawer } from './GraphErrorDrawer';

const orderError: NonNullable<GraphErrorModal> & { kind: 'order' } = {
  kind: 'order',
  item: {
    order_id: 910001,
    date_time_order: '30.09.2026 10:45',
    order_desc: 'Тестовая ошибка доставки',
    item_name: 'Роллы',
    pr_name: 'Опоздание курьера',
    my_price: 300,
    imgs: [],
    is_edit: 0,
  },
};

const cameraError: NonNullable<GraphErrorModal> & { kind: 'camera' } = {
  kind: 'camera',
  item: {
    id: 910002,
    date_time_fine: '30.09.2026 11:10',
    fine_name: 'Не выполнена обязательная фотография',
    price: 250,
    imgs: [],
    is_edit: 0,
  },
};

// Mounted only on /graph?uiPreview=1 in a local development build.
// Preview buttons use only in-memory data and never submit appeals.
export function GraphUiPreview() {
  const globalFontSize = useHeaderStore((state) => state.globalFontSize);
  const [errorModal, setErrorModal] = useState<GraphErrorModal>(null);
  const [alertOpen, setAlertOpen] = useState(false);

  return (
    <>
      <Paper
        sx={{
          m: 2,
          p: 2,
          display: 'grid',
          gap: 1.5,
          backgroundColor: 'var(--app-surface)',
          color: 'var(--app-text)',
        }}
      >
        <Typography sx={{ fontSize: globalFontSize + 2, fontWeight: 700 }}>
          Локальная проверка окон графика
        </Typography>
        <Typography sx={{ fontSize: globalFontSize - 1, color: 'var(--app-text-muted)' }}>
          Только тестовые данные. Эти кнопки не отправляют обжалования.
        </Typography>
        <Button variant="outlined" onClick={() => setErrorModal(orderError)}>
          Ошибка по заказу
        </Button>
        <Button variant="outlined" onClick={() => setErrorModal(cameraError)}>
          Ошибка по камере
        </Button>
        <Button variant="outlined" onClick={() => setAlertOpen(true)}>
          Сообщение графика
        </Button>
      </Paper>

      <GraphErrorDrawer
        open={Boolean(errorModal)}
        isOnline={false}
        errorModal={errorModal}
        globalFontSize={globalFontSize}
        fontClassName=""
        appealText=""
        isSubmittingAppeal={false}
        onChangeAppealText={() => {}}
        onClose={() => setErrorModal(null)}
        onSubmitOrderAppeal={() => {}}
        onSubmitCameraAppeal={() => {}}
      />
      <GraphAlertDialog
        open={alertOpen}
        text="Тестовое сообщение графика. Действий не выполнено."
        globalFontSize={globalFontSize}
        onClose={() => setAlertOpen(false)}
      />
    </>
  );
}
