import { useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CachedIcon from '@mui/icons-material/Cached';
import Button from '@mui/material/Button';

import Meta from '@/components/meta.js';

import { useOrdersStore } from '@/components/store.js';

export default function MapPage(){

  const [ getOrders, type, update_interval, limit, limit_count, setType ] = 
    useOrdersStore( state => [ state.getOrders, state.type, state.update_interval, state.limit, state.limit_count, state.setType ] )

  useEffect(() => {
    const interval = setInterval(() => {
      getOrders(true);
    }, parseInt(update_interval) * 1000);
     
    return () => clearInterval(interval);
  }, [update_interval] );

  return (
    <Meta title='Карта заказов'>
      
      <Grid container spacing={3} className="map_orders" id="map_orders" />
            
      <div style={{ position: 'absolute', zIndex: 10, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '90%', left: '5%', bottom: 50, backgroundColor: '#000', opacity: 0.7, borderRadius: 60 }}>
        <Button className='noselect' style={{ flex: 3, color: type.id == 1 ? 'green' : '#fff', fontWeight: 'bold' }} onClick={ () => setType({ id: 1, text: 'Активные' }, true) }>Активные</Button>
        <Button className='noselect' style={{ flex: 1, color: type.id == 2 ? 'green' : '#fff', fontWeight: 'bold' }} onClick={ () => setType({ id: 2, text: 'Мои отмеченные' }, true) }>Мои</Button>
        <Button className='noselect' style={{ flex: 3, color: type.id == 5 ? 'green' : '#fff', fontWeight: 'bold' }} onClick={ () => setType({ id: 5, text: 'У других курьеров' }, true) }>У других</Button>
        
        <Button className='noselect' style={{ flex: 1 }} onClick={ () => getOrders(true) }><CachedIcon style={{ color: '#fff' }} /></Button>
      </div>
      
      <div style={{ position: 'absolute', zIndex: 10, display: 'flex', flexDirection: 'row', justifyContent: 'space-around', width: '90%', left: '5%', bottom: 90 }}>
        <Typography style={{ fontSize: 20, fontWeight: 'bold', color: '#000' }} component="span">{limit}</Typography>
        { limit_count.length > 0 ? <Typography style={{ fontSize: 20, fontWeight: 'bold', color: '#000' }} component="span">{limit_count}</Typography> : false }
      </div>
      
    </Meta>
  )
}
