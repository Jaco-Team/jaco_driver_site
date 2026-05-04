export const devLog = (event: string, message: string, data?: unknown): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[' + event + ']', message, data || '');
  }
};
