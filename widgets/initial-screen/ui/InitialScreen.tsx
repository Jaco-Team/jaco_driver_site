import Link from 'next/link';
import Image from 'next/image';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { IconGoogle, IconAppStore } from '@/shared/ui/Icons';
import { useInitialScreen } from '../model/useInitialScreen';

export default function InitialPage() {
  const { links } = useInitialScreen();

  return (
    <Grid className="initial">
      <Grid className="container">
        <Image alt={'Лого'} src="/Logo.png" width={150} height={150} priority={true} />
        <Typography component="span">Приложение доступно для скачивания</Typography>
        <Link
          href={links.android.href}
          target={links.android.target}
          aria-label={links.android.ariaLabel}
        >
          <IconGoogle />
        </Link>
        <Link href={links.ios.href} target={links.ios.target} aria-label={links.ios.ariaLabel}>
          <IconAppStore />
        </Link>
      </Grid>
    </Grid>
  );
}
