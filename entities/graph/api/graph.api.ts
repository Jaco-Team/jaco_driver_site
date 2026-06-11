import { http } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/api/types';
import { connector } from '@/shared/api/connector';
import { apiRoutes } from '@/shared/api/routes';
import { GraphApiPayload } from '@/entities/graph/api/types';

function normalizePointId(value?: string | number | null): number | null {
  if (value === undefined || value === null || `${value}`.trim() === '') {
    return null;
  }

  const parsed = typeof value === 'number' ? value : parseInt(`${value}`, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export async function fetchGraph(
  date: string,
  pointId?: string | number | null
): Promise<GraphApiPayload> {
  const payload: Record<string, string | number> = { date };
  const normalizedPointId = normalizePointId(pointId);

  if (normalizedPointId !== null) {
    payload.point_id = normalizedPointId;
  }

  return connector.rest.post<GraphApiPayload, typeof payload>(apiRoutes.graph.root, payload);
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
