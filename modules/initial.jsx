import Link from 'next/link';
import Image from 'next/image';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import Logo from '@/public/Logo.png';
import { IconGoogle, IconAppStore } from '@/ui/Icons';

export default function InitialPage() {
  return (
    <Grid className="initial">
      <Grid className="container">
        <Image
          alt={'Лого'}
          src={Logo}
          width={150}
          height={150}
          priority={true}
        />
        <Typography component="span">Приложение доступно для скачивания</Typography>
        <Link href={'https://play.google.com/store/apps/details?id=com.jacodrivertest'} target="_blank">
          <IconGoogle />
        </Link>
        <Link href={'https://testflight.apple.com/join/ZOTvbh7M'} target="_blank">
          <IconAppStore />
        </Link>
      </Grid>
    </Grid>
  );
}
