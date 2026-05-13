export interface InitialLinkItem {
  href: string;
  target: '_blank';
  ariaLabel: string;
}

export interface UseInitialScreenResult {
  links: {
    android: InitialLinkItem;
    ios: InitialLinkItem;
  };
}
