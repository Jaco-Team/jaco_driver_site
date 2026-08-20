import React, { useState, memo, useMemo, useEffect } from 'react';
import { Card, CardContent, Typography, Chip, Box, Button, Tooltip, styled } from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { tooltipClasses } from '@mui/material/Tooltip';

import { extractPhonesFromText } from '@/shared/lib/extractPhones';
import {
  CommentPhonesControl,
  CommentPhonesDrawer,
} from '@/widgets/order/ui/components/CommentPhonesDrawer';

interface OrderCardProps {
  item: any;
  is_map?: boolean;
  globalFontSize: number;
  actionsDisabled?: boolean;
  onAction?: (action: string, orderId: number) => void;
  onPay?: (orderId: number) => void;
}

// Выносим вычисления за пределы компонента для мемоизации
const getIsDeleted = (item: any) => parseInt(item.is_delete) === 1;
const getIsMy = (item: any) => parseInt(item.is_my) === 1;
const getIsGet = (item: any) => parseInt(item.is_get) === 1;
const getStatusOrder = (item: any) => parseInt(item.status_order);
const getOnlinePay = (item: any) => parseInt(item.online_pay);
const getDriverPay = (item: any) => parseInt(item.driver_pay) === 1;

export const ORDER_CARD_BUTTON_HEIGHT = 44;
export const ORDER_CARD_DELETED_BG = '#d95030';

const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'isDeleted',
})<{ isDeleted?: boolean }>(({ isDeleted }) => ({
  borderRadius: 16,
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
  backgroundColor: isDeleted ? ORDER_CARD_DELETED_BG : '#fff',
  padding: 16,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
  },
}));

const InfoRow = styled(Box)({
  marginBottom: 8,
  overflowWrap: 'break-word',
});

const Label = styled((props: React.ComponentProps<typeof Typography>) => (
  <Typography component="span" {...props} />
))({
  display: 'inline',
  fontWeight: 600,
});

const Value = styled((props: React.ComponentProps<typeof Typography>) => (
  <Typography component="span" {...props} />
))({
  display: 'inline',
  fontWeight: 400,
});

const ActionButton = styled(Button)({
  textTransform: 'uppercase',
  fontWeight: 600,
  fontSize: '0.875rem',
  lineHeight: 1.2,
  borderRadius: 8,
  height: ORDER_CARD_BUTTON_HEIGHT,
  minHeight: ORDER_CARD_BUTTON_HEIGHT,
  maxHeight: ORDER_CARD_BUTTON_HEIGHT,
  padding: '0 16px',
  minWidth: 100,
  boxSizing: 'border-box',
});

const PhoneButton = styled(ActionButton)({
  backgroundColor: '#E0E0E0',
  color: 'inherit',
  width: '100%',
  textTransform: 'none',
  fontWeight: 500,
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: '#d5d5d5',
    boxShadow: 'none',
  },
});

const DriverInfoBox = styled(Box)({
  backgroundColor: '#E0E0E0',
  borderRadius: 8,
  height: ORDER_CARD_BUTTON_HEIGHT,
  minHeight: ORDER_CARD_BUTTON_HEIGHT,
  padding: '0 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.875rem',
  lineHeight: 1.2,
  fontWeight: 500,
  boxSizing: 'border-box',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const TakeButton = styled(ActionButton)({
  backgroundColor: '#4CAF50',
  color: '#fff',
  width: '100%',
  '&:hover': {
    backgroundColor: '#45a049',
  },
});

const CancelButton = styled(ActionButton)({
  backgroundColor: '#f44336',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#d32f2f',
  },
});

const FinishButton = styled(ActionButton)({
  backgroundColor: '#2196F3',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#1976d2',
  },
});

const FakeButton = styled(ActionButton)({
  backgroundColor: '#ff9800',
  color: '#fff',
  width: '100%',
  '&:hover': {
    backgroundColor: '#f57c00',
  },
});

