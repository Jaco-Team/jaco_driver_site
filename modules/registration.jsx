import { useState } from 'react';

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image';

import Grid from '@mui/material/Grid';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

const steps = [
  'Телефон',
  'Подтверждение',
];

import { useLoginStore } from '@/components/store.js';

import Meta from '@/components/meta.js';

import MyTextInput from '@/ui/MyTextinput';

import { roboto } from '@/ui/Font';

import { log } from '@/components/analytics';

export default function RegistrationPage(){

  const router = useRouter();

  const [ activeStep, setActiveStep ] = useState(0);

  const [ loader, setLoader ] = useState(false);

  const [ err1, setErr1 ] = useState('');
  const [ err2, setErr2 ] = useState('');

  const [ myLogin, setMyLogin ] = useState('');
  const [ myPWD, setMyPWD ] = useState('');
  const [ myCode, setMyCode ] = useState('');

  const [ sendSMS, sendCode ] = useLoginStore( state => [ state.sendSMS, state.sendCode ] )

  async function next1(){
    if( myLogin.length == 0 || myPWD.length == 0 ){
      return ;
    }

    setLoader(true);

    let res = await sendSMS(myLogin, myPWD);

    if( res.st === true ){
      log('auth_send_sms', 'Отправка СМС-кода');
      setActiveStep(1);
    }else{
      log('auth_send_sms_fail', 'Ошибка отправки СМС-кода');
      setErr1(res.text)
    }

    setTimeout( () => {
      setLoader(false);
    }, 300 )
  }

  async function next2(){
    if( myCode.length != 4 ){
      return ;
    }

    setLoader(true);

    let res = await sendCode(myLogin, myCode);

    if( res.st === true ){
      router.push('/list_orders', { scroll: false })
    }else{
      setErr2(res.text)
    }

    setTimeout( () => {
      setLoader(false);
    }, 300 )
  }

  const panelTitle = activeStep === 0 ? 'Восстановление доступа' : 'Подтверждение по SMS';
  const panelText =
    activeStep === 0
      ? 'Укажите номер телефона и новый пароль. После этого мы отправим код подтверждения.'
      : 'Введите код из SMS, чтобы подтвердить номер и завершить восстановление пароля.';
  const errorText = activeStep === 0 ? err1 : err2;
  const helperText =
    activeStep === 0
      ? 'Пароль лучше задать новый, чтобы сразу обновить доступ к аккаунту.'
      : 'Если код не пришел, проверьте номер телефона и повторите отправку.';

  return (
    <Meta title='Восстановление пароля'>
      <Backdrop style={{ zIndex: 999, color: '#fff' }} open={loader}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Grid container spacing={3} justifyContent="center" className={"auth auth--recovery " + roboto.variable}>
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

            <span className="auth__eyebrow">Восстановление пароля</span>
            <h2 className="auth__panelTitle">{panelTitle}</h2>
            <p className="auth__panelText">{panelText}</p>

            <Stepper activeStep={activeStep} alternativeLabel className="auth__stepper">
              {steps.map((label, key) => (
                <Step key={key}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <div className="auth__fieldGroup">
              { activeStep == 0 ?
                <>
                  <MyTextInput label="Номер телефона" value={myLogin} type={'text'} onChange={ e => setMyLogin(e.target.value) } />
                  <MyTextInput label="Новый пароль" value={myPWD} type={'password'} onChange={ e => setMyPWD(e.target.value) } onKeyPress={ () => next1() } />
                </>
                  :
                <MyTextInput label="Код из смс" value={myCode} onChange={ e => setMyCode(e.target.value) } onKeyPress={ () => next2() } />
              }
            </div>

            {errorText ? (
              <div className="auth__error">{errorText}</div>
            ) : (
              <div className="auth__hint">{helperText}</div>
            )}

            <Button variant="contained" fullWidth className="auth__primaryButton" onClick={ () => activeStep === 0 ? next1() : next2() }>
              {activeStep === 0 ? 'Получить код' : 'Подтвердить'}
            </Button>

            <div className="auth__linkRow">
              <span className="auth__linkCaption">Вспомнили пароль?</span>
              <Link className="auth__link" href='/auth'>Вернуться к авторизации</Link>
            </div>
          </section>
        </Grid>
      </Grid>
    </Meta>
  )
}
