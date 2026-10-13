import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Feedback } from '@/entities/feedback/model/types';
import { FeedbackDetailsDrawer } from './FeedbackDetailsDrawer';

const feedback: Feedback = {
  id: 48,
  type: 'другое',
  title: 'Несколько изображений',
  description: 'Тест',
  status: 1,
  answer: null,
  date_time_create: '2026-09-24 12:00:00',
  link: 'https://example.test/1.png',
  images: [
    'https://example.test/1.png',
    'https://example.test/2.png',
    'https://example.test/3.png',
    'https://example.test/4.png',
  ],
};

describe('FeedbackDetailsDrawer images', () => {
  it('shows every unique image returned by the API', () => {
    render(
      <FeedbackDetailsDrawer
        open
        feedback={feedback}
        onClose={() => undefined}
        globalFontSize={16}
      />
    );

    expect(screen.getByText('Изображение')).toBeInTheDocument();
    const thumbnails = screen.getAllByRole('img', { name: /Изображение предложения \d/ });

    expect(thumbnails).toHaveLength(4);
    thumbnails.forEach((image) => {
      expect(image).toHaveAttribute('loading', 'lazy');
      fireEvent.load(image);
    });
    expect(screen.getAllByRole('button', { name: /Открыть изображение/ })).toHaveLength(4);

    fireEvent.click(screen.getByRole('button', { name: 'Открыть изображение 2' }));

    expect(screen.getByAltText('Изображение предложения')).toHaveAttribute(
      'src',
      'https://example.test/2.png'
    );
  });

  it('shows an error and retries a failed image with a fresh URL', () => {
    render(
      <FeedbackDetailsDrawer
        open
        feedback={feedback}
        onClose={() => undefined}
        globalFontSize={16}
      />
    );

    fireEvent.error(screen.getByAltText('Изображение предложения 1'));

    const retryButton = screen.getByRole('button', {
      name: 'Повторить загрузку изображения 1',
    });
    expect(screen.getByText('Не удалось загрузить изображение')).toBeInTheDocument();

    fireEvent.click(retryButton);

    expect(screen.getByAltText('Изображение предложения 1')).toHaveAttribute(
      'src',
      'https://example.test/1.png?feedback_retry=1'
    );
    expect(screen.getByRole('button', { name: 'Загружается изображение 1' })).toBeInTheDocument();
  });
});
