export default function useSession() {
  console.log( 'useSession load' )

  if( typeof window == 'undefined' ){
    return {isAuth: 'load', token: ''};
  }

  if( localStorage.getItem('token') && localStorage.getItem('token').length > 0 ){
    return {isAuth: true, token: localStorage.getItem('token')};
  }else{
    return {isAuth: false, token: ''};
  }
} 