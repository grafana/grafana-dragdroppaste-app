import { BackendSrvRequest, getBackendSrv } from '@grafana/runtime';
import { lastValueFrom } from 'rxjs';
export interface SuccessfulFetchResponse<T> {
  status: number;
  data: T;
}
export function fetchApi<D>(url: string, optionsOverride: Partial<BackendSrvRequest> = {}): Promise<SuccessfulFetchResponse<D>> {
  const options: BackendSrvRequest = {
    headers: {},
    url: url,
    showErrorAlert: false,
    ...optionsOverride,
  };
  return lastValueFrom(getBackendSrv().fetch<D>(options));
}
export async function doesDatasourceExist(type: string): Promise<string | undefined> {
  const datsasources = await apiGet<Array<{ type: string; uid: string }>>(`api/datasources`);
  return datsasources.find((d) => d.type === type)?.uid;
}
export async function apiGet<D>(url: string, optionsOverride: Partial<BackendSrvRequest> = {}): Promise<D> {
  const response = await fetchApi<D>(url, { ...optionsOverride, method: 'GET' });
  return response?.data;
}
