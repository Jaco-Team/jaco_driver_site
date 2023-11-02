import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';

import { api } from './api.js';

export const useOrdersStore = createWithEqualityFn((set, get) => ({
  orders: [],
  isOpenMenu: false,
  update_interval: 30,
  limit: '',
  limit_count: '',
  token: '',
  notifToken: '',

  type: { id: 1, text: 'Активные' },
      
  types: [
    { id: 1, text: 'Активные' }, //готовятся и готовы
    { id: 3, text: 'Предзаказы' }, //более часа
    { id: 2, text: 'Мои отмеченные' }, //мои
    { id: 5, text: 'У других курьеров' }, 
    { id: 6, text: 'Мои завершенные' }, //мои завершенеы
  ],

  showErrOrder: false, 
  textErrOrder: '',

  is_load: false,

  map: null,

  showOrders: [],
  isOpenOrderMap: false,

  del_orders: [],

  showPay: false,
  payData: null,

  modalConfirm: false,
  order_finish_id: null,
  is_map: false,
  order_finish_id: null,

  isClick: false,

  driver_pay: false,

  is_check: false,

  location_driver: null,

  // открытие закрытие модалки qr оплаты
  setShowPay: (active) => {
    set({showPay: active })

    if( active === false ){
      set({ payData: null })
    }
  },

  // открытие/закрытие модалки с подтверждением завершения заказа
  setActiveConfirm: (active, order_finish_id, is_map, type_confirm) => {
    set({ modalConfirm: active, order_finish_id, is_map, type_confirm })
  },

  hideDelOrders: async() => {
    let idList = [];

    get().del_orders.map( (item, key) => {
      idList.push(item.id)
    } )

    let data = {
      type: 'check_close_orders',
      token: get().token,
      idList: JSON.stringify(idList)
    };
    
    const res = await api('orders', data);

    set({
      del_orders: []
    })
  },

  setToken: (token) => {
    set({
      token: token
    })
  },

  setNotifToken: (token) => {
    set({
      notifToken: token
    })
  },

  closeErrOrder: () => {
    set({
      showErrOrder: false, 
      textErrOrder: '',
    })
  },
  openErrOrder: (text) => {
    set({
      showErrOrder: true, 
      textErrOrder: text,
    })
  },

  getOrders: async (is_map = false, is_reload = false) => {
    if( get().token.length == 0 ){
      return ;
    }

    if( get().is_check === false ){
      set({
        is_check: true
      })
    }else{
      return ;
    }

    if( is_reload === true ){
      set({
        is_load: true
      })
    }

    const data = {
      type: 'get_orders',
      type_orders: get().type.id,
      token: get().token
    };
      
    try{
      const json = await api('orders', data);

      if( json?.orders ){
        set({
          orders: json?.orders,
          update_interval: json?.update_interval,
          limit: json?.limit,
          limit_count: json?.limit_count,
          del_orders: json?.arr_del_list,
          driver_pay: json?.driver_pay
        })
    
        if( is_map === true ){
          setTimeout( () => {
            get().renderMap(json?.home, json?.orders);
          }, 300 )
        }
      }else{
        console.log( 'json', json )

        //get().openErrOrder('Ошибка '+json.text )
      }
    } catch(err){
      console.log( err )
    }

    setTimeout( () => {
      set({
        is_load: false,
        is_check: false
      })
    }, 300 )
  },

  setType: (type, is_map = false) => {
    set({
      type: type,
      isOpenMenu: false
    })
    get().getOrders(is_map);
  },

  setCloseMenu: () => {
    set({
      isOpenMenu: false
    })
  },
  setOpenMenu: () => {
    set({
      isOpenMenu: true
    })
  },

  check_pos: ( func, data ) => {
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const { latitude, longitude } = coords
        
      func( { latitude, longitude, data } )
    }, ({ message }) => {
      get().openErrOrder('Не удалось определить местоположение. '+message);
    }, {
      enableHighAccuracy: true
    })
  },

  actionFinishOrder: (order_id, is_map = false) => {

    if( get().isClick === false ){
      set({ isClick: true })
    }else{
      return ;
    }

    set({ is_load: true })
    get().check_pos( get().actionOrder, {order_id: order_id, type: 3, is_map} );

    setTimeout( () => {
      get().setActiveConfirm(false, null, false, null)
      set({ isClick: false })
    }, 300 )
  },
  actionCencelOrder: (order_id, is_map = false) => {
    
    if( get().isClick === false ){
      set({ isClick: true })
    }else{
      return ;
    }

    set({ is_load: true })
    get().check_pos( get().actionOrder, {order_id: order_id, type: 2, is_map} );

    setTimeout( () => {
      get().setActiveConfirm(false, null, false, null)
      set({ isClick: false })
    }, 300 )
  },
  actionGetOrder: (order_id, is_map = false) => {

    if( get().isClick === false ){
      set({ isClick: true })
    }else{
      return ;
    }

    set({ is_load: true })
    get().check_pos( get().actionOrder, {order_id: order_id, type: 1, is_map} );

    setTimeout( () => {
      set({ isClick: false })
    }, 300 )
  },
  actionFakeOrder: async (order_id, is_map = false) => {

    if( get().isClick === false ){
      set({ isClick: true })
    }else{
      return ;
    }

    set({ is_load: true })
    get().check_pos( get().actionOrderFake, {order_id: order_id, type: 1, is_map} );

    setTimeout( () => {
      get().setActiveConfirm(false, null, false,null)
      set({ isClick: false })
    }, 300 )
  },
  actionOrder: async({data: { order_id, type, is_map }, latitude = '', longitude = ''}) => {
    //1 - get / 2 - close / 3 - finish

    let data = {
      type: 'actionOrder',
      token: get().token,
      id: order_id,
      type_action: type,
      appToken: get().notifToken,
      latitude: latitude,
      longitude: longitude
    };
    
    const res = await api('orders', data);
    
    if( res['st'] == false ){
      get().openErrOrder(res['text']);

      setTimeout( () => {
        set({ is_load: false })
      }, 500 )
    }else{
      get().closeOrderMap();
      get().setShowPay(false);
      get().getOrders(is_map);

      setTimeout( () => {
        set({ is_load: false })
      }, 500 )
    }
  },
  actionOrderFake: async({data: { order_id, is_map }, latitude = '', longitude = ''}) => {
    let data = {
      type: 'checkFakeOrder',
      token: get().token,
      order_id: order_id,
      latitude: latitude,
      longitude: longitude
    };
    
    const res = await api('orders', data);
    
    if( res['st'] == false ){
      get().openErrOrder(res['text']);

      setTimeout( () => {
        set({ is_load: false })
      }, 500 )
    }else{

      set({ location_driver: [latitude, longitude] })

      get().closeOrderMap();
      get().getOrders(is_map);

      setTimeout( () => {
        set({ is_load: false })
      }, 500 )

      setTimeout(() => {
        set({ location_driver: null })
      }, 300000);
    }
  },

  actionPayOrder: async(order_id, is_map) => {

    if( get().isClick === false ){
      set({ isClick: true })
    }else{
      return ;
    }

    set({ is_load: true })
    get().check_pos( get().acttionPay, {order_id, is_map} );    

    setTimeout( () => {
      set({ isClick: false })
    }, 300 )
  },

  acttionPay: async({data: { order_id, is_map }, latitude = '', longitude = ''}) => {
    let data = {
      type: 'get_pay_qr',
      token: get().token,
      order_id: order_id,
    };
    
    const res = await api('orders', data);
    
    console.log( 'pay', res )

    if( res['st'] == false ){
      get().openErrOrder(res['text']);

      setTimeout( () => {
        set({ is_load: false })
      }, 500 )
    }else{

      res.pay.check_data = {data: { order_id, is_map }, latitude, longitude};
      console.log( 'pay', res )

      get().openErrOrder('Заказ оплачен');

      setTimeout( () => {
        set({ is_load: false, showPay: true, payData: res.pay })
      }, 500 )

    }
  },

  clearMap: () => {
    set({
      map: null
    })
  },

  renderMap: (home, orders) => {
    let objectManager = new ymaps.ObjectManager();
        
    if( !get().map ){
      ymaps.ready(() => {
        get().map = new ymaps.Map('map_orders', {
          center: [home?.latitude, home?.longitude],
          //center: [55.76, 37.64],
          zoom: 11
        }, {
          searchControlProvider: 'yandex#search'
        })
        
        let json = {
          "type": "FeatureCollection",
          "features": []
        };
                
        json.features.push({
          type: "Feature",
          id: -1,
          options: {
            preset: 'islands#blackDotIcon', 
            iconColor: 'black'
          },
          geometry: {
            type: "Point",
            coordinates: [home?.latitude, home?.longitude]
          },
        })

        orders.map( function(item){
        
          json.features.push({
            type: "Feature",
            id: item.id,
            options: {
              preset: parseInt(item.status_order) == 6 ? 'islands#blueCircleDotIconWithCaption' : 'islands#circleDotIcon', 
              iconColor: item.point_color ? item.point_color : item.color
            },
            properties: {
              iconCaption: item.point_text,
              //iconCaption: parseInt(item.status_order) == 6 ? item.close_time_ : parseInt(item.is_pred) == 1 ? item.need_time : parseInt(item.is_my) == 1 ? item.time_start_mini : '',
            },
            geometry: {
              type: "Point",
              coordinates: [item.xy?.latitude, item.xy?.longitude]
            },
          })
          
        } )

        // локация курьера на карте в случае если клиент не вышел на связь
        if(get().location_driver) {
  
          json.features.push({
            type: "Feature",
            id: 0,
            options: {
              preset: 'islands#redStretchyIcon', 
            },
            properties: {
              iconContent: 'Курьер здесь'
            },
            geometry: {
              type: "Point",
              coordinates: get().location_driver,
            },
          })
  
        }
        
        objectManager.add(json);
        get().map.geoObjects.add(objectManager);
        
        
      });
    }else{
      
      let json = {
        "type": "FeatureCollection",
        "features": []
      };
              
      //дом
      json.features.push({
        type: "Feature",
        id: -1,
        options: {
          preset: 'islands#blackDotIcon', 
          iconColor: 'black'
        },
        geometry: {
          type: "Point",
          coordinates: [home?.latitude, home?.longitude]
        },
      })
      
      
      orders.map( function(item){
        
        json.features.push({
          type: "Feature",
          id: item.id,
          options: {
            preset: parseInt(item.status_order) == 6 ? 'islands#blueCircleDotIconWithCaption' : 'islands#circleDotIcon', 
            iconColor: item.point_color ? item.point_color : item.color
          },
          properties: {
            iconCaption: item.point_text,
            //iconCaption: parseInt(item.status_order) == 6 ? item.close_time_ : parseInt(item.is_pred) == 1 ? item.need_time : parseInt(item.is_my) == 1 ? item.time_start_mini : '',
          },
          geometry: {
            type: "Point",
            coordinates: [item?.xy?.latitude, item?.xy?.longitude]
          },
        })
        
      } )

      // локация курьера на карте в случае если клиент не вышел на связь
      if(get().location_driver) {

        json.features.push({
          type: "Feature",
          id: 0,
          options: {
            preset: 'islands#redStretchyIcon', 
          },
          properties: {
            iconContent: 'Курьер здесь'
          },
          geometry: {
            type: "Point",
            coordinates: get().location_driver,
          },
        })

      }
      
      get().map.geoObjects.removeAll()
      
      objectManager.add(json);
      get().map.geoObjects.add(objectManager);
      
      
    }
    
    objectManager.objects.events.add(['click'], (e) => {
      let order_id = e.get('objectId');

      console.log( 'order_id', order_id )

      if( order_id == -1 || order_id == '-1' ){
        //this.setState({ is_open_home: true })
      }else{
        let order = orders.find( (item) => parseInt(item.id) == parseInt(order_id) );
        
        if( order ){
          let new_orders = orders.filter( (item) => item?.xy?.latitude == order?.xy?.latitude && item?.xy?.longitude == order?.xy?.longitude );

          set({
            showOrders: new_orders,
            isOpenOrderMap: true
          })
        }
      }
    });
  },

  closeOrderMap: () => {
    set({
      showOrders: [],
      isOpenOrderMap: false
    })
  },

  getCheckStatusPay: async({data: { order_id, is_map }, latitude = '', longitude = ''}) => {
    let data = {
      type: 'check_pay_order',
      token: get().token,
      order_id: order_id
    };
    
    const res = await api('orders', data);

    if( res.st === true ){
      get().actionOrder( { order_id, type: 3, is_map }, latitude, longitude );
    }
  },
}), shallow)

