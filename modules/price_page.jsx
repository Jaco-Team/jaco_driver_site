import {useState, useEffect} from 'react';

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

import {usePriceStore, useHeaderStore} from '@/components/store.js';
import MyDatepicker from '@/ui/MyDatepicker'
import dayjs from 'dayjs';

import useSession from '@/components/sessionHook';

import Meta from '@/components/meta.js';

import {roboto} from '@/ui/Font';
import Box from "@mui/material/Box";
import {TextDescription} from "@/components/TextDescription";

export default function PricePage() {

	const session = useSession();

	const [startDate, setStartDate] = useState(dayjs(new Date()));
	const [endDate, setEndDate] = useState(dayjs(new Date()));
	const [nowDate, setNowDate] = useState(dayjs(new Date()));
	const [statPrice, give_hist, getStat, getStatBetween] = usePriceStore(state => [state.statPrice, state.give_hist, state.getStat, state.getStatBetween]);
	const [globalFontSize] = useHeaderStore(state => [state.globalFontSize]);
	const FormatPrice = (price) => new Intl.NumberFormat('ru-RU').format(price);

	// useEffect(() => {
	// 	if (session?.isAuth === true) {
	// 		getStat(dayjs(startDate).format('YYYY-MM-DD'), session?.token);
	// 	}
	// }, [])

	useEffect(() => {
		if (session?.isAuth === true) {
			getStatBetween(
				dayjs(startDate).format('YYYY-MM-DD'), 
				dayjs(endDate).format('YYYY-MM-DD'), 
				session?.token
			);
		}
	}, [startDate, endDate])

	return (
		<Meta title='Расчет'>
			<Grid container spacing={3} className={"price " + roboto.variable}>

				<Grid item xs={12}>
					<MyDatepicker
						label={'Дата от'}
						value={startDate}
						onChange={setStartDate}
						fontSize={globalFontSize}
						maxDate={nowDate}
						minDate={nowDate ? nowDate.add(-93, 'day') : undefined}
					/>
				</Grid>

				<Grid item xs={12}>
					<MyDatepicker
						label={'Дата до'}
						value={endDate}
						maxDate={nowDate}
						minDate={nowDate ? nowDate.add(-93, 'day') : undefined}
						onChange={setEndDate}
						fontSize={globalFontSize}
					/>
				</Grid>

				<Grid item xs={12} style={{textAlign: 'center'}}>
					<h1 style={{margin: 0, fontSize: 48, textAlign: 'center'}}>{new Intl.NumberFormat('ru-RU').format(statPrice?.my_price)} ₽</h1>
					<TextDescription
						text='Сумма налички'
						value={statPrice?.sum_cash ?? 0}
						type='price'
						FormatPrice={FormatPrice}
						title='Сумма заказов за наличку за выбранную дату, включая стоимость доставки'
						globalFontSize={globalFontSize}
					/>
					<TextDescription
						text='Сумма безнала'
						value={statPrice?.sum_bank ?? 0}
						type='price'
						FormatPrice={FormatPrice}
						title='Сумма заказов по безналичному расчету за выбранную дату, включая стоимость доставки'
						globalFontSize={globalFontSize}
					/>
					<TextDescription
						text='Заработал'
						value={statPrice?.my_price ?? 0}
						type='price'
						FormatPrice={FormatPrice}
						title='Сумма стоимости доставки для курьера за выбранную дату + доплаты за этот же день'
						globalFontSize={globalFontSize}
					/>
					<TextDescription
						text='Сдача'
						value={statPrice?.sdacha ?? 0}
						type='price'
						FormatPrice={FormatPrice}
						title='Из графы Сумма налички вычитаем графу Заработал'
						globalFontSize={globalFontSize}
					/>

					<TextDescription
						text='Налички'
						value={statPrice?.my_cash ?? 0}
						type='price'
						FormatPrice={FormatPrice}
						title='Разница между графой К сдаче и графой Сдал - за все время на точке'
						globalFontSize={globalFontSize}
					/>

					<TextDescription
						text='Количество по наличке'
						value={statPrice?.count_cash ?? 0}
						type='count'
						FormatPrice={FormatPrice}
						globalFontSize={globalFontSize}
					/>

					<TextDescription
						text='Количество по безналу'
						value={statPrice?.count_bank ?? 0}
						type='count'
						FormatPrice={FormatPrice}
						globalFontSize={globalFontSize}
					/>

					<TextDescription
						text='Завершенных заказов'
						value={statPrice?.count ?? 0}
						type='count'
						FormatPrice={FormatPrice}
						bottom_devider={false}
						globalFontSize={globalFontSize}
					/>
				</Grid>

				<Grid item xs={12}>

					<TableContainer>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell style={{fontSize: globalFontSize}}>Время</TableCell>
									<TableCell style={{fontSize: globalFontSize}}>Сданная сумма</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{give_hist.map((rowData, index) =>
									<TableRow hover key={index}>
										<TableCell style={{fontSize: globalFontSize}}>{rowData.time}</TableCell>
										<TableCell style={{fontSize: globalFontSize}}>{new Intl.NumberFormat('ru-RU').format(rowData.give)} ₽</TableCell>
									</TableRow>
								)}
							</TableBody>

							<TableFooter>
								<TableRow>
									<TableCell style={{fontSize: globalFontSize}}>Всего сдал</TableCell>
									<TableCell style={{fontSize: globalFontSize}}>{new Intl.NumberFormat('ru-RU').format(statPrice?.full_give)} ₽</TableCell>
								</TableRow>
								<TableRow>
									<TableCell style={{fontSize: globalFontSize}}>Осталось сдать</TableCell>
									<TableCell style={{fontSize: globalFontSize}}>{new Intl.NumberFormat('ru-RU').format(statPrice?.my_cash)} ₽</TableCell>
								</TableRow>
							</TableFooter>

						</Table>
					</TableContainer>

				</Grid>

			</Grid>
		</Meta>
	)
}
