import { useState } from 'react';
import type { CSSProperties } from 'react';

import AuthIcon from './AuthIcon';
import type { AuthIconName } from './authIconPaths';

export interface AuthChannelOption<T extends string> {
  value: T;
  label: string;
  helper: string;
  icon: AuthIconName;
}

interface AuthChannelSwitchProps<T extends string> {
  options: ReadonlyArray<AuthChannelOption<T>>;
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}

/** Переключатель способа получения кода с подписью под ним, как на странице входа SSO. */
export default function AuthChannelSwitch<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
}: AuthChannelSwitchProps<T>) {
  // Направление задаёт, какой край «бегунка» двигается первым.
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );

  function select(next: T): void {
    const nextIndex = options.findIndex((option) => option.value === next);

    setDirection(nextIndex < index ? 'backward' : 'forward');
    onChange(next);
  }

  return (
    <div className="sso-gap-3">
      <p className="sso-label sso-label--plain" id="channel-label">
        Способ получения кода
      </p>
      <div
        className="sso-segment"
        role="tablist"
        aria-labelledby="channel-label"
        aria-describedby="channel-helper"
        data-direction={direction}
        style={{ '--count': options.length, '--index': index } as CSSProperties}
      >
        <span className="sso-segment__thumb" aria-hidden="true" />
        {options.map((option) => (
          <button
            key={option.value}
            className="sso-segment__tab"
            type="button"
            role="tab"
            aria-selected={option.value === value}
            tabIndex={option.value === value ? 0 : -1}
            disabled={disabled}
            onClick={() => select(option.value)}
          >
            <AuthIcon name={option.icon} />
            <span>{option.label}</span>
          </button>
        ))}
      </div>
      <div className="sso-helpers" id="channel-helper" aria-live="polite">
        {options.map((option) => (
          <p
            key={option.value}
            className="sso-helper"
            data-active={option.value === value ? 'true' : 'false'}
            aria-hidden={option.value === value ? undefined : true}
          >
            {option.helper}
          </p>
        ))}
      </div>
    </div>
  );
}
