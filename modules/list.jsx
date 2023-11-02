import { useEffect } from 'react';

import { useOrdersStore } from '@/components/store.js';

import Grid from '@mui/material/Grid';
import CachedIcon from '@mui/icons-material/Cached';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import OrderCard from '@/modules/order_card';
import Meta from '@/components/meta.js';
import Modal_Confirm from './modal_confirm';

import { roboto } from '@/ui/Font';

export default function ListPage() {
  const [
    orders,
    getOrders,
    type,
    setOpenMenu,
    update_interval,
    limit,
    limit_count,
  ] = useOrdersStore((state) => [
    state.orders,
    state.getOrders,
    state.type,
    state.setOpenMenu,
    state.update_interval,
    state.limit,
    state.limit_count,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      getOrders(false, false);
    }, parseInt(update_interval) * 1000);

    return () => clearInterval(interval);
  }, [update_interval]);

  return (
    <Meta title="Список заказов">
      <Grid
        container
        spacing={3}
        className={'list ' + roboto.variable}
        style={{ display: 'flex', justifyContent: 'center' }}
      >
        <Grid item xs={12}>
          <Button variant="text" onClick={setOpenMenu}>
            {type.text}
          </Button>
          <Button variant="text" onClick={() => getOrders(false, true)}>
            <CachedIcon />
          </Button>
        </Grid>

        <Grid
          item
          xs={12}
          style={{
            display: 'flex',
            justifyContent:
              limit_count?.length > 0 ? 'space-between' : 'center',
            maxWidth: '70%',
          }}
        >
          <Typography
            style={{ fontSize: 20, fontWeight: 'bold', color: '#000' }}
            component="span"
          >
            {limit}
          </Typography>
          {limit_count?.length > 0 ? (
            <Typography
              style={{ fontSize: 20, fontWeight: 'bold', color: '#000' }}
              component="span"
            >
              {limit_count}
            </Typography>
          ) : (
            false
          )}
        </Grid>
      </Grid>

      <Grid container spacing={3} className="list_orders">
        {orders.map((item, key) => (
          <Grid item xs={12} sm={3} key={key} style={{ paddingLeft: 0 }}>
            <OrderCard key={key} item={item} is_map={false} />
          </Grid>
        ))}
      </Grid>

      <Modal_Confirm />
    </Meta>
  );
}