const PayButton = styled(ActionButton)({
  backgroundColor: '#9c27b0',
  color: '#fff',
  minWidth: ORDER_CARD_BUTTON_HEIGHT,
  padding: '0 12px',
  '&:hover': {
    backgroundColor: '#7b1fa2',
  },
});

const ChipStyled = styled(Chip)({
  fontWeight: 500,
  marginRight: 8,
  marginBottom: 8,
});

const HtmlTooltip = styled(({ className, ...props }: any) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#000',
    color: '#fff',
    marginTop: 0,
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
    borderRadius: 5,
  },
}));

// Компонент для отображения чипов позиций (вынесен для мемоизации)
const OrderChips = memo(({ item }: { item: any }) => {
  const [openTooltip, setOpenTooltip] = useState(false);

  return (
    <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {parseInt(item.count_other) > 0 && (
        <ChipStyled label="Роллы" size="small" sx={{ backgroundColor: '#2196F3', color: '#fff' }} />
      )}
      {parseInt(item.count_pasta) > 0 && (
        <ChipStyled
          label={`Паста x${item.count_pasta}`}
          size="small"
          sx={{ backgroundColor: '#9c27b0', color: '#fff' }}
        />
      )}
      {parseInt(item.count_pizza) > 0 && (
        <ChipStyled
          label={`Пицца x${item.count_pizza}`}
          size="small"
          sx={{ backgroundColor: '#f44336', color: '#fff' }}
        />
      )}
      {parseInt(item.count_drink) > 0 && (
        <HtmlTooltip
          open={openTooltip}
          onClose={() => setOpenTooltip(false)}
          title={
            <Box>
              {item.drink_list?.map((drink: any, k: number) => (
                <Typography key={k} sx={{ padding: '5px 0', color: '#fff' }}>
                  {drink.names || drink.name}
                </Typography>
              ))}
            </Box>
          }
        >
          <ChipStyled
            label={`Напиток x${item.count_drink}`}
            size="small"
            onClick={() => setOpenTooltip(true)}
            sx={{ backgroundColor: '#4caf50', color: '#fff', cursor: 'pointer' }}
          />
        </HtmlTooltip>
      )}
    </Box>
  );
});

OrderChips.displayName = 'OrderChips';

// Компонент для кнопок своего заказа (вынесен для мемоизации)
const MyOrderActions = memo(
  ({
    item,
    statusOrder,
    onlinePay,
    driverPay,
    onAction,
    onPay,
    actionsDisabled,
  }: {
    item: any;
    statusOrder: number;
    onlinePay: number;
    driverPay: boolean;
    actionsDisabled?: boolean;
    onAction?: (action: string, orderId: number) => void;
    onPay?: (orderId: number) => void;
  }) => {
    const handleAction = (action: string) => {
      if (actionsDisabled) return;
      if (onAction) {
        onAction(action, item.id);
      }
    };

    const handlePay = () => {
      if (actionsDisabled) return;
      if (onPay) {
        onPay(item.id);
      }
    };

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {statusOrder !== 6 && (
            <CancelButton
              fullWidth
              variant="contained"
              disabled={actionsDisabled}
              onClick={() => handleAction('cancel')}
              sx={{ flex: 1 }}
              data-testid="order-card-cancel"
            >
              Отменить
            </CancelButton>
          )}
          <PhoneButton
            variant="contained"
            disableElevation
            href={`tel:${item.number}`}
            sx={{ flex: 1 }}
            data-testid="order-card-phone"
          >
            {item.number}
          </PhoneButton>
        </Box>

        {statusOrder !== 6 &&
          (onlinePay === 0 && driverPay ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FinishButton
                fullWidth
                variant="contained"
                disabled={actionsDisabled}
                onClick={() => handleAction('finish')}
                sx={{ flex: 1 }}
                data-testid="order-card-finish"
              >
                Завершить
              </FinishButton>
              <PayButton variant="contained" disabled={actionsDisabled} onClick={handlePay}>
                <QrCodeScannerIcon />
              </PayButton>
            </Box>
          ) : (
            <FinishButton
              fullWidth
              variant="contained"
              disabled={actionsDisabled}
              onClick={() => handleAction('finish')}
              data-testid="order-card-finish"
            >
              Завершить
            </FinishButton>
          ))}

        {statusOrder !== 6 && (
          <FakeButton
            fullWidth
            variant="contained"
            disabled={actionsDisabled}
            onClick={() => handleAction('fake')}
            data-testid="order-card-fake"
          >
            Клиент не вышел на связь
          </FakeButton>
        )}
      </Box>
    );
  }
);

