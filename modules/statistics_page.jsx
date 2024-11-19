import React, { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
 
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
 
import {useStatisticsStore, useHeaderStore} from '@/components/store.js';
import MyDatepicker from '@/ui/MyDatepicker';
import dayjs from 'dayjs';

import Meta from '@/components/meta.js';

import { roboto } from '@/ui/Font';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function StatisticsPage(){

  const [date_start, setDateStart] = useState(dayjs(new Date()));
  const [date_end, setDateEnd] = useState(dayjs(new Date()));

  const [state, setState] = useState({
    open: false,
    vertical: 'top',
    horizontal: 'center',
  });

  const { vertical, horizontal, open } = state;

  const [getStatistics, svod, is_load] = useStatisticsStore(state => [state.getStatistics, state.svod, state.is_load]);
  const [globalFontSize, token] = useHeaderStore(state => [state.globalFontSize, state.token]);

  useEffect(() => {
    const dateStart = date_start ? dayjs(date_start).format('YYYY-MM-DD') : '';
    const dateEnd = date_end ? dayjs(date_end).format('YYYY-MM-DD') : '';

    if(token && token.length > 0) {
      getStatistics(token, dateStart, dateEnd);
    }
  }, [token]);

  const closeModal = () => {
    setState({ ...state, open: false });
  }

  const getStat = () => {

    const dateStart = date_start ? dayjs(date_start).format('YYYY-MM-DD') : '';
    const dateEnd = date_end ? dayjs(date_end).format('YYYY-MM-DD') : '';

    if(dateStart == '' || dateEnd == '' ){
      setState({ ...state, open: true });
      return;
    }

    if(token && token.length > 0) {
      getStatistics(token, dateStart, dateEnd);
    }

  }

  return (
    <Meta title='Статистика'>
      <Backdrop style={{ zIndex: 9999, color: '#fff' }} open={is_load}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Grid container spacing={3} className={"price " + roboto.variable}>

        <Snackbar
          anchorOrigin={{ vertical, horizontal }}
          open={open}
          onClose={ () => closeModal() }
          autoHideDuration={5000}
        >
          <Alert onClose={() => closeModal()} severity="error" sx={{ width: '100%', fontSize: globalFontSize }}>
            Необходимо укаазть обе даты
          </Alert>
        </Snackbar>

        <Grid item xs={12} >

          <MyDatepicker
            label={'Дата от'}
            value={date_start}
            onChange={setDateStart}
            fontSize={globalFontSize}
          />

        </Grid>
        <Grid item xs={12} >

          <MyDatepicker
            label={'Дата до'}
            value={date_end}
            onChange={setDateEnd}
            fontSize={globalFontSize}
          />

        </Grid>

        <Grid item xs={12} >
          <Button variant="contained" onClick={getStat} style={{ fontSize: globalFontSize }}>Показать</Button>
        </Grid>

        <Grid item xs={12} mb={10}>
          <TableContainer 
            id="tableGraph"
            component={Paper} 
            sx={{
              maxHeight: 600,
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": {
                display: "none"
              } 
            }} 
          >
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow 
                  sx={{
                    "& .MuiTableCell-root": {
                      fontSize: globalFontSize,
                      fontWeight: 'bold',
                      minWidth: '200px'
                    }
                  }}
                >
                  <TableCell >Курьер</TableCell>
                  <TableCell >Среднее время ( в радиусе )</TableCell>
                  <TableCell >Количество</TableCell>
                  <TableCell >Во время</TableCell>
                  <TableCell >С опозданием</TableCell>
                  <TableCell >Вовремя и в радиусе</TableCell>
                  <TableCell >В радиусе</TableCell>
                  <TableCell >Не вовремя и не в радиусе</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {svod.map((row, key) => (
                  <TableRow key={key}
                    sx={{
                      "& .MuiTableCell-root": {
                        fontSize: globalFontSize,
                        minWidth: '200px'
                      }
                    }}
                  >
                    <TableCell>{row.name}</TableCell>
                    <TableCell >{row.time2}</TableCell>
                    <TableCell >{row.other_stat.all_count}</TableCell>
                    <TableCell >{row.other_stat.norm} ({row.other_stat.norm_percent}%)</TableCell>
                    <TableCell >{row.other_stat.fake} ({row.other_stat.fake_percent}%)</TableCell>
                    <TableCell >{row.other_stat.time_dist_true} ({row.other_stat.time_dist_true_percent}%)</TableCell>
                    <TableCell >{row.other_stat.true_dist} ({row.other_stat.true_dist_percent}%)</TableCell>
                    <TableCell >{row.other_stat.time_dist_false} ({row.other_stat.time_dist_false_percent}%)</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Meta>
  )
}
