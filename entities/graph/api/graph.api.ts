import { ApiResponse, http } from '@/shared/api/client';
import { connector } from '@/shared/api/connector';
import { apiRoutes } from '@/shared/api/routes';
import { GraphApiPayload, GraphPointPayload } from '@/entities/graph/api/types';

export async function fetchGraph(
  date: string,
  pointId?: string | number | null
): Promise<GraphApiPayload> {
  const payload: Record<string, string | number> = { date };

  if (pointId !== undefined && pointId !== null && `${pointId}` !== '') {
    payload.point_id = typeof pointId === 'number' ? pointId : parseInt(`${pointId}`, 10);
  }

  return connector.rest.post<GraphApiPayload, typeof payload>(apiRoutes.graph.root, payload);
}

export async function fetchGraphPoints(): Promise<GraphPointPayload[]> {
  const { data } = await http.get<{ data?: GraphPointPayload[] }>(apiRoutes.settings.points);
  return Array.isArray(data?.data) ? data.data : [];
}

export async function submitGraphOrderAppeal(
  errId: string | number,
  rowId: string | number,
  text: string
): Promise<ApiResponse> {
  const { data } = await http.post<ApiResponse>(apiRoutes.graph.orderAppeals, {
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
  const { data } = await http.post<ApiResponse>(apiRoutes.graph.cameraAppeals, {
    id,
    text,
  });

  return data;
}
