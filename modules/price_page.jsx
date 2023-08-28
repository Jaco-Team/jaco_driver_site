import React, { useState, useEffect } from 'react';

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

import { usePriceStore } from '@/components/store.js';
import MyDatepicker from '@/ui/MyDatepicker'
import dayjs from 'dayjs';

export default function PricePage(){

  const [ date, setDate ] = useState( dayjs(new Date()) );
  const [ statPrice, give_hist, getStat ] = usePriceStore( state => [ state.statPrice, state.give_hist, state.getStat ] )
  
  useEffect( () => {
    getStat(dayjs(date).format('YYYY-MM-DD'))
  }, [date] )

  return (
    <Grid container spacing={3} className="price">
      
      <Grid item xs={12} >

        <MyDatepicker
          label={'Дата'}
          value={date}
          onChange={setDate}
        />

      </Grid>

      <Grid item xs={12} >
        <List>
          <ListItem disablePadding>
            <ListItemButton>
              <b>Cумма нала: </b>
              <span>{new Intl.NumberFormat('ru-RU').format(statPrice?.sum_cash)} ₽</span>
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <b>Cумма безнала: </b>
              <span>{new Intl.NumberFormat('ru-RU').format(statPrice?.sum_bank)} ₽</span>
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <b>Заработал: </b>
              <span>{new Intl.NumberFormat('ru-RU').format(statPrice?.my_price)} ₽</span>
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <b>Сдача: </b>
              <span>{new Intl.NumberFormat('ru-RU').format(statPrice?.sdacha)} ₽</span>
            </ListItemButton>
          </ListItem>

          

          <ListItem disablePadding className='dopPadding'>
            <ListItemButton>
              <b>Налички: </b>
              <span>{new Intl.NumberFormat('ru-RU').format(statPrice?.my_cash)} ₽</span>
            </ListItemButton>
          </ListItem>

          

          <ListItem disablePadding>
            <ListItemButton>
              <b>Количество по налу: </b>
              <span>{new Intl.NumberFormat('ru-RU').format(statPrice?.count_cash)}</span>
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <b>Количество по безналу: </b>
              <span>{new Intl.NumberFormat('ru-RU').format(statPrice?.count_bank)}</span>
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <b>Завершенных заказов: </b>
              <span>{new Intl.NumberFormat('ru-RU').format(statPrice?.count)}</span>
            </ListItemButton>
          </ListItem>
          
        </List>


      </Grid>

      <Grid item xs={12} >
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Время</TableCell>
                <TableCell>Сданная сумма</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { give_hist.map( (rowData, index) =>
                <TableRow hover key={index}>
                  <TableCell>{rowData.time}</TableCell>
                  <TableCell>{new Intl.NumberFormat('ru-RU').format(rowData.give)} ₽</TableCell>
                </TableRow>
              ) }
            </TableBody>
            
            <TableFooter>
              <TableRow>
                <TableCell>Всего сдал</TableCell>
                <TableCell>{new Intl.NumberFormat('ru-RU').format(statPrice?.full_give)} ₽</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Осталось сдать</TableCell>
                <TableCell>{new Intl.NumberFormat('ru-RU').format(statPrice?.my_cash)} ₽</TableCell>
              </TableRow>
            </TableFooter>
            
          </Table>
        </TableContainer>
              
      </Grid>

    </Grid>
  )
}