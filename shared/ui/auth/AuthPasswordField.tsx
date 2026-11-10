import { useId, useState } from 'react';
import type { KeyboardEvent } from 'react';

import AuthIcon from './AuthIcon';

interface AuthPasswordFieldProps {
  label: string;
  /** Что показываем и скрываем, в винительном падеже: «пароль», «новый пароль». */
  subject: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: 'current-password' | 'new-password';
  name?: string;
  disabled?: boolean;
  invalid?: boolean;
  onEnter?: () => void;
}

export default function AuthPasswordField({
  label,
  subject,
  value,
  onChange,
  autoComplete,
  name,
  disabled = false,
  invalid = false,
  onEnter,
}: AuthPasswordFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Enter') onEnter?.();
  }

  return (
    <>
      <label className="sso-label" htmlFor={id}>
        {label}
      </label>
      <div className="sso-input-wrap">
        <input
          className="sso-input sso-input--password"
          type={visible ? 'text' : 'password'}
          id={id}
          name={name}
          value={value}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={invalid ? 'true' : undefined}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="sso-eye"
          type="button"
          aria-label={`${visible ? 'Скрыть' : 'Показать'} ${subject}`}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          <AuthIcon name="eyeOn" dataEye="on" />
          <AuthIcon name="eyeOff" dataEye="off" />
        </button>
      </div>
    </>
  );
}
