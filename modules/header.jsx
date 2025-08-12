'use client'

import {useEffect} from 'react';
import Link from 'next/link'

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import Box from '@mui/material/Box';

import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';

import Button from '@mui/material/Button';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

//import { signOut } from 'next-auth/react';
import {usePathname, useRouter} from 'next/navigation'
import {useHeaderStore, useOrdersStore} from '@/components/store.js';

import AlertOrder from '@/components/AlertOrder';
import PayModel from '@/components/PayModel';

//import { initializeApp } from "firebase/app";
//import { getMessaging, getToken } from "firebase/messaging";

import OrderCard from '@/modules/order_card';

import {roboto} from '@/ui/Font';

function DrawerMap() {

	const [isOpenOrderMap, closeOrderMap, showOrders] = useOrdersStore(state => [state.isOpenOrderMap, state.closeOrderMap, state.showOrders])

	return (
		<SwipeableDrawer
			anchor={'bottom'}
			open={isOpenOrderMap}
			onClose={closeOrderMap}
			className={'modalOrderMap ' + roboto.variable}
			onOpen={() => {
			}}
		>
			{showOrders.map((item, key) =>
				<OrderCard key={key} item={item} is_map={true}/>
			)}
		</SwipeableDrawer>
	);
}

function DrawerList() {

	const [isOpenMenu, setOpenMenu, setCloseMenu, types, setType] = useOrdersStore(state => [state.isOpenMenu, state.setOpenMenu, state.setCloseMenu, state.types, state.setType])

	const [globalFontSize] = useHeaderStore(state => [state.globalFontSize]);

	return (
		<SwipeableDrawer
			anchor={'bottom'}
			open={isOpenMenu}
			onClose={setCloseMenu}
			onOpen={setOpenMenu}
		>
			<List className={'monthList ' + roboto.variable}>
				{types.map((item, key) =>
					<ListItem disablePadding key={key} onClick={() => setType(item)}>
						<ListItemButton>
							<ListItemText
								primary={item.text}
								sx={{
									"& .MuiTypography-root": {
										fontSize: globalFontSize,
									},
								}}
							/>
						</ListItemButton>
					</ListItem>
				)}
			</List>
		</SwipeableDrawer>
	);
}

function DrawerHeader() {

	const [isOpenMenu, setOpenMenu, setCloseMenu, phones, avgTime, globalFontSize, is_need_avg_time, is_need_page_stat] = useHeaderStore(state => [state.isOpenMenu, state.setOpenMenu, state.setCloseMenu, state.phones, state.avgTime, state.globalFontSize, state.is_need_avg_time, state.is_need_page_stat])
	const router = useRouter();

	function logOut() {
		localStorage.removeItem('token');
		router.push('/auth', {scroll: false})
	}

	return (
		<SwipeableDrawer
			anchor={'left'}
			open={isOpenMenu}
			onClose={setCloseMenu}
			onOpen={setOpenMenu}
		>
			<List className={roboto.variable}>
				{
					is_need_avg_time && (
						<ListItem disablePadding>
							<ListItemButton>
								<Link href="" style={{fontSize: globalFontSize}}>{"Ср. время: " + avgTime}</Link>
							</ListItemButton>
						</ListItem>
					)
				}
				<ListItem disablePadding onClick={setCloseMenu}>
					<ListItemButton>
						<Link href='/list_orders' style={{fontSize: globalFontSize}}>Список заказов</Link>
					</ListItemButton>
				</ListItem>
				<ListItem disablePadding onClick={setCloseMenu}>
					<ListItemButton>
						<Link href='/map_orders' style={{fontSize: globalFontSize}}>Карта заказов</Link>
					</ListItemButton>
				</ListItem>
				<ListItem disablePadding onClick={setCloseMenu}>
					<ListItemButton>
						<Link href='/price' style={{fontSize: globalFontSize}}>Расчет</Link>
					</ListItemButton>
				</ListItem>
				<ListItem disablePadding onClick={setCloseMenu}>
					<ListItemButton>
						<Link href='/graph' style={{fontSize: globalFontSize}}>График работы</Link>
					</ListItemButton>
				</ListItem>
				{is_need_page_stat && (
					<ListItem disablePadding onClick={setCloseMenu}>
						<ListItemButton>
							<Link href='/statistics' style={{fontSize: globalFontSize}}>Статистика</Link>
						</ListItemButton>
					</ListItem>
				)}
				<ListItem disablePadding onClick={setCloseMenu}>
					<ListItemButton>
						<Link href='/settings' style={{fontSize: globalFontSize}}>Настройки</Link>
					</ListItemButton>
				</ListItem>

				{phones?.phone_upr.length == 0 ? false :
					<ListItem disablePadding>
						<ListItemButton>
							<Link href={'tel:' + phones?.phone_upr} style={{fontSize: globalFontSize}}>Директор</Link>
						</ListItemButton>
					</ListItem>
				}
				{phones?.phone_man.length == 0 ? false :
					<ListItem disablePadding>
						<ListItemButton>
							<Link href={'tel:' + phones?.phone_man} style={{fontSize: globalFontSize}}>Менеджер</Link>
						</ListItemButton>
					</ListItem>
				}
				{phones?.phone_center.length == 0 ? false :
					<ListItem disablePadding>
						<ListItemButton>
							<Link href={'tel:' + phones?.phone_center} style={{fontSize: globalFontSize}}>Контакт-центр</Link>
						</ListItemButton>
					</ListItem>
				}

				<ListItem disablePadding onClick={setCloseMenu}>
					<ListItemButton onClick={() => {
						logOut()
					}}>
						<ListItemText primary={'Выйти'}
													sx={{
														"& .MuiTypography-root": {
															fontSize: globalFontSize,
														},
													}}
						/>
					</ListItemButton>
				</ListItem>

			</List>
		</SwipeableDrawer>
	);
}

