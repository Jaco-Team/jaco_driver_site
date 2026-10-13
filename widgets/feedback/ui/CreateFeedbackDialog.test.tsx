import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { useFeedbackStore } from '@/widgets/feedback/model/feedback.store';
import { CreateFeedbackDialog } from './CreateFeedbackDialog';

const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

describe('CreateFeedbackDialog attachments', () => {
  beforeAll(() => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn((file: File) => `blob:${file.name}`),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterAll(() => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: originalCreateObjectURL,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: originalRevokeObjectURL,
    });
  });

  beforeEach(() => {
    useFeedbackStore.setState({
      addModal: true,
      type: 'предложение',
      title: '',
      description: '',
      img: null,
      is_need_notification: false,
      isSaving: false,
    });
  });

  it('shows selected files and removes one attachment', () => {
    render(<CreateFeedbackDialog open onClose={() => undefined} globalFontSize={16} />);
    const input = document.querySelector('input[type="file"]');
    const first = new File(['one'], 'one.png', { type: 'image/png' });
    const second = new File(['two'], 'two.png', { type: 'image/png' });

    expect(input).not.toBeNull();
    fireEvent.change(input as HTMLInputElement, { target: { files: [first, second] } });

    expect(screen.getByAltText('one.png')).toBeInTheDocument();
    expect(screen.getByAltText('two.png')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Удалить one.png' }));

    expect(screen.queryByAltText('one.png')).not.toBeInTheDocument();
    expect(screen.getByAltText('two.png')).toBeInTheDocument();
  });
});
