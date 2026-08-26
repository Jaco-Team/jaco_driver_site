export interface ApiResponse<T = unknown> {
  st: boolean;
  text?: string;
  data?: T;
  status?: number;
  errors?: Record<string, string[]>;
  captcha_required?: boolean;
  retry_after?: number;
  resend_after?: number;
  locked?: boolean;
  message?: string;
}

export interface UserSettings {
  type_data_map?: string;
  type_show_del?: string | number;
  update_interval?: number;
  action_centered_map?: number | string;
  night_map?: number | string;
  dark_theme?: number | string | boolean;
  is_scaleMap?: number | string;
  fontSize?: number;
  theme?: string;
  mapScale?: number;
  city_id?: number | string | null;
  point_id?: number | string | null;
  color?: string;
}

export interface User {
  token?: string;
  token_type?: string;
  id?: number;
  user_id?: number | null;
  name?: string | null;
  login?: string | null;
  email?: string;
  city_id?: number | null;
  point_id?: number | null;
  appointment_id?: number | null;
  auth_mode?: string;
  settings?: UserSettings;
}

export interface ErrorInfo {
  status: number | null;
  data?: unknown;
  message: string;
  isNetwork: boolean;
}
