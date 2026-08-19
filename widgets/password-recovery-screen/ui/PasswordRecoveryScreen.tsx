import Link from 'next/link';

import Image from 'next/image';

import Grid from '@mui/material/Grid';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

const steps = ['Телефон', 'Подтверждение'];

import Meta from '@/components/meta';

import MyTextInput from '@/shared/ui/MyTextInput';
import PasswordInput from '@/shared/ui/PasswordInput';
import { roboto } from '@/shared/ui/Font';

import { useRegistrationPage } from '../model/useRegistrationPage';

export default function RegistrationPage() {
  const {
    loader,
    panelTitle,
    panelText,
    activeStep,
    myLogin,
    setMyLogin,
    myPWD,
    setMyPWD,
    submitOnEnter,
    requestRecoveryCode,
    myCode,
    setMyCode,
    confirmRecoveryCode,
    errorText,
    helperText,
  } = useRegistrationPage();

  return (
    <Meta title="Восстановление пароля">
      <Backdrop style={{ zIndex: 999, color: '#fff' }} open={loader}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Grid
        container
        spacing={3}
        className={'auth auth--recovery ' + roboto.variable}
        sx={{
          justifyContent: 'center',
        }}
      >
        <Grid size={{ xs: 12, md: 8, lg: 5 }}>
          <section className="auth__panel auth__panel--solo">
            <div className="auth__logoBadge">
              <Image alt={'Лого'} src="/Logo.png" width={92} height={92} priority={true} />
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
              {activeStep == 0 ? (
                <>
                  <MyTextInput
                    label="Номер телефона"
                    value={myLogin}
                    type={'text'}
                    onChange={(e) => setMyLogin(e.target.value)}
                  />
                  <PasswordInput
                    label="Новый пароль"
                    value={myPWD}
                    onChange={(e) => setMyPWD(e.target.value)}
                    onKeyPress={submitOnEnter(requestRecoveryCode)}
                  />
                </>
              ) : (
                <MyTextInput
                  label="Код из смс"
                  value={myCode}
                  onChange={(e) => setMyCode(e.target.value)}
                  onKeyPress={submitOnEnter(confirmRecoveryCode)}
                />
              )}
            </div>

            {errorText ? (
              <div className="auth__error">{errorText}</div>
            ) : (
              <div className="auth__hint">{helperText}</div>
            )}

            <Button
              variant="contained"
              fullWidth
              className="auth__primaryButton"
              onClick={() => (activeStep === 0 ? requestRecoveryCode() : confirmRecoveryCode())}
            >
              {activeStep === 0 ? 'Получить код' : 'Подтвердить'}
            </Button>

            <div className="auth__linkRow">
              <span className="auth__linkCaption">Вспомнили пароль?</span>
              <Link className="auth__link" href="/auth">
                Вернуться к авторизации
              </Link>
            </div>
          </section>
        </Grid>
      </Grid>
    </Meta>
  );
}
