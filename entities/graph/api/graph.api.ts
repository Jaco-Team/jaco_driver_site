import { ApiResponse, http } from '@/shared/api/client';
import { GraphApiPayload, GraphPointPayload } from '@/entities/graph/api/types';

export async function fetchGraph(
  date: string,
  pointId?: string | number | null
): Promise<GraphApiPayload> {
  const params: Record<string, string | number> = { date };

  if (pointId !== undefined && pointId !== null && `${pointId}` !== '') {
    params.point_id = typeof pointId === 'number' ? pointId : parseInt(`${pointId}`, 10);
  }

  const { data } = await http.get<GraphApiPayload>('/api/v1/graph', {
    params,
  });

  return data;
}

export async function fetchGraphPoints(): Promise<GraphPointPayload[]> {
  const { data } = await http.get<{ data?: GraphPointPayload[] }>('/api/v1/settings/points');
  return Array.isArray(data?.data) ? data.data : [];
}

export async function submitGraphOrderAppeal(
  errId: string | number,
  rowId: string | number,
  text: string
): Promise<ApiResponse> {
  const { data } = await http.post<ApiResponse>('/api/v1/graph/order-appeals', {
    err_id: errId,
    row_id: rowId,
    text,
  });

  return data;
}

export async function submitGraphCameraAppeal(
  id: string | number,
  text: string
): Promise<ApiResponse> {
  const { data } = await http.post<ApiResponse>('/api/v1/graph/camera-appeals', {
    id,
    text,
  });

  return data;
}