export const useHeaderStore = createWithEqualityFn((set, get) => ({
  isOpenMenu: false,

  activePageRU: '',

  phones: null,
  token: '',

  check_pos_check: false,

  setActivePageRU: (activePageRU) => {
    set({
      activePageRU: activePageRU
    })
  },

  check_pos: async( func ) => {
    await navigator.geolocation.getCurrentPosition(({ coords }) => {
      const { latitude, longitude } = coords
        
      func( latitude, longitude )
    }, ({ message }) => {
      //get().openErrOrder('Не удалось определить местоположение. '+message);
    }, {
      enableHighAccuracy: true
    })
  },

  checkMyPos: () => {

    if( get().check_pos_check === false ){
      set({
        check_pos_check: true
      })
    }else{
      return ;
    }

    get().check_pos( get().saveMyPos );

    setTimeout( () => {
      set({
        check_pos_check: false
      })
    }, 1000 )
  },

  saveMyPos: async(latitude = '', longitude = '') => {
    if( get().token.length > 0 ){
      const data = {
        token: get().token,
        type: 'save_my_pos',
        latitude,
        longitude
      };
        
      const json = await api('settings', data);
    }
  },

  setOpenMenu: () => {
    set({
      isOpenMenu: true
    })
  },
  setCloseMenu: () => {
    set({
      isOpenMenu: false
    })
  },
  getStat: async (token) => {
    if( get().phones === null ){
      const data = {
        token: token,
        type: 'get_point_phone',
      };
        
      const json = await api('settings', data);

      set({
        phones: json?.phone,
        token
      })
    }
  },
}), shallow)

