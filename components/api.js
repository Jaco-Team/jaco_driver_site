import queryString from 'query-string';

export function api(module = '', data = {}){
  const urlApi = 'https://api.jacochef.ru/driver/public/index.php/';
  //const urlApi = 'https://jacochef.ru/testv2/rest_api2/public/index.php/';

  return fetch(urlApi+module, {
    method: 'POST',
    headers: {
      'Content-Type':'application/x-www-form-urlencoded'},
    body: queryString.stringify(data)
  })
  .then((res) => res.json() )
  .then((json) => {
    return json;
  })
  .catch((err) => {
    return {
      text: JSON.stringify(err)
    };
    console.log(err);
  });
}