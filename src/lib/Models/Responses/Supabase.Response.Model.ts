export class SupabaseAuthResponse<T> {
  Data: {
    data: T;
    error: any | null;
  } = {
    data: {} as T,
    error: null,
  };
}

export class SupabaseResponse<T> {
  data: Array<T> = new Array<T>();
  error: any | null = null;
  status: number = 200;
  statusText: string = "OK";
}
