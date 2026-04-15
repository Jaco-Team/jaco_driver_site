export type TypeDataMap = 'norm' | 'full' | 'min';
export type TypeShowDel = 'full' | 'min' | 'max';
export type ThemeType =
  | 'classic'
  | 'transparent'
  | 'transparent_white'
  | 'white'
  | 'white_border'
  | 'black';

export interface SettingsData {
  point_id?: number | string;
  city_id?: number | string;
  type_data_map?: TypeDataMap;
  type_show_del?: number | string;
  update_interval?: number;
  action_centered_map?: number | string;
  night_map?: number | string;
  is_scaleMap?: number | string;
  driver_avg_time?: number | string | boolean;
  driver_page_stat_time?: number | string | boolean;
  color?: string;
  fontSize?: number;
  theme?: ThemeType;
  mapScale?: number;
}

export interface SettingsResponse extends SettingsData {
  st?: boolean;
  text?: string;
}

export interface SaveSettingsPayload {
  type_data_map: string;
  type_show_del: number;
  update_interval: number;
  action_centered_map: number;
  night_map: number;
  is_scaleMap: number;
  color: string;
  fontSize: number;
  theme: string;
  mapScale: number;
  point_id: number,
}
