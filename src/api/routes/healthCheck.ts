import { Request, Response, Router } from 'express';

import { handleServiceResponse } from '../../common/utils/httpHandlers';
import { HealthCheckController } from '../controllers/healthCheck';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const controller = new HealthCheckController();
  const serviceResponse = await controller.check();
  handleServiceResponse(serviceResponse, res);
});

export default router;