export const usePriceStore = createWithEqualityFn((set, get) => ({
  statPrice: null,
  give_hist: [],

  getStat: async (date, token) => {
    const data = {
      token: token,
      type: 'get_my_price',
      date: date,
    };
      
    const json = await api('price', data);

    set({
      statPrice: json.stat,
      give_hist: json.give_hist
    })
  },
}), shallow)

export const useGraphStore = createWithEqualityFn((set, get) => ({
  isOpenMenu: false,
  isOpenModalErr: false,
  showErrOrder: null,
  showErrOrderCum: null,
  month_list: [],
  dates: [],
  users: [],

  err_orders: [],
  err_cam: [],

  errText: '',
  chooseDate: '',

  isshowErrOrder: false, 
  textErrOrder: '',

  isClick: false,

  setTextErr: (text) => {
    set({
      errText: text
    })
  },

  getGraph: async (date, token) => {
    const data = {
      type: 'get_my_graph',
      date: date,
      token: token
    };
      
    const json = await api('graph', data);

    set({
      month_list: json.mounth,
      dates: json.all_dates,
      users: json.users,
      err_orders: json.errs.orders,
      err_cam: json.errs.err_cam,
      isOpenMenu: false,
      chooseDate: date
    })
  },

  setOpenMenu: () => {
    set({
      isOpenMenu: true
    })
  },
  setCloseMenu: () => {
    set({
      isOpenMenu: false
    })
  },
  false_err_order: async(token, text, err_id, row_id) => {

    if( get().isClick === false ){
      set({ isClick: true })
    }else{
      return ;
    }

    let data = {
      token: token,
      text: text,
      err_id: err_id,
      row_id: row_id
    };
    
    const res = await api('save_false_cash_orders', data);
    
    if( res['st'] == false ){
      set({
        isshowErrOrder: true, 
        textErrOrder: res.text,
      })
    }else{
      get().closeModalErr();
      
      get().getGraph(get().chooseDate, token);
    }

    setTimeout( () => {
      set({ isClick: false })
    }, 300 )
  },
  false_err_cam: async(token, text, err_id) => {

    if( get().isClick === false ){
      set({ isClick: true })
    }else{
      return ;
    }

    let data = {
      token: token,
      text: text,
      id: err_id
    };
    
    const res = await api('save_false_cash_cum', data);
    
    if( res['st'] == false ){
      set({
        isshowErrOrder: true, 
        textErrOrder: res.text,
      })
    }else{
      get().closeModalErr();
      
      get().getGraph(get().chooseDate, token);
    }

    setTimeout( () => {
      set({ isClick: false })
    }, 300 )
  },

  closeModalErr: () => {
    set({
      isOpenModalErr: false,
      showErrOrder: null,
      showErrOrderCum: null,
      isshowErrOrder: false,
      errText: ''
    })
  },
  openModalErr: (type, err) => {
    set({
      isOpenModalErr: true,
      [ type ]: err
    })
  },
  closeErrOrder: () => {
    set({
      showErrOrder: false, 
      textErrOrder: '',
    })
  },
}), shallow)

