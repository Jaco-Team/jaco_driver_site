import { Inter, Roboto } from 'next/font/google';

export const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--inter-font',
  preload: false,
});

// Вход и восстановление пароля набраны Inter, как страница входа SSO и ШЭФ.
export const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});