function ModalDelOrders() {

	const [del_orders, hideDelOrders] = useOrdersStore(state => [state.del_orders, state.hideDelOrders])
	const [globalFontSize] = useHeaderStore(state => [state.globalFontSize]);

	return (
		<SwipeableDrawer
			anchor={'bottom'}
			open={del_orders?.length > 0 ? true : false}
			onClose={hideDelOrders}
			className={'modalOrderMap ' + roboto.variable}
			onOpen={() => {
			}}
		>
			<div className="lineModal"/>

			<Typography style={{
				fontSize: globalFontSize,
				paddingTop: 10,
				paddingBottom: 10,
				color: '#000',
				textAlign: 'center',
				fontWeight: 'bold'
			}} component="h6">Удаленные заказы</Typography>

			<div className='modalOrderDelContent' style={{
				height: 300,
				width: '100%',
				overflow: 'auto',
				padding: 20,
				paddingTop: 10
			}}>
				{del_orders?.map((item, key) =>
					<div key={key} style={{display: 'flex', flexDirection: 'column'}}>
						<Typography component="span" style={{fontSize: globalFontSize}}>Удаленный заказ #{item.id}</Typography>
						<Typography component="span" style={{fontSize: globalFontSize}}>Адрес: {item.addr}</Typography>
					</div>
				)}
			</div>

			<Button className='btnGOOD' onClick={hideDelOrders} style={{fontSize: globalFontSize}}>Хорошо</Button>
		</SwipeableDrawer>
	);
}

function LoadOrderSpiner() {

	const [is_load] = useOrdersStore(state => [state.is_load])

	return (
		<Backdrop style={{zIndex: 9999, color: '#fff'}} open={is_load}>
			<CircularProgress color="inherit"/>
		</Backdrop>
	);
}

import useSession from '@/components/sessionHook';
import CachedIcon from "@mui/icons-material/Cached";
import {FilterAlt} from "@mui/icons-material";

export default function Header() {

	const session = useSession();

	const [activePageRU, setOpenMenu, getStat, checkMyPos, getMyAvgTime, getMyFontSize, globalFontSize, getSettings, is_need_avg_time] = useHeaderStore(state => [state.activePageRU, state.setOpenMenu, state.getStat, state.checkMyPos, state.getMyAvgTime, state.getMyFontSize, state.globalFontSize, state.getSettings, state.is_need_avg_time])
	const [MyCurrentLocation, showModalTypeDop, getOrders] = useOrdersStore(state => [state.MyCurrentLocation, state.showModalTypeDop, state.getOrders])

	/*useEffect( () => {
		if( session.data?.user?.token ){
			const firebaseConfig = {
				apiKey: "AIzaSyAK8l7m2URB6kFbBzC5iv67W34cuEzPKYc",
				authDomain: "macro-thinker-288611.firebaseapp.com",
				databaseURL: "https://macro-thinker-288611.firebaseio.com",
				projectId: "macro-thinker-288611",
				storageBucket: "macro-thinker-288611.appspot.com",
				messagingSenderId: "989415800368",
				appId: "1:989415800368:web:35373fd752ab60aa3177f5",
				measurementId: "G-YDT84TR2E2"
			};

			const app = initializeApp(firebaseConfig);

			try{
				const messaging = getMessaging();

				getToken(messaging, { vapidKey: 'BJmoVaG5ijS0CXc126Y47xmkjxv92stPrkQDfLql5hirvoWvAcy2N4xR1CPKVnCzUVai3ZqkzvVAjOyHGUWhogA' }).then((currentToken) => {
					if (currentToken) {
						setNotifToken(currentToken)
					}
				}).catch((err) => {
					///
				});
			}catch(err){

			}
		}

	}, [session] )*/

	useEffect(() => {
		if (session?.isAuth === true) {
			getStat(session?.token);
			getSettings(session?.token);

			MyCurrentLocation();

			//check_pos_watch();
		}
	}, []);

	useEffect(() => {
		checkMyPos();
		getMyAvgTime(session?.token);

		getMyFontSize(session?.token);

		const interval = setInterval(() => {
			checkMyPos();
			getMyAvgTime(session?.token);
		}, 120 * 1000);

		return () => clearInterval(interval);
	}, []);

	if (typeof window != 'undefined') {
		if (location.protocol !== 'https:' && location.hostname != 'localhost') {
			location.replace(`https:${location.href.substring(location.protocol.length)}`);
		}
	}

	const pathname = usePathname();

	return (
		<Box>
			<AppBar>
				<Toolbar>
					<IconButton
						size="large"
						edge="start"
						color="inherit"
						aria-label="menu"
						sx={{mr: 2}}
						onClick={setOpenMenu}
					>
						<MenuIcon/>
					</IconButton>
					<Typography variant="h6" component="div" sx={{flexGrow: 1}} style={{fontSize: globalFontSize}}>{activePageRU}</Typography>
					{
						(pathname === '/list_orders' || pathname === '/map_orders') && (
							<div>
								<Button className="noselect" style={{flex: 1}} onClick={() => showModalTypeDop(true)}><FilterAlt style={{color: '#fff'}}/></Button>
								<Button className="noselect" style={{flex: 1}} onClick={() => getOrders(true, true)}><CachedIcon style={{color: '#fff'}}/></Button>
							</div>
						)
					}
				</Toolbar>
			</AppBar>

			<DrawerMap/>
			<DrawerList/>
			<DrawerHeader/>
			<ModalDelOrders/>
			<AlertOrder/>
			<LoadOrderSpiner/>
			<PayModel/>

		</Box>
	)
}
