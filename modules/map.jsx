import { useEffect, useRef, memo } from 'react';

import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';

import Typography from '@mui/material/Typography';
import CachedIcon from '@mui/icons-material/Cached';
import Button from '@mui/material/Button';

import Meta from '@/components/meta.js';
import { useOrdersStore, useHeaderStore } from '@/components/store.js';
import Modal_Confirm from './modal_confirm';

import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import PinDropIcon from '@mui/icons-material/PinDrop';

import { roboto } from '@/ui/Font';

const MapPoints = memo(function MapPoints({theme, globalFontSize, mapScale}){

  const [getOrders, orders, update_interval, showOrdersMap ] = useOrdersStore(state => [ state.getOrders, state.orders, state.update_interval, state.showOrdersMap ]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      getOrders();
    }, parseInt(update_interval) * 100);

    return () => clearInterval(interval);
  }, [update_interval]);

  return (
    <>
      {orders.map((item, key) => (
        <MapPoint key={key} mapScale={mapScale} theme={theme} item={item} showOrdersMap={showOrdersMap} globalFontSize={globalFontSize} />
      ))}
    </>
  )
})

const MapPoint = memo(function MapPoint({theme, item, mapScale, showOrdersMap, globalFontSize}){

  const scale = String(mapScale).replace('.', '_');

  // круг
  let circleLayout = ymaps.templateLayoutFactory.createClass(
    `<div class="map-img ${roboto.variable}">`+
      `<span class='span_svg_circle_${scale}'>` +
        '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="none" viewBox="0 0 24 24" >' +
          `<path fill=${(item?.point_color ? item?.point_color : item?.color) ?? 'blue'} d="M11.969 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.47-10-10-10m.03 14.23c-2.34 0-4.23-1.89-4.23-4.23s1.89-4.23 4.23-4.23 4.23 1.89 4.23 4.23-1.89 4.23-4.23 4.23" />` +
        '</svg>' +
      '</span>'+
      `<span class='span_text_${theme}' style='font-size: ${globalFontSize}px'>` +
        `${item?.point_text}` +
      '</span>'+
    '</div>'
  )

  // локация
  let locationLayout = ymaps.templateLayoutFactory.createClass(
    `<div class="map-img ${roboto.variable}">`+
      `<span class='span_svg_loc_${scale}'>` +
        '<svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" id="Layer_1" width="80" height="80" version="1" viewBox="0 0 64 64">' +
          `<path fill=${(item?.point_color ? item?.point_color : item?.color) ?? 'blue'} d="M32 0C18.746 0 8 10.746 8 24c0 5.219 1.711 10.008 4.555 13.93.051.094.059.199.117.289l16 24a4 4 0 0 0 6.656 0l16-24c.059-.09.066-.195.117-.289C54.289 34.008 56 29.219 56 24 56 10.746 45.254 0 32 0m0 32a8 8 0 1 1 0-16 8 8 0 0 1 0 16" />` +
        '</svg>' +
      '</span>'+
      `<span class='span_text_${theme}' style='font-size: ${globalFontSize}px'>` +
        `${item?.point_text}` +
      '</span>'+
    '</div>'
  )

  return (
    <Placemark
      geometry={[item?.xy?.latitude, item?.xy?.longitude]}
      onClick={() => showOrdersMap(item.id)}
      options={{ 
        iconLayout: !item.close_time_ ? circleLayout : locationLayout,
        iconShape: {
          type: 'Rectangle',
          coordinates: [[-10, -10], [200, 10]]
        }
      }} 
    />
  )
})

const MapPointHouse = memo(function MapPointHouse({point, getHome}){

  // домик в деревне
  let homeLayout = ymaps.templateLayoutFactory.createClass(
    `<span class="map-img ${roboto.variable}">`+
      '<span class="span_svg_home">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 24 24">' +
        '<path fill="#000" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.5 20v-9H3l9-6 9 6h-3.5v9h-3v-3.5A1.5 1.5 0 0 0 13 15h-2a1.5 1.5 0 0 0-1.5 1.5V20z" />' +
        '</svg>' +
      '</span>' +
    '</span>'
  )

  return (
    <Placemark
      geometry={point}
      onClick={() => getHome()}
      options={{ 
        iconLayout: homeLayout,
        iconShape: {
          type: 'Rectangle',
          coordinates: [[-10, -10], [10, 10]]
        }
      }}
    />
  )
}, areEqual2)

function areEqual2(prevProps, nextProps) {
  return JSON.stringify(prevProps.point) === JSON.stringify(nextProps.point);
}

