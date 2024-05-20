export enum ResponseStatus {
  Success = 'success',
  Failed = 'failed',
}

export class ServiceResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;

  constructor(status: ResponseStatus, message: string, data: T, statusCode: number) {
    this.success = status === ResponseStatus.Success;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }
}

export const ServiceResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    message: { type: 'string' },
    data: {},
    statusCode: { type: 'number' },
  },
};
