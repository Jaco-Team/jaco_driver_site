import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { log } from '@/components/analytics';
import type { Order } from '@/entities/order/model/order.types';
import { useConnectivityStore } from '@/features/offline/model/connectivity.store';
import { getApiErrorInfo } from '@/shared/api/errors';
import { readDriverPosition } from '@/shared/lib/geolocation';
import { ErrorModal } from '@/shared/ui/ErrorModal/ErrorModal';

import { requestOrderRecommendation } from '../api/orderRecommendation.api';
import { buildOrderRecommendationRequest } from '../model/buildOrderRecommendationRequest';
import type {
  OrderRecommendationResult,
  RecommendationCoordinates,
} from '../model/orderRecommendation.types';
import { OrderRecommendationDrawer } from './OrderRecommendationDrawer';

interface OrderRecommendationControlProps {
  orders: Order[];
  pointId: number | null;
  limit: string;
  limitCount: string;
  globalFontSize: number;
  disabled?: boolean;
}

function clampFontSize(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function OrderRecommendationControl({
  orders,
  pointId,
  limit,
  limitCount,
  globalFontSize,
  disabled: disabledByPage = false,
}: OrderRecommendationControlProps) {
  const isOnline = useConnectivityStore((state) => state.isOnline);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OrderRecommendationResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');

  const handleRequest = async () => {
    if (isLoading || disabledByPage || orders.length === 0 || !isOnline) return;

    setIsLoading(true);
    setError('');
    log('order_recommendation_requested', 'Запрошен совет по заказам');

    try {
      const position = await readDriverPosition();
      const courier: RecommendationCoordinates | null =
        position.latitude && position.longitude
          ? { lat: Number(position.latitude), lon: Number(position.longitude) }
          : null;
      const payload = buildOrderRecommendationRequest({
        orders,
        pointId,
        limit,
        limitCount,
        courier:
          courier && Number.isFinite(courier.lat) && Number.isFinite(courier.lon) ? courier : null,
      });
      const response = await requestOrderRecommendation(payload);

      if (!response.st) {
        throw new Error(response.text || 'Не удалось получить совет по заказам.');
      }

      setResult(response);
      setIsOpen(true);
      log('order_recommendation_opened', 'Открыт совет по заказам');
    } catch (requestError) {
      const apiError = getApiErrorInfo(requestError);
      setError(apiError.message || 'Не удалось получить совет по заказам. Попробуйте ещё раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const disabled = isLoading || disabledByPage || orders.length === 0 || !isOnline;

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Button
          fullWidth
          variant="contained"
          disableElevation
          disabled={disabled}
          onClick={handleRequest}
          startIcon={
            isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeRoundedIcon />
          }
          sx={{
            minHeight: 48,
            borderRadius: '16px',
            textTransform: 'none',
            fontSize: clampFontSize(globalFontSize, 14, 18),
            fontWeight: 750,
            color: 'primary.contrastText',
            backgroundColor: 'primary.main',
            '&:hover': { backgroundColor: 'primary.dark' },
          }}
        >
          {isLoading ? 'Подбираем заказы…' : 'Спросить ИИ, что лучше взять'}
        </Button>
        {!isOnline && (
          <Typography
            sx={{
              mt: 0.75,
              textAlign: 'center',
              color: 'text.secondary',
              fontSize: clampFontSize(globalFontSize - 2, 12, 15),
            }}
          >
            Совет доступен только с интернетом
          </Typography>
        )}
      </Box>

      <OrderRecommendationDrawer
        open={isOpen}
        result={result}
        orders={orders}
        onClose={() => {
          setIsOpen(false);
          log('order_recommendation_closed', 'Закрыт совет по заказам');
        }}
      />

      <ErrorModal open={Boolean(error)} errorText={error} onClose={() => setError('')} />
    </>
  );
}
