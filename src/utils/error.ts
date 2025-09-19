export class VCError extends Error {
  statusCode: number;
  message: string;
  constructor(statusCode: number, message: string) {
    super();
    this.statusCode = statusCode;
    this.message = message;
    Error.captureStackTrace(this, VCError);
  }
}
