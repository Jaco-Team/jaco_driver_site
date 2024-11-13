import { useState, useEffect } from 'react';

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
import TextareaAutosize from '@mui/material/TextareaAutosize';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import SwipeableDrawer from '@mui/material/SwipeableDrawer';

import { useGraphStore, useHeaderStore } from '@/components/store.js';
import useSession from '@/components/sessionHook';

import dayjs from 'dayjs';

import Meta from '@/components/meta.js';

import { roboto } from '@/ui/Font';

function SwipeableTemporaryDrawer() {
  const session = useSession();

  const [ isOpenMenu, setOpenMenu, setCloseMenu, getGraph, month_list ] = useGraphStore( state => [ state.isOpenMenu, state.setOpenMenu, state.setCloseMenu, state.getGraph, state.month_list ] )

  const [ globalFontSize ] = useHeaderStore(state => [ state.globalFontSize ]);

  return (
    <SwipeableDrawer
      anchor={'bottom'}
      open={isOpenMenu}
      onClose={setCloseMenu}
      onOpen={setOpenMenu}
    >
      <List className={'monthList ' + roboto.variable}>
        { month_list.map( (item, key) =>
          <ListItem disablePadding key={key} className={ parseInt(item.is_active) == 1 ? 'active' : '' } onClick={ () => getGraph(item.day, session?.token) }>
            <ListItemButton>
              <ListItemText  primary={item.mounth} 
                sx={{
                  "& .MuiTypography-root": {
                    fontSize: globalFontSize,
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ) }
      </List>
    </SwipeableDrawer>
  );
}

function ModalErr() {
  const session = useSession();

  const [ isOpenModalErr, closeModalErr, showErrOrderCum, showErrOrder, false_err_order, false_err_cam, errText, setTextErr ] = useGraphStore( state => [ state.isOpenModalErr, state.closeModalErr, state.showErrOrderCum, state.showErrOrder, state.false_err_order, state.false_err_cam, state.errText, state.setTextErr ] )

  const [ globalFontSize ] = useHeaderStore(state => [ state.globalFontSize ]);

  return (
    <SwipeableDrawer
      anchor={'bottom'}
      open={isOpenModalErr}
      onClose={ closeModalErr }
      className={'modalErr ' + roboto.variable}
      onOpen={ () => {} }
    >
      <DialogContent>
        <div className="lineModal" />

        { !showErrOrder ? null :
          <>
            <Typography component="span" style={{ color: '#000', fontSize: globalFontSize }}>Ошибка по заказу №{showErrOrder.order_id}</Typography>
          
            <div style={{ width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
              <Typography component="span" style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>Дата заказа: </Typography>
              <Typography component="span" style={{ fontSize: globalFontSize, color: '#000' }}> {showErrOrder.date_time_order}</Typography>  
            </div>
            
            <div style={{ width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
              <Typography component="span" style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>Ошибка заказа: </Typography>
              <Typography component="span" style={{ fontSize: globalFontSize, color: '#000' }}> {showErrOrder.order_desc}</Typography>  
            </div>
            
            <div style={{ width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
              <Typography component="span" style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>Позиция: </Typography>
              <Typography component="span" style={{ fontSize: globalFontSize, color: '#000' }}> {showErrOrder.item_name}</Typography>  
            </div>
            
            <div style={{ width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
              <Typography component="span" style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>Ошибка: </Typography>
              <Typography component="span" style={{ fontSize: globalFontSize, color: '#000' }}> {showErrOrder.pr_name}</Typography>  
            </div>
            
            <div style={{ width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
              <Typography component="span" style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>Сумма: </Typography>
              <Typography component="span" style={{ fontSize: globalFontSize, color: '#000' }}> {showErrOrder.my_price}₽</Typography>  
            </div>
            
            { showErrOrder.imgs.length == 0 ? null :
              <div style={{ width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                <Typography component="span" style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>Фото</Typography>
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
                <Typography component="span" style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>Причина обжалования:</Typography>
                <TextareaAutosize
                  style={{ width: '100%', minHeight: 50 }}
                  value={errText}
                  onChange={ event => { setTextErr(event.target.value) } }
                />
                
                <Button
                  onClick={ () => false_err_order(session?.token, errText, showErrOrder.err_id, showErrOrder.row_id) }
                  style={{ color: '#fff', marginTop: 10, width: '100%', backgroundColor: '#c03' }}
                >
                  Обжаловать
                </Button>
              </div>
                :
              <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                <Typography component="span" style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>Причина обжалования:</Typography>
                <Typography component="span" style={{ fontSize: globalFontSize, color: '#000' }}>{showErrOrder.new_text_1}</Typography>  
              </div>
            }
            
            { !showErrOrder.new_text_2 || showErrOrder.new_text_2.length == 0 ? null :
              <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                <Typography component="span" style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>Ответ обжалования:</Typography>
                <Typography component="span" style={{ fontSize: globalFontSize, color: '#000' }}>{showErrOrder.new_text_2}</Typography>  
              </div>
            }
          </>
        }
        
        { !showErrOrderCum ? null :
          <>
            <Typography style={{ color: '#000', fontSize: globalFontSize }}>Ошибка №{showErrOrderCum.id}</Typography>
          
            <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
              <Typography style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>Дата время ошибки: </Typography>
              <Typography style={{ fontSize: globalFontSize, color: '#000' }}>{showErrOrderCum.date_time_fine}</Typography>  
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
              <Typography style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>Ошибка: </Typography>
              <Typography style={{ fontSize: globalFontSize, color: '#000' }}>{showErrOrderCum.fine_name}</Typography>  
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
              <Typography style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>Сумма: </Typography>
              <Typography style={{ fontSize: globalFontSize, color: '#000' }}>{showErrOrderCum.price}</Typography>  
            </div>
            
            { showErrOrderCum.imgs.length == 0 ? null :
              <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                <Typography style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>Фото</Typography>
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
                <Typography style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>Причина обжалования:</Typography>
                <TextareaAutosize
                  style={{ width: '100%', minHeight: 50 }}
                  value={errText}
                  onChange={ event => { setTextErr(event.target.value) } }
                />
                
                <Button
                  onClick={ () => false_err_cam(session?.token, errText, showErrOrderCum.id) }
                  style={{ color: '#fff', marginTop: 10, width: '100%', backgroundColor: '#c03' }}
                >
                  Обжаловать
                </Button>
              </div>
                :
              <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                <Typography style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>Причина обжалования:</Typography>
                <Typography style={{ fontSize: globalFontSize, color: '#000' }}>{showErrOrderCum.text_one}</Typography>  
              </div>
            }
            
            { !showErrOrderCum.text_two || showErrOrder.text_two.length == 0 ? null :
              <div style={{ display: 'flex', flexDirection: 'row', width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                <Typography style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>Ответ обжалования:</Typography>
                <Typography style={{ fontSize: globalFontSize, color: '#000' }}>{showErrOrderCum.text_two}</Typography>  
              </div>
            }
          </>
        }
      </DialogContent>
    </SwipeableDrawer>
  );
}

function AlertErr() {
  const [ isshowErrOrder, textErrOrder, closeErrOrder ] = useGraphStore( state => [ state.isshowErrOrder, state.textErrOrder, state.closeErrOrder ] );

  const [ globalFontSize ] = useHeaderStore(state => [ state.globalFontSize ]);

  return (
    <Dialog onClose={closeErrOrder} open={isshowErrOrder}>
      <DialogTitle style={{ fontSize:globalFontSize }}>{textErrOrder}</DialogTitle>
      
      <DialogActions>
        <Button onClick={closeErrOrder} autoFocus style={{ fontSize:globalFontSize }}>Хорошо</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function GraphPage(){
  const session = useSession();

  const [ month, setMonth ] = useState('');
  const [ setOpenMenu, getGraph, month_list, dates, users, err_orders, err_cam, openModalErr ] = useGraphStore( state => [ state.setOpenMenu, state.getGraph, state.month_list, state.dates, state.users, state.err_orders, state.err_cam, state.openModalErr ] )

  const [ globalFontSize ] = useHeaderStore(state => [ state.globalFontSize ]);

  const [ is_load, setIsLoad ] = useState( false );

  useEffect( () => {
    const my_m = month_list.find( it => parseInt(it.is_active) == 1 );
    if( my_m ){
      setMonth(my_m['mounth'])
    }
  }, [month_list] )

  useEffect( () => {
    const fetchData = async () => {
      if( session?.token ){
        const res = await getGraph(dayjs(new Date()).format('YYYY-MM'), session?.token);
  
        setIsLoad(true);
      }
    }
  
    if( !is_load ){
      fetchData();    
    }
  }, [] )

  return (
    <Meta title='График работы'>
      <Grid container spacing={3} className={"graph " + roboto.variable}>
      
        <Grid item xs={12}>
          <Button variant="text" style={{ fontSize: globalFontSize }} onClick={setOpenMenu}>{month}</Button>
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
                        style={ {width: 50, height: 30, textAlign: 'center', border: '1px solid #e5e5e5', fontSize: globalFontSize} }
                      >
                        {cellData.day}
                      </TableCell>
                    )}
                    
                  </TableRow>
                  
                  <TableRow>
                    <TableCell
                      style={ {width: 200, height: 30, textAlign: 'center', border: '1px solid #e5e5e5', fontSize: globalFontSize} }
                    >
                      Сотрудник
                    </TableCell>
                    
                    {dates.map((cellData, cellIndex) => 
                      <TableCell
                        key={cellIndex}
                        style={ {width: 50, height: 30, textAlign: 'center', border: '1px solid #e5e5e5', fontSize: globalFontSize} }
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
                        <TableCell key={cellIndex} style={cellIndex == 0 ? {width: 200, height: 30} : {width: 50, height: 30, textAlign: 'center', border: '1px solid #e5e5e5', fontSize: globalFontSize}}>
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
              
          <Typography style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>Ошибки по заказам</Typography>
          
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontSize: globalFontSize }}>Заказ</TableCell>
                    <TableCell style={{ fontSize: globalFontSize }}>Дата заказа</TableCell>
                    <TableCell style={{ fontSize: globalFontSize }}>Ошибка</TableCell>
                    <TableCell style={{ fontSize: globalFontSize }}>Довоз</TableCell>
                    <TableCell style={{ fontSize: globalFontSize }}>Сумма</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  { err_orders.map( (rowData, index) =>
                    <TableRow hover key={index} onClick={ () => { openModalErr('showErrOrder', rowData) } }>
                      <TableCell style={{ fontSize: globalFontSize }}>{rowData.order_id}</TableCell>
                      <TableCell style={{ fontSize: globalFontSize }}>{rowData.date_time_order}</TableCell>
                      <TableCell style={{ fontSize: globalFontSize }}>{rowData.pr_name}</TableCell>
                      <TableCell style={{ fontSize: globalFontSize }}>{parseInt(rowData['new_order_id']) > 0 ? '+' : ' '}</TableCell>
                      <TableCell style={{ fontSize: globalFontSize }}>{rowData.my_price+' р.'}</TableCell>
                    </TableRow>
                  ) }
                </TableBody>
              </Table>
            </TableContainer>
            
          </Paper>
        </Grid> 
            
        <Grid item xs={12} style={{ paddingTop: 20 }}>
          
          <Typography style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>Ошибки по камерам</Typography>
            
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontSize: globalFontSize }}>#</TableCell>
                    <TableCell style={{ fontSize: globalFontSize }}>Дата время совершения ошибки</TableCell>
                    <TableCell style={{ fontSize: globalFontSize }}>Ошибка</TableCell>
                    <TableCell style={{ fontSize: globalFontSize }}>Сумма</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  { err_cam.map( (rowData, index) =>
                    <TableRow hover key={index} onClick={ () => { openModalErr('showErrOrderCum', rowData) } }>
                      <TableCell style={{ fontSize: globalFontSize }}>{rowData.id}</TableCell>
                      <TableCell style={{ fontSize: globalFontSize }}>{rowData.date_time_fine}</TableCell>
                      <TableCell style={{ fontSize: globalFontSize }}>{rowData.fine_name}</TableCell>
                      <TableCell style={{ fontSize: globalFontSize }}>{rowData.price+' р.'}</TableCell>
                    </TableRow>
                  ) }
                </TableBody>
              </Table>
            </TableContainer>
            
          </Paper>
        </Grid> 

        <SwipeableTemporaryDrawer />
        <ModalErr />
        <AlertErr />
      </Grid>
    </Meta>
  )
}
