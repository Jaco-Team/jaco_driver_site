export interface ApiResponse<T = any> {
  st: boolean;
  text?: string;
  data?: T;
  status?: number;
  errors?: Record<string, string[]>;
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
