import { fetch, fetchWrapper, IBody, IRequestInit } from '../src';

export type IResponse = { data: { id: number }; success: boolean };

interface IExtendsRequestInit<T extends IBody, S = unknown> extends IRequestInit<T, S> {
  showError?: boolean;
}

const isError = (res: IResponse) => {
  return !res.success;
};

const resFilter = (_?: IRequestInit) => (res: IResponse) => {
  if (!res) return null;
  if (isError(res)) {
    throw res;
  }
  return res.data;
};

export const fetcher = (url: string, fetchInit?: IExtendsRequestInit<IBody>) => {
  if (fetchInit?.body) fetchInit.method = 'POST';
  return fetch(url, fetchInit)
    .then((res) => res.json())
    .then(resFilter(fetchInit));
};

export default <T extends IBody>(url: string, init?: IExtendsRequestInit<T>) => {
  return fetchWrapper(fetcher)(url, init);
};

// type IFERes = Awaited<ReturnType<typeof fetcher>>;

// export default <T extends IBody, S extends IFERes = IFERes>(
//   url: string,
//   init?: IExtendsRequestInit<T, S>
// ) => {
//   return fetchWrapper(fetcher)(url, init);
// };

// export default fetchWrapper(fetcher);
