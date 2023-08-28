import React, { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';

import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import SwipeableDrawer from '@mui/material/SwipeableDrawer';

import { useGraphStore } from '@/components/store.js';
import { useSession } from 'next-auth/react';

import dayjs from 'dayjs';

function SwipeableTemporaryDrawer() {

  const [ isOpenMenu, setOpenMenu, setCloseMenu, getGraph, month_list ] = useGraphStore( state => [ state.isOpenMenu, state.setOpenMenu, state.setCloseMenu, state.getGraph, state.month_list ] )

  return (
    <SwipeableDrawer
      anchor={'bottom'}
      open={isOpenMenu}
      onClose={setCloseMenu}
      onOpen={setOpenMenu}
    >
      <List className='monthList'>
        { month_list.map( (item, key) =>
          <ListItem disablePadding key={key} className={ parseInt(item.is_active) == 1 ? 'active' : '' } onClick={ () => getGraph(item.day) }>
            <ListItemButton>
              <ListItemText primary={item.mounth} />
            </ListItemButton>
          </ListItem>
        ) }
      </List>
    </SwipeableDrawer>
  );
}

export default function GraphPage(){
  const session = useSession();

  const [ is_open_modal, setis_open_modal ] = useState(false);
  const [ showErrOrder, setShowErrOrder ] = useState(null);
  const [ showErrOrderCum, setShowErrOrderCum ] = useState(false);

  const [ month, setMonth ] = useState('');
  const [ setOpenMenu, getGraph, month_list, dates, users, err_orders, err_cam ] = useGraphStore( state => [ state.setOpenMenu, state.getGraph, state.month_list, state.dates, state.users, state.err_orders, state.err_cam ] )

  const [ is_load, setIsLoad ] = useState( false );

  useEffect( () => {
    const my_m = month_list.find( it => parseInt(it.is_active) == 1 );
    if( my_m ){
      setMonth(my_m['mounth'])
    }
  }, [month_list] )

  useEffect( () => {
    const fetchData = async () => {
      if( session.data?.user?.token ){
        const res = await getGraph(dayjs(new Date()).format('YYYY-MM'), session.data?.user?.token);
  
        setIsLoad(true);
      }
    }
  
    if( !is_load ){
      fetchData();    
    }
  }, [session] )

  return (
    <Grid container spacing={3} className="graph">
      
      <Dialog
        open={is_open_modal}
        onClose={ () => setis_open_modal(false) }
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          { !showErrOrder ? null :
            <>
              <Typography component="span" style={{ color: '#000', fontSize: 15 }}>Ошибка по заказу №{showErrOrder.order_id}</Typography>
            
              <div style={{ width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                <Typography component="span" style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Дата заказа: </Typography>
                <Typography component="span" style={{ fontSize: 15, color: '#000' }}> {showErrOrder.date_time_order}</Typography>  
              </div>
              
              <div style={{ width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                <Typography component="span" style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Ошибка заказа: </Typography>
                <Typography component="span" style={{ fontSize: 15, color: '#000' }}> {showErrOrder.order_desc}</Typography>  
              </div>
              
              <div style={{ width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                <Typography component="span" style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Позиция: </Typography>
                <Typography component="span" style={{ fontSize: 15, color: '#000' }}> {showErrOrder.item_name}</Typography>  
              </div>
              
              <div style={{ width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                <Typography component="span" style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Ошибка: </Typography>
                <Typography component="span" style={{ fontSize: 15, color: '#000' }}> {showErrOrder.pr_name}</Typography>  
              </div>
              
              <div style={{ width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                <Typography component="span" style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Сумма: </Typography>
                <Typography component="span" style={{ fontSize: 15, color: '#000' }}> {showErrOrder.my_price}₽</Typography>  
              </div>
              
              { showErrOrder.imgs.length == 0 ? null :
                <div style={{ width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                  <Typography component="span" style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Фото</Typography>
                </div>
              }
              
              { showErrOrder.imgs.map( (item, key) =>
                <img
                  key={key}
                  style={{ width: '100%', height: 'auto' }}
                  //resizeMode="cover"
                  src={item}
                />
              ) }
              
              { !showErrOrder.new_text_1 || showErrOrder.new_text_1.length == 0 ? 
                parseInt(showErrOrder.is_edit) == 0 ? null :
                <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                  <Typography component="span" style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Причина обжалования:</Typography>
                  <TextareaAutosize
                    style={{ width: '100%', minHeight: 50 }}
                    value={this.state.textErr1}
                    onChange={ (event) => { this.setState({ textErr1: event.target.value }) } }
                  />
                  
                  <Button
                    onClick={this.false_err.bind(this, showErrOrder)}
                    style={{ color: '#fff', marginTop: 10, width: '100%', backgroundColor: '#c03' }}
                  >
                    Обжаловать
                  </Button>
                </div>
                  :
                <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                  <Typography component="span" style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Причина обжалования:</Typography>
                  <Typography component="span" style={{ fontSize: 15, color: '#000' }}>{showErrOrder.new_text_1}</Typography>  
                </div>
              }
              
              { !showErrOrder.new_text_2 || showErrOrder.new_text_2.length == 0 ? null :
                <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                  <Typography component="span" style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Ответ обжалования:</Typography>
                  <Typography component="span" style={{ fontSize: 15, color: '#000' }}>{showErrOrder.new_text_2}</Typography>  
                </div>
              }
            </>
          }
          
          { !showErrOrderCum ? null :
            <>
              <Typography style={{ color: '#000', fontSize: 15 }}>Ошибка №{showErrOrderCum.id}</Typography>
            
              <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                <Typography style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Дата время ошибки: </Typography>
                <Typography style={{ fontSize: 15, color: '#000' }}>{showErrOrderCum.date_time_fine}</Typography>  
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                <Typography style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Ошибка: </Typography>
                <Typography style={{ fontSize: 15, color: '#000' }}>{showErrOrderCum.fine_name}</Typography>  
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                <Typography style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Сумма: </Typography>
                <Typography style={{ fontSize: 15, color: '#000' }}>{showErrOrderCum.price}</Typography>  
              </div>
              
              { showErrOrderCum.imgs.length == 0 ? null :
                <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                  <Typography style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Фото</Typography>
                </div>
              }
              
              { showErrOrderCum.imgs.map( (item, key) =>
                <img
                  key={key}
                  style={{ width: '100%', height: 'auto' }}
                  src={"https://jacochef.ru/src/img/fine_err/uploads/"+item}
                />
              ) }
              
              { !showErrOrderCum.text_one || showErrOrderCum.text_one.length == 0 ? 
                parseInt(showErrOrderCum.is_edit) == 0 ? null :
                <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                  <Typography style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Причина обжалования:</Typography>
                  <TextareaAutosize
                    style={{ width: '100%', minHeight: 50 }}
                    value={this.state.textErr2}
                    onChange={ (event) => { this.setState({ textErr2: event.target.value }) } }
                  />
                  
                  <Button
                    onClick={this.false_err_1.bind(this, showErrOrderCum)}
                    style={{ color: '#fff', marginTop: 10, width: '100%', backgroundColor: '#c03' }}
                  >
                    Обжаловать
                  </Button>
                </div>
                  :
                <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                  <Typography style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Причина обжалования:</Typography>
                  <Typography style={{ fontSize: 15, color: '#000' }}>{showErrOrderCum.text_one}</Typography>  
                </div>
              }
              
              { !showErrOrderCum.text_two || showErrOrder.text_two.length == 0 ? null :
                <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                  <Typography style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Ответ обжалования:</Typography>
                  <Typography style={{ fontSize: 15, color: '#000' }}>{showErrOrderCum.text_two}</Typography>  
                </div>
              }
            </>
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={ () => { this.setState({ showErrOrders: false, showErrOrder: null, showErrOrderCum: null }) } } color="primary">Закрыть</Button>
        </DialogActions>
      </Dialog>

      <Grid item xs={12}>
        <Button variant="text" onClick={setOpenMenu}>{month}</Button>
      </Grid>

      
      <Grid item xs={12}>
        <div sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 600 }} id="tableGraph">
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell style={ {width: 200, height: 30, textAlign: 'center', border: '1px solid #e5e5e5'} } />
                  
                  {dates.map((cellData, cellIndex) => 
                    <TableCell
                      key={cellIndex}
                      style={ {width: 50, height: 30, textAlign: 'center', border: '1px solid #e5e5e5'} }
                    >
                      {cellData.day}
                    </TableCell>
                  )}
                  
                </TableRow>
                
                <TableRow>
                  <TableCell
                    style={ {width: 200, height: 30, textAlign: 'center', border: '1px solid #e5e5e5'} }
                  >
                    Сотрудник
                  </TableCell>
                  
                  {dates.map((cellData, cellIndex) => 
                    <TableCell
                      key={cellIndex}
                      style={ {width: 50, height: 30, textAlign: 'center', border: '1px solid #e5e5e5'} }
                    >
                      {cellData.dow}
                    </TableCell>
                  )}
                </TableRow>
                
              </TableHead>
              <TableBody>
                { users.map( (rowData, index) =>
                  <TableRow hover key={index}>
                    { rowData.map( (cellData, cellIndex) =>
                      <TableCell key={cellIndex} style={cellIndex == 0 ? {width: 200, height: 30} : {width: 50, height: 30, textAlign: 'center', border: '1px solid #e5e5e5'}}>
                        {cellIndex == 0 ? cellData.user_name : cellData.min == '0' ? '' : cellData.hours}
                      </TableCell>
                    ) }
                  </TableRow>
                ) }
              </TableBody>
            </Table>
          </TableContainer>
          
        </div>
      </Grid>  
        
      <Grid item xs={12}>
            
        <Typography style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Ошибки по заказам</Typography>
        
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Заказ</TableCell>
                  <TableCell>Дата заказа</TableCell>
                  <TableCell>Ошибка</TableCell>
                  <TableCell>Довоз</TableCell>
                  <TableCell>Сумма</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                { err_orders.map( (rowData, index) =>
                  <TableRow hover key={index} onClick={ () => { setis_open_modal(true); setShowErrOrder(rowData); } }>
                    <TableCell>{rowData.order_id}</TableCell>
                    <TableCell>{rowData.date_time_order}</TableCell>
                    <TableCell>{rowData.pr_name}</TableCell>
                    <TableCell>{parseInt(rowData['new_order_id']) > 0 ? '+' : ' '}</TableCell>
                    <TableCell>{rowData.my_price+' р.'}</TableCell>
                  </TableRow>
                ) }
              </TableBody>
            </Table>
          </TableContainer>
          
        </Paper>
      </Grid> 
          
      <Grid item xs={12} style={{ paddingTop: 20 }}>
        
        <Typography style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Ошибки по камерам</Typography>
          
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Дата время совершения ошибки</TableCell>
                  <TableCell>Ошибка</TableCell>
                  <TableCell>Сумма</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                { err_cam.map( (rowData, index) =>
                  <TableRow hover key={index} >
                    <TableCell>{rowData.id}</TableCell>
                    <TableCell>{rowData.date_time_fine}</TableCell>
                    <TableCell>{rowData.fine_name}</TableCell>
                    <TableCell>{rowData.price+' р.'}</TableCell>
                  </TableRow>
                ) }
              </TableBody>
            </Table>
          </TableContainer>
          
        </Paper>
      </Grid> 

      <SwipeableTemporaryDrawer />

    </Grid>
  )
}