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
    vi.clearAllMocks();
    useFeedbackStore.setState({
      addModal: true,
      type: 'предложение',
      title: '',
      description: '',
      img: null,
      is_need_notification: false,
      isSaving: false,
      snackbar: {
        open: false,
        vertical: 'top',
        horizontal: 'center',
        severity: 'error',
        message: '',
      },
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

  it('accepts only images and explains why a video was rejected', () => {
    render(<CreateFeedbackDialog open onClose={() => undefined} globalFontSize={16} />);
    const input = screen.getByTestId('feedback-attachment-input');
    const video = new File(['video'], 'clip.mp4', { type: 'video/mp4' });

    expect(input).toHaveAttribute('accept', 'image/*');
    fireEvent.change(input, { target: { files: [video] } });

    expect(screen.queryByAltText('clip.mp4')).not.toBeInTheDocument();
    expect(useFeedbackStore.getState().img).toBeNull();
    expect(useFeedbackStore.getState().snackbar).toMatchObject({
      open: true,
      vertical: 'top',
      horizontal: 'center',
      severity: 'error',
      message: 'Можно загружать только изображения.',
    });
  });

  it('rejects a video dropped onto the attachment area', () => {
    render(<CreateFeedbackDialog open onClose={() => undefined} globalFontSize={16} />);
    const video = new File(['video'], 'clip.webm', { type: 'video/webm' });

    fireEvent.drop(screen.getByTestId('feedback-attachment-dropzone'), {
      dataTransfer: { files: [video] },
    });

    expect(screen.queryByAltText('clip.webm')).not.toBeInTheDocument();
    expect(useFeedbackStore.getState().img).toBeNull();
    expect(useFeedbackStore.getState().snackbar.message).toBe(
      'Можно загружать только изображения.'
    );
    expect(useFeedbackStore.getState().snackbar.vertical).toBe('top');
    expect(useFeedbackStore.getState().snackbar.horizontal).toBe('center');
  });

  it.each(['picker', 'drop'])('keeps previous photos and filters a mixed group from %s', (mode) => {
    render(<CreateFeedbackDialog open onClose={() => undefined} globalFontSize={16} />);
    const input = screen.getByTestId('feedback-attachment-input');
    const previous = new File(['first'], 'first.png', { type: 'image/png' });
    const next = new File(['second'], 'SECOND.JPG');
    const video = new File(['video'], 'clip.mp4', { type: 'video/mp4' });
    const disguised = new File(['video'], 'not-a-photo.jpg', { type: 'video/mp4' });
    fireEvent.change(input, { target: { files: [previous] } });

    if (mode === 'picker') {
      fireEvent.change(input, { target: { files: [next, video, disguised] } });
    } else {
      fireEvent.drop(screen.getByTestId('feedback-attachment-dropzone'), {
        dataTransfer: { files: [next, video, disguised] },
      });
    }

    expect(useFeedbackStore.getState().img).toEqual([previous, next]);
    expect(screen.getByAltText('first.png')).toBeInTheDocument();
    expect(screen.getByAltText('SECOND.JPG')).toBeInTheDocument();
    expect(screen.queryByAltText('clip.mp4')).not.toBeInTheDocument();
    expect(screen.queryByAltText('not-a-photo.jpg')).not.toBeInTheDocument();
    expect(useFeedbackStore.getState().snackbar).toMatchObject({
      open: true,
      severity: 'error',
      message: 'Можно загружать только изображения.',
    });
  });

  it('clears the picker input and accepts the same photo again after removal', () => {
    render(<CreateFeedbackDialog open onClose={() => undefined} globalFontSize={16} />);
    const input = screen.getByTestId('feedback-attachment-input') as HTMLInputElement;
    const photo = new File(['photo'], 'photo.png', { type: 'image/png' });
    // jsdom change events do not populate the browser's fake file path.
    Object.defineProperty(input, 'value', {
      configurable: true,
      writable: true,
      value: 'fakepath/photo.png',
    });
    fireEvent.change(input, { target: { files: [photo] } });
    expect(input.value).toBe('');
    fireEvent.click(screen.getByRole('button', { name: 'Удалить photo.png' }));
    expect(useFeedbackStore.getState().img).toBeNull();

    input.value = 'fakepath/photo.png';
    fireEvent.change(input, { target: { files: [photo] } });
    expect(input.value).toBe('');
    expect(useFeedbackStore.getState().img).toEqual([photo]);
    expect(screen.getByAltText('photo.png')).toBeInTheDocument();
  });
});