export const useLoginStore = createWithEqualityFn((set, get) => ({
  is_load: false,
  is_loadToken: false,

  loginErr: '',

  authData: { isAuth: 'load', token: '' },

  setLoginErr: (err) => {
    set({
      loginErr: err
    })
  },

  login: async (login, pwd) => {

    if( !get().is_load ){
      set({ is_load: true })
    }else{
      return ;
    }

    const data = {
      type: 'login',
      login: login,
      pwd: pwd
    };
      
    const json = await api('auth', data);

    if( json.st === true ){
      localStorage.setItem('token', json.token)
    }

    set({ 
      is_load: false,
      loginErr: json.text
    })

    return json;
  },

  sendSMS: async(login, pwd) => {

    if( !get().is_load ){
      set({ is_load: true })
    }else{
      return ;
    }

    const data = {
      type: 'get_sms',
      login: login,
      pwd: pwd
    };
      
    const json = await api('auth', data);

    if( json.st === true ){
      localStorage.setItem('token', json.token)
    }

    set({ is_load: false })

    return json;
  },

  sendCode: async(login, code) => {

    if( !get().is_load ){
      set({ is_load: true })
    }else{
      return ;
    }

    const data = {
      type: 'check_code',
      login: login,
      code: code
    };
      
    const json = await api('auth', data);

    set({ is_load: false })

    return json;
  },

  save_settings_format: async (value) => {

    const data = {
      type: 'save_settings_format',
      token: login,
      value: value
    };
      
    const json = await api('auth', data);

    return json;
  },

  check_token: async(token) => {

    if( !get().is_loadToken ){
      set({
        is_loadToken: true
      })
    }else{
      return { st: 'load' };
    }

    if( get().authData.st == 'load' ){
      const data = {
        type: 'check_token',
        token: token
      };
        
      const json = await api('auth', data);

      set({
        authData: json,
        is_loadToken: false
      })

      return json;
    }else{
      set({
        is_loadToken: false
      })

      return get().authData;
    }
  },
}), shallow)

export const useSettingsStore = createWithEqualityFn((set, get) => ({
  isClick: false,

  saveMySetting: async (token, groupTypeTime, type_show_del, update_interval, centered_map, color) => {

    if( get().isClick === false ){
      set({ isClick: true })
    }else{
      return ;
    }

    const data = {
      type: 'saveMySetting',
      token: token,
      type_data_map: groupTypeTime,
      type_show_del: type_show_del,
      update_interval: update_interval,
      action_centered_map: centered_map ? 1 : 0,
      color: color
    };
      
    const json = await api('settings', data);

    setTimeout( () => {
      set({ isClick: false })
    }, 300 )
  },
  getMySetting: async (token) => {

    const data = {
      type: 'getMySetting',
      token: token
    };
      
    return await api('settings', data);
  },
}), shallow)
