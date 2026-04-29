export interface GraphApiPayload {
  date?: string;
  all_dates?: unknown[];
  users?: unknown[];
  month?: unknown[];
  errs?: {
    orders?: unknown[];
    err_cam?: unknown[];
  };
  user_id?: string | number;
  user_name?: string;
}
