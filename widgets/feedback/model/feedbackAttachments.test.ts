import { describe, expect, it } from 'vitest';
import { isFeedbackImageFile } from './feedbackAttachments';

describe('feedback attachment metadata', () => {
  it.each([
    { name: 'photo.jpg', type: 'image/jpeg' },
    { name: 'photo.bin', type: ' IMAGE/PNG ' },
    { name: 'photo.heic', type: 'image/heic' },
    { name: 'PHOTO.JPEG', type: '' },
    { name: 'photo.webp', type: '' },
    { name: 'photo.gif', type: '   ' },
  ])('accepts supported image metadata %j', (file) => {
    expect(isFeedbackImageFile(file)).toBe(true);
  });

  it.each([
    { name: 'photo.jpg', type: 'video/mp4' },
    { name: 'photo.png', type: ' VIDEO/WEBM ' },
    { name: 'photo.jpg', type: 'application/pdf' },
    { name: 'clip.mp4', type: '' },
    { name: 'unknown.bin', type: '' },
    { name: '', type: '' },
  ])('rejects unsupported or contradictory metadata %j', (file) => {
    expect(isFeedbackImageFile(file)).toBe(false);
  });
});
