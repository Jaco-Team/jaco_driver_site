import type { UseInitialScreenResult } from './useInitialScreen.type';

export function useInitialScreen(): UseInitialScreenResult {
  return {
    links: {
      android: {
        href: 'https://play.google.com/store/apps/details?id=com.jacodrivertest',
        target: '_blank',
        ariaLabel: 'Скачать Android-приложение',
      },
      ios: {
        href: 'https://testflight.apple.com/join/ZOTvbh7M',
        target: '_blank',
        ariaLabel: 'Скачать iOS-приложение',
      },
    },
  };
}
