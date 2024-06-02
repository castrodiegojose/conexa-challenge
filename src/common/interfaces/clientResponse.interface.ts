export default interface ClientResponse<T> {
  data: T | null;
  message: string;
  isSuccess: boolean;
  statusCode: number;
}
