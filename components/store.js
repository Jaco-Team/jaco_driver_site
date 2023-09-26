import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';

import { api } from './api.js';

export const useOrdersStore = createWithEqualityFn((set, get) => ({
  orders: [],
  isOpenMenu: false,
  update_interval: 1,
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

  modalFinish: false,
  order_finish_id: null,
  is_map: false,

  // открытие закрытие модалки qr оплаты
  setShowPay: (active) => {
    set({showPay: active })

    if( active === false ){
      set({ payData: null })
    }
  },

  // открытие/закрытие модалки с подтверждением завершения заказа
  setActiveConfirmFinish: (active, id, is_map) => {
    set({ modalFinish: active, order_finish_id: id ?? null, is_map: is_map ?? false })
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

  getOrders: async (is_map = false) => {
    if( get().token.length == 0 ){
      return ;
    }

    const data = {
      type: 'get_orders',
      type_orders: get().type.id,
      token: get().token
    };
      
    try{
      const json = await api('orders', data);

      set({
        orders: json?.orders,
        update_interval: json?.update_interval,
        limit: json?.limit,
        limit_count: json?.limit_count,
        del_orders: json?.arr_del_list
      })
  
      console.log( 'is_map', is_map )
  
      if( is_map === true ){
        get().renderMap(json?.home, json?.orders);
      }
    } catch(err){
      console.log( err )
    }
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

  check_pos: async( func, data ) => {
    await navigator.geolocation.getCurrentPosition(({ coords }) => {
      const { latitude, longitude } = coords
        
      func( { latitude, longitude, data } )
    }, ({ message }) => {
      get().openErrOrder('Не удалось определить местоположение. '+message);
    }, {
      enableHighAccuracy: true
    })
  },

  actionFinishOrder: (order_id, is_map = false) => {
    set({ is_load: true })
    get().check_pos( get().actionOrder, {order_id: order_id, type: 3, is_map} );
  },
  actionCencelOrder: (order_id, is_map = false) => {
    set({ is_load: true })
    get().check_pos( get().actionOrder, {order_id: order_id, type: 2, is_map} );
  },
  actionGetOrder: (order_id, is_map = false) => {
    set({ is_load: true })
    get().check_pos( get().actionOrderFake, {order_id: order_id, is_map} );
  },
  actionFakeOrder: async () => {
    set({ is_load: true })
    get().check_pos( get().actionOrderFake, {order_id: order_id, type: 1, is_map} );
  },
  actionOrder: async({data: { order_id, type, is_map }, latitude, longitude}) => {
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
  actionOrderFake: async({data: { order_id, is_map }, latitude, longitude}) => {
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
      get().closeOrderMap();
      get().getOrders(is_map);

      setTimeout( () => {
        set({ is_load: false })
      }, 500 )
    }
  },

  actionPayOrder: async(order_id, is_map) => {
    set({ is_load: true })
    get().check_pos( get().acttionPay, {order_id, is_map} );    
  },

  acttionPay: async({data: { order_id, is_map }, latitude, longitude}) => {
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
          center: [home.latitude, home.longitude],
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
            coordinates: [home.latitude, home.longitude]
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
              coordinates: [item.xy.latitude, item.xy.longitude]
            },
          })
          
        } )
        
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
          coordinates: [home.latitude, home.longitude]
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
            coordinates: [item.xy.latitude, item.xy.longitude]
          },
        })
        
      } )
      
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
          let new_orders = orders.filter( (item) => item.xy.latitude == order.xy.latitude && item.xy.longitude == order.xy.longitude );

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

  getCheckStatusPay: async({data: { order_id, is_map }, latitude, longitude}) => {
    let data = {
      type: 'check_pay_order',
      token: get().token,
      order_id: order_id
    };
    
    console.log( order_id, is_map, latitude, longitude )

    const res = await api('orders', data);

    if( res.st === true ){
      get().actionOrder( { order_id, type: 3, is_map }, latitude, longitude );
    }
  },
}), shallow)

export const useHeaderStore = createWithEqualityFn((set, get) => ({
  isOpenMenu: false,

  activePageRU: '',

  setActivePageRU: (activePageRU) => {
    set({
      activePageRU: activePageRU
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

}), shallow)

export const usePriceStore = createWithEqualityFn((set, get) => ({
  statPrice: null,
  give_hist: [],

  getStat: async (date) => {
    const data = {
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

  showErrOrder: false, 
  textErrOrder: '',

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
    let data = {
      token: token,
      text: text,
      err_id: err_id,
      row_id: row_id
    };
    
    const res = await api('save_false_cash_orders', data);
    
    if( res['st'] == false ){
      set({
        showErrOrder: true, 
        textErrOrder: res.text,
      })
    }else{
      get().closeModalErr();
      
      get().getGraph(get().chooseDate, token);
    }
  },
  false_err_cam: async(token, text, err_id) => {
    let data = {
      token: token,
      text: text,
      id: err_id
    };
    
    const res = await api('save_false_cash_cum', data);
    
    if( res['st'] == false ){
      set({
        showErrOrder: true, 
        textErrOrder: res.text,
      })
    }else{
      get().closeModalErr();
      
      get().getGraph(get().chooseDate, token);
    }
  },

  closeModalErr: () => {
    set({
      isOpenModalErr: false,
      showErrOrder: null,
      showErrOrderCum: null,
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

  loginErr: '',

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

}), shallow)

export const useSettingsStore = createWithEqualityFn((set, get) => ({
  saveMySetting: async (token, groupTypeTime, type_show_del, update_interval, centered_map, color) => {

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
  },
  getMySetting: async (token) => {

    const data = {
      type: 'getMySetting',
      token: token
    };
      
    return await api('settings', data);
  },
}), shallow)
