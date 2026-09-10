import { useEffect, useId, useRef, useState } from 'react';
import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from 'react';

interface OtpCodeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  length?: number;
}

function keepDigits(value: string, length: number): string {
  return value.replace(/\D/g, '').slice(0, length);
}

export default function OtpCodeInput({
  label,
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = false,
  length = 6,
}: OtpCodeInputProps) {
  const labelId = useId();
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const digits = keepDigits(value, length);

  useEffect(() => {
    if (autoFocus && !disabled) {
      inputs.current[0]?.focus();
    }
  }, [autoFocus, disabled]);

  const focusInput = (index: number) => {
    inputs.current[Math.max(0, Math.min(index, length - 1))]?.focus();
  };

  const commit = (nextValue: string) => {
    const nextDigits = keepDigits(nextValue, length);

    onChange(nextDigits);

    if (nextDigits.length === length && nextDigits !== digits) {
      onComplete?.(nextDigits);
    }
  };

  const insertDigits = (index: number, inserted: string) => {
    const next = digits.slice(0, index) + keepDigits(inserted, length) + digits.slice(index + 1);
    const normalized = keepDigits(next, length);

    commit(normalized);
    focusInput(Math.min(index + inserted.length, length - 1));
  };

  const handleChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const inserted = keepDigits(event.target.value, length);

    if (inserted) {
      insertDigits(index, inserted);
      return;
    }

    commit(digits.slice(0, index) + digits.slice(index + 1));
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusInput(index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusInput(index + 1);
    } else if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault();
      commit(digits.slice(0, index - 1) + digits.slice(index));
      focusInput(index - 1);
    }
  };

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = keepDigits(event.clipboardData.getData('text'), length);

    if (!pasted) {
      return;
    }

    event.preventDefault();
    insertDigits(index, pasted);
  };

  return (
    <div className="auth__otp">
      <span className="auth__otpLabel" id={labelId}>
        {label}
      </span>
      <div
        className={`auth__otpBoxes${disabled ? ' auth__otpBoxes--disabled' : ''}`}
        role="group"
        aria-labelledby={labelId}
      >
        {Array.from({ length }, (_, index) => {
          const digit = digits[index] ?? '';
          const isActive = focusedIndex === index;

          return (
            <input
              key={index}
              ref={(element) => {
                inputs.current[index] = element;
              }}
              className={`auth__otpBox${digit ? ' auth__otpBox--filled' : ''}${
                isActive ? ' auth__otpBox--active' : ''
              }`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              maxLength={index === 0 ? length : 1}
              value={digit}
              disabled={disabled}
              aria-label={`${label}, цифра ${index + 1}`}
              onChange={(event) => handleChange(index, event)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={(event) => handlePaste(index, event)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
            />
          );
        })}
      </div>
    </div>
  );
}
