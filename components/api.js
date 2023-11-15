import queryString from 'query-string';
import axios from 'axios';

export function api(module = '', data = {}){
  const urlApi = 'https://api.jacochef.ru/driver/public/index.php/';

  return axios.post(urlApi+module, queryString.stringify(data))
    .then( (response) => {
      
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
}