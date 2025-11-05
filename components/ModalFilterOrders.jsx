import React from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  useTheme
} from '@mui/material';
import BottomSheet from '@mui/material/Modal';
import { styled } from '@mui/material/styles';
import {useModalFilterOrdersLogic} from "@/components/useModalOrderLogic";

import { log } from '@/components/analytics';

const StyledBottomSheet = styled(BottomSheet)(({ theme }) => ({
  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  '& .MuiPaper-root': {
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
  '& .MuiBox-root': {
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

export const ModalFilterOrders = () => {
  const {
    globalFontSize,
    sheetIndex,
    types_dop,
    type_dop,
    setTypeDop,
    handleClose
  } = useModalFilterOrdersLogic();

  const theme = useTheme();

  const handleCheckboxChange = (event) => {
    const value = event.target.value;

    log('order_select', 'Выбор типа заказа');
    
    setTypeDop(
      event.target.checked
        ? [...type_dop, value]
        : type_dop.filter((item) => item !== value)
    );
  };

  return (
    <StyledBottomSheet
      open={sheetIndex !== -1}
      onClose={handleClose}
      sx={{
        zIndex: 1000,
      }}
    >
      <Box sx={{ p: 2,backgroundColor: 'white' }}>
        <Typography
          variant="h6"
          align="center"
          sx={{
            p: 2,
            fontSize: globalFontSize,
            fontWeight: 'bold',
          }}
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
                  sx={{
                    '& .MuiSvgIcon-root': {
                      fontSize: globalFontSize ? globalFontSize * 1.2 : '1.5rem',
                    },
                  }}
                />
              }
              label={
                <Typography
                  sx={{
                    fontSize: globalFontSize,
                    fontWeight: 500
                  }}
                >
                  {item.text}
                </Typography>
              }
              sx={{
                ml: 1,
                my: 0.5,
              }}
            />
          ))}
        </FormGroup>
      </Box>
    </StyledBottomSheet>
  );
};
