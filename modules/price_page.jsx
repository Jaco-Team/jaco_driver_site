import { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
 
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableFooter from '@mui/material/TableFooter';
 
import { usePriceStore, useHeaderStore } from '@/components/store.js';
import MyDatepicker from '@/ui/MyDatepicker'
import dayjs from 'dayjs';

import useSession from '@/components/sessionHook';

import Meta from '@/components/meta.js';

import { roboto } from '@/ui/Font';

export default function PricePage(){

  const session = useSession();

  const [ date, setDate ] = useState( dayjs(new Date()) );
  const [ statPrice, give_hist, getStat ] = usePriceStore( state => [ state.statPrice, state.give_hist, state.getStat ] )
  const [ globalFontSize ] = useHeaderStore(state => [ state.globalFontSize ]);
  
  useEffect( () => {
    if( session?.isAuth === true ){
      getStat(dayjs(date).format('YYYY-MM-DD'), session?.token);
    }
  }, [date] )

  return (
    <Meta title='Расчет'>
      <Grid container spacing={3} className={"price " + roboto.variable}>
      
      <Grid item xs={12} >

        <MyDatepicker
          label={'Дата'}
          value={date}
          onChange={setDate}
          fontSize={globalFontSize}
        />

      </Grid>

      <Grid item xs={12} >
        <List>
          <ListItem disablePadding>
            <ListItemButton>
              <b style={{ fontSize: globalFontSize }}>Cумма нала: </b>
              <span style={{ fontSize: globalFontSize }}>{new Intl.NumberFormat('ru-RU').format(statPrice?.sum_cash)} ₽</span>
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <b style={{ fontSize: globalFontSize }}>Cумма безнала: </b>
              <span style={{ fontSize: globalFontSize }}>{new Intl.NumberFormat('ru-RU').format(statPrice?.sum_bank)} ₽</span>
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <b style={{ fontSize: globalFontSize }}>Заработал: </b>
              <span style={{ fontSize: globalFontSize }}>{new Intl.NumberFormat('ru-RU').format(statPrice?.my_price)} ₽</span>
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <b style={{ fontSize: globalFontSize }}>Сдача: </b>
              <span style={{ fontSize: globalFontSize }}>{new Intl.NumberFormat('ru-RU').format(statPrice?.sdacha)} ₽</span>
            </ListItemButton>
          </ListItem>

          

          <ListItem disablePadding className='dopPadding'>
            <ListItemButton>
              <b style={{ fontSize: globalFontSize }}>Налички: </b>
              <span style={{ fontSize: globalFontSize }}>{new Intl.NumberFormat('ru-RU').format(statPrice?.my_cash)} ₽</span>
            </ListItemButton>
          </ListItem>

          

          <ListItem disablePadding>
            <ListItemButton>
              <b style={{ fontSize: globalFontSize }}>Количество по налу: </b>
              <span style={{ fontSize: globalFontSize }}>{new Intl.NumberFormat('ru-RU').format(statPrice?.count_cash)}</span>
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <b style={{ fontSize: globalFontSize }}>Количество по безналу: </b>
              <span style={{ fontSize: globalFontSize }}>{new Intl.NumberFormat('ru-RU').format(statPrice?.count_bank)}</span>
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <b style={{ fontSize: globalFontSize }}>Завершенных заказов: </b>
              <span style={{ fontSize: globalFontSize }}>{new Intl.NumberFormat('ru-RU').format(statPrice?.count)}</span>
            </ListItemButton>
          </ListItem>
          
        </List>


      </Grid>

      <Grid item xs={12} >
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ fontSize: globalFontSize }}>Время</TableCell>
                <TableCell style={{ fontSize: globalFontSize }}>Сданная сумма</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { give_hist.map( (rowData, index) =>
                <TableRow hover key={index}>
                  <TableCell style={{ fontSize: globalFontSize }}>{rowData.time}</TableCell>
                  <TableCell style={{ fontSize: globalFontSize }}>{new Intl.NumberFormat('ru-RU').format(rowData.give)} ₽</TableCell>
                </TableRow>
              ) }
            </TableBody>
            
            <TableFooter>
              <TableRow>
                <TableCell style={{ fontSize: globalFontSize }}>Всего сдал</TableCell>
                <TableCell style={{ fontSize: globalFontSize }}>{new Intl.NumberFormat('ru-RU').format(statPrice?.full_give)} ₽</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ fontSize: globalFontSize }}>Осталось сдать</TableCell>
                <TableCell style={{ fontSize: globalFontSize }}>{new Intl.NumberFormat('ru-RU').format(statPrice?.my_cash)} ₽</TableCell>
              </TableRow>
            </TableFooter>
            
          </Table>
        </TableContainer>
              
      </Grid>

      </Grid>
    </Meta>
  )
}
