import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SaveButton } from './SaveButton';

describe('SaveButton', () => {
  it('does not save when the surrounding screen is offline', () => {
    const onClick = vi.fn();
    render(<SaveButton onClick={onClick} isSaving={false} disabled />);

    const button = screen.getByRole('button', { name: 'Сохранить' });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('is disabled while a save request is in progress', () => {
    render(<SaveButton onClick={vi.fn()} isSaving />);

    expect(screen.getByRole('button', { name: 'Сохраняем...' })).toBeDisabled();
  });
});
