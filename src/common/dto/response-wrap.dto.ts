export class ResponseWrap<T> {
  success: boolean;
  data: T | null;
  error?: string;

  constructor(data: T, error?: string) {
    this.success = !error;
    this.data = error ? null : data;
    this.error = error;
  }
}