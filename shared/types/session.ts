
export interface SessionData {
  isAuth: boolean | 'load';
  token: string;
  user: any | null;
}

export interface UseSessionReturn {
  isAuth: boolean;
  token: string;
  user: any | null;
}
