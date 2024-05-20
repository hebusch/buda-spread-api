import { StatusCodes } from 'http-status-codes';

import { HealthCheckController } from '../healthCheck';

describe('HealthCheck Controller', () => {
  let controller: HealthCheckController;

  beforeEach(() => {
    controller = new HealthCheckController();
  });

  it('check - Success', async () => {
    const response = await controller.check();

    expect(response.success).toBe(true);
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(response.message).toBe('Service is up and running');
  });
});
