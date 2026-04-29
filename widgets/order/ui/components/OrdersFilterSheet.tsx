import React from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

import { useHeaderStore } from '@/features/header/model/header.store';
import { useOrdersStore } from '@/entities/order/model/order.store';
import { log } from '@/shared/api/client';

const StyledBottomSheet = styled(Modal)(({ theme }) => ({
  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  '& .orders-map-filter-modal__sheet': {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.palette.background.paper,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: theme.spacing(2),
    maxHeight: '80vh',
    overflowY: 'auto',
  },
}));

export function OrdersFilterSheet() {
  const globalFontSize = useHeaderStore((state) => state.globalFontSize);
  const { types_dop, type_dop, is_showModalTypeDop, showModalTypeDop, setTypeDop } = useOrdersStore(
    (state) => ({
      types_dop: state.types_dop,
      type_dop: state.type_dop,
      is_showModalTypeDop: state.is_showModalTypeDop,
      showModalTypeDop: state.showModalTypeDop,
      setTypeDop: state.setTypeDop,
    })
  );

  const handleClose = () => showModalTypeDop(false);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    log('order_select', 'Выбор типа заказа');

    setTypeDop(
      event.target.checked ? [...type_dop, value] : type_dop.filter((item) => item !== value)
    );
  };

  return (
    <StyledBottomSheet open={is_showModalTypeDop} onClose={handleClose} sx={{ zIndex: 1000 }}>
      <Box className="orders-map-filter-modal__sheet">
        <Typography
          variant="h6"
          align="center"
          sx={{ p: 2, fontSize: globalFontSize, fontWeight: 'bold' }}
        >
          Только для Активных заказов
        </Typography>

        <Divider sx={{ my: 1 }} />

        <FormGroup>
          {types_dop.map((item) => (
            <FormControlLabel
              key={item.id}
              control={
                <Checkbox
                  checked={type_dop.includes(item.id.toString())}
                  onChange={handleCheckboxChange}
                  value={item.id.toString()}
                  sx={{ '& .MuiSvgIcon-root': { fontSize: globalFontSize * 1.2 } }}
                />
              }
              label={
                <Typography sx={{ fontSize: globalFontSize, fontWeight: 500 }}>
                  {item.text}
                </Typography>
              }
              sx={{ ml: 1, my: 0.5 }}
            />
          ))}
        </FormGroup>
      </Box>
    </StyledBottomSheet>
  );
}