const MapPointDriver = memo(function MapPointDriver({theme, mapScale, location_driver, globalFontSize, location_driver_time_text}){

  const scale = String(mapScale).replace('.', '_');

  // машинка
  let trackLayout = ymaps.templateLayoutFactory.createClass(
    `<span class="map-img ${roboto.variable}">`+
      `<span class='span_svg_circle_${scale}'>` +
        '<svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" id="Capa_1" width="80" height="80" fill="red" version="1.1" viewBox="0 0 462.522 462.522">' +
          '<path d="M432.958 222.262c-1.452-.305-2.823-.592-4.042-.909-13.821-3.594-20.129-5.564-24.793-14.569l-17.667-35.768c-5.678-10.961-20.339-19.879-32.682-19.879h-31.453v-41.303c0-7.416-6.034-13.45-13.452-13.45l-219.07.22c-7.218 0-12.661 5.736-12.661 13.343v12.208h-56.12C9.429 122.156 0 131.584 0 143.174s9.429 21.018 21.018 21.018h56.119v20.145H40.394c-11.589 0-21.018 9.429-21.018 21.018s9.429 21.018 21.018 21.018h36.743v20.145H59.77c-11.589 0-21.018 9.429-21.018 21.018s9.429 21.018 21.018 21.018h17.367v21.07c0 7.416 6.034 13.45 13.45 13.45h22.788c3.549 24.323 24.542 43.064 49.837 43.064 25.297 0 46.291-18.741 49.841-43.064h92.224c.479 0 .97-.032 1.46-.064 3.522 24.354 24.528 43.128 49.845 43.128 25.297 0 46.291-18.741 49.841-43.064h32.732c12.885 0 23.368-10.482 23.368-23.366V260.06c-.001-31.595-17.793-35.328-29.565-37.798m-76.376 75.198c10.1 0 18.317 8.214 18.317 18.311s-8.217 18.311-18.317 18.311c-10.096 0-18.31-8.214-18.31-18.311s8.214-18.311 18.31-18.311m-34.261-78.046v-48.77h24.036c9.238 0 20.634 6.932 24.864 15.094l15.721 31.829a30 30 0 0 0 1.038 1.846h-65.659zM181.529 315.77c0 10.096-8.217 18.311-18.317 18.311-10.096 0-18.309-8.214-18.309-18.311s8.213-18.311 18.309-18.311c10.1.001 18.317 8.215 18.317 18.311" />' +
        '</svg>' +
      '</span>'+
      `<span class='span_text_${theme}' style='font-size: ${globalFontSize}px'>` +
        `${location_driver_time_text}` +
      '</span>'+
    '</span>'
  )

  return (
    <Placemark
      geometry={location_driver}
      options={{ 
        iconLayout: trackLayout,
        iconShape: {
          type: 'Rectangle',
          coordinates: [[-10, -10], [10, 10]]
        }
      }} 
    />
  )
})

export default function MapPage() {
  const ref = useRef();

  const [ globalFontSize, theme, mapScale ] = useHeaderStore( state => [ state.globalFontSize, state.theme, state.mapScale ] );

  const [getOrders, type, limit, limit_count, setType, home, location_driver, type_location, set_type_location, location_driver_time_text] = useOrdersStore((state) => [state.getOrders, state.type, state.limit, state.limit_count, state.setType, state.home, state.location_driver, state.type_location, state.set_type_location, state.location_driver_time_text]);

  const getHome = () => ref?.current?.setCenter(home?.center);

  useEffect(() => {
    if(ref.current && home?.center){
      ref.current.setCenter(home?.center);
    }
  }, [home])

  return (
    <Meta title="Карта заказов">

      <div className='location_svg'>
        <Button onClick={() => set_type_location()}>
          {type_location === 'location' ?
            <LocationOnIcon style={{ color: '#000' }} />
           :
           type_location === 'watch' ?
            <PinDropIcon style={{ color: '#000' }} />
           :
            <LocationOffIcon style={{ color: '#000' }} />
          }
        </Button>
      </div>

      {!home ? null :
        <YMaps query={{ lang: 'ru_RU', apikey: 'f600fbbd-6500-4bf7-a0ab-ec9336f6c7d8' }}>
          <Map 
            defaultState={home} 
            instanceRef={ref} 
            width="100%" 
            height='100vh'
            style={{ minHeight: '100vh' }}
          >

          <MapPointHouse point={home?.center} getHome={getHome} />

          {!location_driver ? false :
            <MapPointDriver 
              theme={theme} 
              mapScale={mapScale} 
              location_driver={location_driver} 
              globalFontSize={globalFontSize} 
              location_driver_time_text={location_driver_time_text} />
          }

          <MapPoints theme={theme} mapScale={mapScale} globalFontSize={globalFontSize} />

          </Map>
        </YMaps>
      }

      <div style={{ position: 'absolute', zIndex: 10, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '90%', left: '5%', bottom: 50, backgroundColor: '#000', opacity: 0.7, borderRadius: 60}}>
        <Button className="noselect" style={{flex: 3, color: type.id == 1 ? 'green' : '#fff', fontWeight: 'bold'}} onClick={() => setType({ id: 1, text: 'Активные' })}>Активные</Button>
        <Button className="noselect" style={{ flex: 1, color: type.id == 2 ? 'green' : '#fff', fontWeight: 'bold' }} onClick={() => setType({ id: 2, text: 'Мои отмеченные' })}>Мои</Button>
        <Button className="noselect" style={{flex: 3, color: type.id == 5 ? 'green' : '#fff', fontWeight: 'bold'}} onClick={() => setType({ id: 5, text: 'У других курьеров' })}>У других</Button>
        <Button className="noselect" style={{ flex: 1 }} onClick={() => getOrders(true, true)}><CachedIcon style={{ color: '#fff' }} /></Button>
      </div>

      <div style={{ position: 'absolute', zIndex: 10, display: 'flex', flexDirection: 'row', justifyContent: 'space-around', width: '90%', left: '5%', bottom: 90 }}>
        <Typography style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }} component="span">{limit}</Typography>
        {limit_count?.length > 0 ? <Typography style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }} component="span">{limit_count}</Typography> : false}
      </div>

      <Modal_Confirm />
    </Meta>
  );
}
