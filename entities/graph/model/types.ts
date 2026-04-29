export interface GraphMonthItem {
  day: string;
  month: string;
  is_active: number | string;
  [key: string]: unknown;
}

export interface GraphDateCell {
  day: number | string;
  dow: string;
  [key: string]: unknown;
}

export interface GraphScheduleCell {
  user_id?: number | string;
  driver_id?: number | string;
  id?: number | string;
  user_name?: string;
  min?: number | string;
  hours?: string;
  is_my?: boolean | number | string;
  is_me?: boolean | number | string;
  [key: string]: unknown;
}

export type GraphScheduleRow = GraphScheduleCell[];

export interface GraphOrderError {
  order_id?: number | string;
  date_time_order?: string;
  order_desc?: string;
  item_name?: string;
  pr_name?: string;
  my_price?: number | string;
  imgs: string[];
  new_text_1?: string;
  new_text_2?: string;
  is_edit?: number | string;
  err_id?: number | string;
  row_id?: number | string;
  [key: string]: unknown;
}

export interface GraphCameraError {
  id?: number | string;
  date_time_fine?: string;
  fine_name?: string;
  price?: number | string;
  imgs: string[];
  text_one?: string;
  text_two?: string;
  is_edit?: number | string;
  [key: string]: unknown;
}

export type GraphErrorModal =
  | {
      kind: 'order';
      item: GraphOrderError;
    }
  | {
      kind: 'camera';
      item: GraphCameraError;
    }
  | null;

export interface GraphStateSnapshot {
  monthList: GraphMonthItem[];
  dates: GraphDateCell[];
  users: GraphScheduleRow[];
  currentUserId: string;
  currentUserName: string;
  errOrders: GraphOrderError[];
  errCam: GraphCameraError[];
  chooseDate: string;
}
