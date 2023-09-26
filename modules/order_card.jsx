import React, { useState } from 'react';

import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

import { useOrdersStore } from '@/components/store.js';

import { roboto } from '@/ui/Font';

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#000',
    color: '#fff',
    marginTop: 0,
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
    borderRadius: 5
  },
}));

export default function OrderCard({item, is_map = false}){

  const [ openTooltip, setOpenTooltip ] = useState(false);
  const [ actionCencelOrder, actionGetOrder, actionFakeOrder, actionPayOrder, setActiveConfirmFinish ] = useOrdersStore( state => [ state.actionCencelOrder, state.actionGetOrder, state.actionFakeOrder, state.actionPayOrder, state.setActiveConfirmFinish ] )

  return(
    <div className={"OrderCard " + roboto.variable}>

      <div className="lineModal" />
          
      <div className='number'>
        <Typography component="span">{item.id_text}</Typography>
      </div>
      
      <div className='counts'>
        
        { parseInt(item.count_other) == 0 ? null :
          <Typography className='Blue' style={{ marginRight: 5 }} component="span">Роллы</Typography>
        }

        { parseInt(item.count_pasta) == 0 ? null :
          <Typography className='Purpur' style={{ marginRight: 5 }} component="span">Паста x{item.count_pasta}</Typography>
        }
        
        { parseInt(item.count_pizza) == 0 ? null :
          <Typography className='Red' style={{ marginLeft: 5, marginRight: 5 }} component="span">Пицца x{item.count_pizza}</Typography>
        }
        
        { parseInt(item.count_drink) == 0 ? null :
          <HtmlTooltip
            style={{ marginTop: 0 }}
            open={openTooltip}
            onClose={ () => { setOpenTooltip(false) } }
            title={
              <React.Fragment>
                { item.drink_list.map( (drink, k) =>
                  <Typography key={k} className="text" style={{paddingBottom: 5, paddingTop: 2, color: '#fff'}}>{drink.names}</Typography>
                ) }
              </React.Fragment>
            }
          >
            <Typography onClick={ () => { setOpenTooltip(true) } } className='Green' style={{ marginLeft: 5, marginRight: 5 }} component="span">Напиток x{item.count_drink}</Typography>
          </HtmlTooltip>
        }
        
      </div>
      
      <div className='addr'>
        
        <div className='addr_1'>
          <Typography component="span">Адрес: </Typography>
          <Typography component="span">{item.addr}</Typography>
        </div>
        
        <div className='addr_2'>
          
          { item.pd.length == 0 || parseInt(item.pd) == 0 ? null :
            <>
              <Typography component="b">Пд:</Typography>
              <Typography component="span">{item.pd}, </Typography>
            </>
          }
          
          { item.et.length == 0 || parseInt(item.et) == 0 ? null :
            <>
              <Typography component="b">Эт: </Typography>
              <Typography component="span">{item.et}, </Typography>
            </>
          }
          
          { item.kv.length == 0 || parseInt(item.kv) == 0 ? null :
            <>
              <Typography component="b">Кв:</Typography>
              <Typography component="span">{item.kv}</Typography>
            </>
          }
        </div>
        
        { parseInt(item.fake_dom) == 0 ?
          <Typography className='addr_3' component="span">Домофон не работает</Typography>
            :
          null
        }
        
        <div className='by_time'>
          <Typography component="span">Ко времени: </Typography>
          <Typography component="span">{item.need_time}</Typography>  
        </div>
        
        { parseInt(item.status_order) !== 1 ? null :
          <div className='by_time_1'>
            <Typography component="span">Начнут готовить: </Typography>
            <Typography component="span">{item.time_start_order}</Typography>
          </div>
        }
        
        { parseInt(item.status_order) !== 6 ? null :
          <div className='by_time_1'>
            <Typography component="span">Отдали: </Typography>
            <Typography component="span">{item.close_date_time_order}</Typography>
          </div>
        }
        
        { parseInt(item.status_order) == 6 ? null :
          <div className='by_time_1'>
            <Typography component="span">Осталось: </Typography>
            <Typography component="span">{item.to_time}</Typography>
          </div>
        }
        
      </div>
      
      { item.comment.length == 0 ? null :
        <div className='comment'>
          <Typography component="span">Комментарий: </Typography>
          <Typography component="span">{item.comment}</Typography>
        </div>
      }
      
      { parseInt(item.is_delete) == 0 ? null :
        <div className='comment'>
          <Typography component="span">Причина удаления: </Typography>
          <Typography component="span">{item.delete_reason}</Typography>
        </div>
      }
      <div className='block_price'>
        <Typography component="span">Сумма: </Typography>
        
        { parseInt(item.online_pay) == 1 ?
          <Typography component="span" className="is_paid">Оплачено</Typography>
            :
          <Typography component="span">{item.sum_order}₽</Typography>
        }
      </div>
      
      { parseInt( item.sdacha ) == 0 || parseInt(item.online_pay) == 1 ? null :
        <div className='comment'>
          <Typography component="span">Сдача с: </Typography>
          <Typography component="span">{item.sdacha}₽ ( {item.sum_sdacha}₽ )</Typography>
        </div>
      }
      
      { parseInt(item.is_get) == 0 ?
        <div className='action_get'>
          <a href={"tel:"+item.number}>{item.number}</a>
          <Button onClick={ () => actionGetOrder(item.id, is_map) }>Взять</Button>
        </div>
          :
        parseInt(item.is_get) == 1 && parseInt(item.is_my) == 1 ?
          <div className='action_my'>
            
            <div>
              { parseInt(item.status_order) == 6 ? null :
                <Button onClick={ () => actionCencelOrder(item.id, is_map) }>Отменить</Button>
              }
              <a href={"tel:"+item.number}>{item.number}</a>
            </div>
            
            { parseInt(item.status_order) == 6 ? null :
              parseInt(item.is_my) === 1 && parseInt(item.online_pay) === 0 ?
              <Grid className='finish_group'>
                <Button  onClick={() => setActiveConfirmFinish(true, item.id, is_map)}>Завершить</Button>
                <Button  onClick={ () => actionPayOrder(item.id, is_map) } ><QrCodeScannerIcon /></Button>
              </Grid>
              :
              <Button className='finish' onClick={ () => setActiveConfirmFinish(true, item.id, is_map) }>Завершить</Button>
            }

            { parseInt(item.status_order) == 6 ? null :
              <Button className='client' onClick={ () => actionFakeOrder(item.id, is_map) }>Клиент не вышел на связь</Button>
            }
          </div>
            :
          <div className='action_other'>
            <Button>{item.driver_name}</Button>
            <a href={"tel:"+item.driver_login}>{item.driver_login}</a>
          </div>
      }
      
    </div>
  )
}