MyOrderActions.displayName = 'MyOrderActions';

// Основной компонент с memo
export const OrderCard = memo<OrderCardProps>(
  ({ item, is_map = false, globalFontSize, actionsDisabled = false, onAction, onPay }) => {
    // Мемоизируем вычисляемые значения
    const isDeleted = getIsDeleted(item);
    const isMy = getIsMy(item);
    const isGet = getIsGet(item);
    const statusOrder = getStatusOrder(item);
    const onlinePay = getOnlinePay(item);
    const driverPay = getDriverPay(item);

    const handleAction = React.useCallback(
      (action: string) => {
        if (actionsDisabled) return;
        if (onAction) {
          onAction(action, item.id);
        }
      },
      [actionsDisabled, onAction, item.id]
    );

    const handlePay = React.useCallback(() => {
      if (actionsDisabled) return;
      if (onPay) {
        onPay(item.id);
      }
    }, [actionsDisabled, onPay, item.id]);

    const commentPhones = useMemo(() => extractPhonesFromText(item.comment), [item.comment]);
    const [commentPhonesOpen, setCommentPhonesOpen] = useState(false);

    useEffect(() => {
      if (commentPhones.length < 2) {
        setCommentPhonesOpen(false);
      }
    }, [commentPhones.length]);

    return (
      <>
        <StyledCard
          isDeleted={isDeleted}
          data-testid="order-card"
          style={{ fontSize: globalFontSize }}
          sx={
            is_map
              ? {
                  boxShadow: 'none',
                  borderRadius: 0,
                  padding: 0,
                  backgroundColor: isDeleted ? ORDER_CARD_DELETED_BG : 'transparent',
                  '&:hover': {
                    boxShadow: 'none',
                  },
                }
              : undefined
          }
        >
          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            {/* Номер заказа */}
            <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
              {item.id_text}
            </Typography>

            {/* Количество позиций */}
            <OrderChips item={item} />

            {/* Адрес */}
            <InfoRow>
              <Label variant="body1">Адрес: </Label>
              <Value variant="body1">{item.addr}</Value>
            </InfoRow>

            {/* Пд, Эт, Кв */}
            {(parseInt(item.pd) > 0 || parseInt(item.et) > 0 || parseInt(item.kv) > 0) && (
              <InfoRow>
                {parseInt(item.pd) > 0 && (
                  <>
                    <Label variant="body1">Пд: </Label>
                    <Value variant="body1">{item.pd}, </Value>
                  </>
                )}
                {parseInt(item.et) > 0 && (
                  <>
                    <Label variant="body1">Эт: </Label>
                    <Value variant="body1">{item.et}, </Value>
                  </>
                )}
                {parseInt(item.kv) > 0 && (
                  <>
                    <Label variant="body1">Кв: </Label>
                    <Value variant="body1">{item.kv}</Value>
                  </>
                )}
              </InfoRow>
            )}

            {/* Домофон */}
            {parseInt(item.fake_dom) === 0 && (
              <InfoRow>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  Домофон не работает
                </Typography>
              </InfoRow>
            )}

            {/* Ко времени */}
            <InfoRow>
              <Label variant="body1">Ко времени: </Label>
              <Value variant="body1">{item.need_time}</Value>
            </InfoRow>

            {/* Начнут готовить */}
            {statusOrder === 1 && (
              <InfoRow>
                <Label variant="body1">Начнут готовить: </Label>
                <Value variant="body1">{item.time_start_order}</Value>
              </InfoRow>
            )}

            {/* Отдали */}
            {statusOrder === 6 && item.close_date_time_order && (
              <InfoRow>
                <Label variant="body1">Отдали: </Label>
                <Value variant="body1">{item.close_date_time_order}</Value>
              </InfoRow>
            )}

            {/* Осталось */}
            {statusOrder !== 6 && (
              <InfoRow>
                <Label variant="body1">Осталось: </Label>
                <Value variant="body1">{item.to_time}</Value>
              </InfoRow>
            )}

            {/* Комментарий */}
            {item.comment && item.comment.length > 0 && (
              <InfoRow
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Label variant="body1">Комментарий: </Label>
                  <Value variant="body1">{item.comment}</Value>
                </Box>
                <CommentPhonesControl
                  phones={commentPhones}
                  onOpenMultiple={() => setCommentPhonesOpen(true)}
                />
              </InfoRow>
            )}

            {/* Причина удаления */}
            {isDeleted && item.delete_reason && (
              <InfoRow>
                <Label variant="body1">Причина удаления: </Label>
                <Value variant="body1">{item.delete_reason}</Value>
              </InfoRow>
            )}

            {/* Сумма */}
            <InfoRow>
              <Label variant="body1">Сумма: </Label>
              {onlinePay === 1 ? (
                <Value variant="body1" sx={{ color: '#4caf50' }}>
                  Оплачено
                </Value>
              ) : (
                <Value variant="body1">{item.sum_order}₽</Value>
              )}
            </InfoRow>

            {/* Сдача */}
            {parseInt(item.sdacha) !== 0 && onlinePay !== 1 && (
              <InfoRow>
                <Label variant="body1">Сдача с: </Label>
                <Value variant="body1">
                  {item.sdacha}₽ ({item.sum_sdacha}₽)
                </Value>
              </InfoRow>
            )}

            {/* Кнопки действий */}
            {!isGet ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <PhoneButton
                  variant="contained"
                  disableElevation
                  href={`tel:${item.number}`}
                  data-testid="order-card-phone"
                >
                  {item.number}
                </PhoneButton>
                <TakeButton
                  variant="contained"
                  disabled={actionsDisabled}
                  onClick={() => handleAction('take')}
                  data-testid="order-card-take"
                >
                  Взять
                </TakeButton>
              </Box>
            ) : isMy ? (
              <MyOrderActions
                item={item}
                statusOrder={statusOrder}
                onlinePay={onlinePay}
                driverPay={driverPay}
                actionsDisabled={actionsDisabled}
                onAction={onAction}
                onPay={onPay}
              />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <DriverInfoBox>Водитель: {item.driver_name}</DriverInfoBox>
                <PhoneButton variant="contained" disableElevation href={`tel:${item.driver_login}`}>
                  {item.driver_login}
                </PhoneButton>
              </Box>
            )}
          </CardContent>
        </StyledCard>
        {commentPhones.length > 1 ? (
          <CommentPhonesDrawer
            open={commentPhonesOpen}
            phones={commentPhones}
            globalFontSize={globalFontSize}
            onClose={() => setCommentPhonesOpen(false)}
          />
        ) : null}
      </>
    );
  }
);

OrderCard.displayName = 'OrderCard';

const areEqual = (prevProps: OrderCardProps, nextProps: OrderCardProps) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.status_order === nextProps.item.status_order &&
    prevProps.item.is_my === nextProps.item.is_my &&
    prevProps.item.is_get === nextProps.item.is_get &&
    prevProps.item.is_delete === nextProps.item.is_delete &&
    prevProps.item.comment === nextProps.item.comment &&
    prevProps.globalFontSize === nextProps.globalFontSize &&
    prevProps.is_map === nextProps.is_map &&
    prevProps.actionsDisabled === nextProps.actionsDisabled &&
    prevProps.onAction === nextProps.onAction &&
    prevProps.onPay === nextProps.onPay
  );
};
