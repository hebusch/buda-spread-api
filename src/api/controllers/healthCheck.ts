import { StatusCodes } from 'http-status-codes';
import { Controller, Get, Route } from 'tsoa';

import { ResponseStatus, ServiceResponse } from '../../common/models/serviceResponse';

@Route('healthcheck')
export class HealthCheckController extends Controller {
  @Get('/')
  public async check(): Promise<ServiceResponse<any>> {
    return new ServiceResponse(ResponseStatus.Success, 'Service is up and running', null, StatusCodes.OK);
  }
}
