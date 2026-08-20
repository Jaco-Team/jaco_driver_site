export interface ApiResponse<T = any> {
  st: boolean;
  text?: string;
  data?: T;
  status?: number;
  errors?: Record<string, string[]>;
  captcha_required?: boolean;
  retry_after?: number;
  resend_after?: number;
  locked?: boolean;
}

export interface User {
  token?: string;
  id?: number;
  name?: string;
  login?: string;
  email?: string;
  [key: string]: any;
}

export interface ErrorInfo {
  status: number | null;
  data?: any;
  message: string;
  isNetwork: boolean;
}
