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
  Data: {
    data: T;
    error: any | null;
  } = {
    data: {} as T,
    error: null,
  };
}
