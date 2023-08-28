import React, { useEffect } from 'react';

import Grid from '@mui/material/Grid';
import CachedIcon from '@mui/icons-material/Cached';

import OrderCard from '@/modules/order_card';

//import Meta from '@/components/meta.js';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

import Button from '@mui/material/Button';

import SwipeableDrawer from '@mui/material/SwipeableDrawer';

import { useOrdersStore } from '@/components/store.js';
import AlertOrder from '@/components/AlertOrder';

function SwipeableTemporaryDrawer() {

  const [ isOpenMenu, setOpenMenu, setCloseMenu, types, setType ] = useOrdersStore( state => [ state.isOpenMenu, state.setOpenMenu, state.setCloseMenu, state.types, state.setType ] )

  return (
    <SwipeableDrawer
      anchor={'bottom'}
      open={isOpenMenu}
      onClose={setCloseMenu}
      onOpen={setOpenMenu}
    >
      <List className='monthList'>
        { types.map( (item, key) =>
          <ListItem disablePadding key={key} onClick={ () => setType(item) }>
            <ListItemButton>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ) }
      </List>
    </SwipeableDrawer>
  );
}

export default function ListPage(){

  const [ orders, getOrders, type, setOpenMenu, update_interval, limit ] = useOrdersStore( state => [ state.orders, state.getOrders, state.type, state.setOpenMenu, state.update_interval, state.limit ] )
  
  useEffect(() => {
    const interval = setInterval(() => {
      getOrders();
    }, parseInt(update_interval) * 1000);
     
    return () => clearInterval(interval);
  }, [update_interval] );

  return (
    <>
      <Grid container spacing={3} className="list">
        
        <Grid item xs={12}>
          <Button variant="text" onClick={setOpenMenu}>{type.text}</Button>
          <Button variant="text" onClick={getOrders}><CachedIcon /></Button>
        </Grid>
        <Grid item xs={12}>
          <span>{limit}</span>
        </Grid>

      </Grid>
        
      <Grid container spacing={3} className="list_orders">
            
        { orders.map( (item, key) =>
          <Grid item xs={12} sm={3} key={key} style={{ paddingLeft: 0 }}>
            <OrderCard key={key} item={item} is_map={false} />
          </Grid>
        ) }
      </Grid>

      <SwipeableTemporaryDrawer />
      <AlertOrder />
    </>
  )
}