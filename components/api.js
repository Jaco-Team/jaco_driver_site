import queryString from 'query-string';
import axios from 'axios';

export function api(module = '', data = {}){
  const urlApi = 'https://api.jacochef.ru/driver/public/index.php/';
  //const urlApi = 'https://jacochef.ru/testv2/rest_api2/public/index.php/';

  return axios.post(urlApi+module, queryString.stringify(data))
    .then( (response) => {
      
      console.log('response', response)

      if( typeof response.data == 'string' ){
        return {
          st: false,
          text: response.data
        };
      }

      return response.data;
    })
    .catch( (error) => {
      console.error( 'error', error );

      if( error.code == "ERR_NETWORK" ){

      }else{
        return {
          text: error
        };
      }
    });

  return fetch(urlApi+module, {
    method: 'POST',
    headers: {
      'Content-Type':'application/x-www-form-urlencoded'},
    body: queryString.stringify(data)
  })
  
  .then((res) => res.json() )
  .then((json) => {
    //console.log( 'result', json );
    return json;
  })
  .catch((err, err2) => {

    /*return axios.post(urlApi+module, queryString.stringify(data))
    .then( (response) => {
      console.log( 'response', response);

      return {
        text: response.data
      };
    })
    .catch( (error) => {
      console.error( 'error', error );
      return {
        text: error
      };
    });*/

    return {
      text: ''
    };

    //console.log('err', err, err2);
    
    
  });
}