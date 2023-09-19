import { useState } from 'react';

import { useRouter } from 'next/navigation'
import Image from 'next/image';
import { useSession, signIn } from 'next-auth/react';

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

import Logo from '@/public/Logo.png';

import { roboto } from '@/ui/Font';

export default function RegistrationPage(){

  const router = useRouter();
  const session = useSession();

  const [ activeStep, setActiveStep ] = useState(0);

  const [ loader, setLoader ] = useState(false);

  const [ err1, setErr1 ] = useState('');
  const [ err2, setErr2 ] = useState('');

  const [ myLogin, setMyLogin ] = useState('');
  const [ myPWD, setMyPWD ] = useState('');
  const [ myCode, setMyCode ] = useState('');

  const [ sendSMS, sendCode ] = useLoginStore( state => [ state.sendSMS, state.sendCode ] )

  let host = '';

  if (typeof window !== "undefined") {
    host = window.location.origin;
  }

  async function next1(){
    if( myLogin.length == 0 || myPWD.length == 0 ){
      return ;
    }

    setLoader(true);

    let res = await sendSMS(myLogin, myPWD);

    if( res.st === true ){
      setActiveStep(1);
    }else{
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
      signIn('credentials', { redirect: true, password: myPWD, login: myLogin, callbackUrl: `${host}/list_orders` })
    }else{
      setErr2(res.text)
    }

    setTimeout( () => {
      setLoader(false);
    }, 300 )
  }

  if( session && session.status == 'authenticated' ){
    if( session.data?.user?.token.length > 0 ){
      router.push('/list_orders', { scroll: false })
    }
  }

  return (
    <Meta title='Восстановление пароля'>
      <Backdrop style={{ zIndex: 999, color: '#fff' }} open={loader}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Grid container spacing={3} className={"auth " + roboto.variable}>
        
        <Grid item xs={12} md={4}>
          <Image
            alt={'Лого'}
            src={Logo}
            width={150}
            height={150}
            priority={true}
          />

          <Stepper activeStep={activeStep} alternativeLabel style={{ width: '100%' }}>
            {steps.map((label, key) => (
              <Step key={key}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          { activeStep == 0 ?
            <>
              <MyTextInput label="Номер телефона" value={myLogin} onChange={ e => setMyLogin(e.target.value) } />
              <MyTextInput label="Новый пароль" value={myPWD} type={'password'} onChange={ e => setMyPWD(e.target.value) } onKeyPress={ () => next1() } />

              <span>{err1}</span>

              <Button variant="contained" onClick={ () => next1() }>Дальше</Button>
              <a href='/auth'>Вернуться к авторизации</a>
            </>
              :
            <>
              <MyTextInput label="Код из смс" value={myCode} onChange={ e => setMyCode(e.target.value) } onKeyPress={ () => next2() } />

              <span>{err2}</span>

              <Button variant="contained" onClick={ () => next2() }>Дальше</Button>
              <a href='/auth'>Вернуться к авторизации</a>
            </>
          }
        </Grid>
      
      </Grid>
    </Meta>
  )
}
