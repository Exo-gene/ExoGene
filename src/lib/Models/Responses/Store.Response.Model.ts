export class Store<T> {
  data: Array<T> = new Array<T>();
  error: any | null = null;
  count: number = 0;
}
