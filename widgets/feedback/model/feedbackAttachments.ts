export const FEEDBACK_IMAGES_ONLY_MESSAGE = 'Можно загружать только изображения.';

const IMAGE_FILE_EXTENSION = /\.(?:gif|jpe?g|png|webp)$/i;

export function isFeedbackImageFile(file: Pick<File, 'name' | 'type'>): boolean {
  const mimeType = file.type.trim().toLowerCase();

  if (mimeType) return mimeType.startsWith('image/');

  return IMAGE_FILE_EXTENSION.test(file.name);
}
