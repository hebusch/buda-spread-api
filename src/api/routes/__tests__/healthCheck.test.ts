import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import { app } from '../../../app';
import { ResponseStatus, ServiceResponse } from '../../../common/models/serviceResponse';

describe('HealthCheck Router', () => {
  it('GET /healthcheck - Success', async () => {
    const response = await request(app).get('/healthcheck');
    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toEqual(
      new ServiceResponse(ResponseStatus.Success, 'Service is up and running', null, StatusCodes.OK)
    );
  });
});
