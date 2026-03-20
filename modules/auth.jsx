import { useState } from 'react';

import Meta from '@/components/meta.js';

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import Image from 'next/image';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import { useLoginStore } from '@/components/store';

import MyTextInput from '@/ui/MyTextinput';

import { roboto } from '@/ui/Font';

import { log } from '@/components/analytics';

export default function AuthPage(){
  const router = useRouter();

  const [ loginErr, login ] = useLoginStore( state => [ state.loginErr, state.login ] )

  const [ myLogin, setMyLogin ] = useState('');
  const [ myPWD, setMyPWD ] = useState('');

  async function loginFN(){
    if( myLogin.length == 0 || myPWD.length == 0 ){
      return ;
    }

    const res = await login(myLogin, myPWD);

    if( res.st === true ){
      log('auth_login', 'Успешная авторизация');
      router.push('/list_orders', { scroll: false })
    } else {
      log('auth_login_fail', 'Ошибка авторизации');
    }
  }

  return (
    <Meta title='Авторизация'>
      <Grid container spacing={3} justifyContent="center" className={"auth " + roboto.variable}>
        <Grid size={{ xs: 12, md: 8, lg: 5 }}>
          <section className="auth__panel auth__panel--solo">
            <div className="auth__logoBadge">
              <Image
                alt={'Лого'}
                src='/Logo.png'
                width={92}
                height={92}
                priority={true}
              />
            </div>

            <span className="auth__eyebrow">Авторизация</span>
            <h2 className="auth__panelTitle">Вход в аккаунт</h2>
            <p className="auth__panelText">
              Введите номер телефона и пароль, чтобы продолжить работу в приложении.
            </p>

            <div className="auth__fieldGroup">
              <MyTextInput label="Номер телефона" type={'text'} value={myLogin} onChange={ e => setMyLogin(e.target.value) } />
              <MyTextInput label="Пароль" type={'password'} value={myPWD} onChange={ e => setMyPWD(e.target.value) } onKeyPress={ () => loginFN() } />
            </div>

            {loginErr ? (
              <div className="auth__error">{loginErr}</div>
            ) : (
              <div className="auth__hint">Используйте номер телефона, указанный в вашем рабочем аккаунте.</div>
            )}

            <Button variant="contained" fullWidth className="auth__primaryButton" onClick={ () => loginFN() }>
              Войти
            </Button>

            <div className="auth__linkRow">
              <span className="auth__linkCaption">Не получается войти?</span>
              <Link 
                className="auth__link"
                href='/registration'
                onClick={(e) => {
                  e.preventDefault();
                  let done = false;
                  const go = () => { if (done) return; done = true; router.push('/registration', { scroll: false }); };
                  log('auth_go_to_resetpwd', 'Восстановление пароля', null, { callback: go });
                  setTimeout(go, 200);
                }}
              >
                Восстановить пароль
              </Link>
            </div>
          </section>
        </Grid>
      </Grid>
    </Meta>
  )
}
