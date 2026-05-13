import { memo } from 'react';

import { DateLauncherProps } from '../model/usePriceScreen.type';

function DateLauncherComponent({ label, value, onClick, globalFontSize }: DateLauncherProps) {
  return (
    <button type="button" className="price__dateLauncher" onClick={onClick}>
      <span className="price__dateLauncherLabel" style={{ fontSize: globalFontSize }}>
        {label}
      </span>
      <span className="price__dateLauncherValue" style={{ fontSize: globalFontSize }}>
        {value}
      </span>
    </button>
  );
}

export const DateLauncher = memo(DateLauncherComponent);
