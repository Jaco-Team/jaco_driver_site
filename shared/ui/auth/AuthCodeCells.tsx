import { useEffect, useRef } from 'react';
import type { ClipboardEvent, KeyboardEvent } from 'react';

export const AUTH_CODE_LENGTH = 6;

interface AuthCodeCellsProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

/** Шесть ячеек кода подтверждения, как на странице входа SSO. */
export default function AuthCodeCells({
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
}: AuthCodeCellsProps) {
  const cells = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!disabled) cells.current[Math.min(value.length, AUTH_CODE_LENGTH - 1)]?.focus();
    // Фокус ставим один раз при показе шага и после очистки кода.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, value === '']);

  function apply(next: string): void {
    const code = next.replace(/\D/g, '').slice(0, AUTH_CODE_LENGTH);

    onChange(code);
    cells.current[Math.min(code.length, AUTH_CODE_LENGTH - 1)]?.focus();
    if (code.length === AUTH_CODE_LENGTH) onComplete?.(code);
  }

  function handleInput(index: number, raw: string): void {
    const digits = raw.replace(/\D/g, '');

    if (!digits) return;
    apply(value.slice(0, index) + digits + value.slice(index + 1));
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Backspace') {
      event.preventDefault();
      // Стираем цифру в ячейке, а если она пустая — предыдущую.
      const target = value[index] ? index : Math.max(0, index - 1);

      onChange(value.slice(0, target));
      cells.current[target]?.focus();
    } else if (event.key === 'ArrowLeft') {
      cells.current[Math.max(0, index - 1)]?.focus();
    } else if (event.key === 'ArrowRight') {
      cells.current[Math.min(AUTH_CODE_LENGTH - 1, index + 1)]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>): void {
    event.preventDefault();
    apply(event.clipboardData.getData('text'));
  }

  return (
    <div
      className="sso-code"
      role="group"
      aria-label="Код подтверждения, 6 цифр"
      data-error={error ? 'true' : undefined}
    >
      {Array.from({ length: AUTH_CODE_LENGTH }, (_, index) => (
        <input
          key={index}
          ref={(element) => {
            cells.current[index] = element;
          }}
          className="sso-code__cell"
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={`Цифра ${index + 1} кода`}
          value={value[index] ?? ''}
          disabled={disabled}
          onChange={(event) => handleInput(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}
