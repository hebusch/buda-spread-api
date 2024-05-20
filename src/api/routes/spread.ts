import { Request, Response, Router } from 'express';

import { handleServiceResponse } from '../../common/utils/httpHandlers';
import { SpreadController } from '../controllers/spread';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const controller = new SpreadController();
  const serviceResponse = await controller.getAllSpreads();
  handleServiceResponse(serviceResponse, res);
});

router.get('/:market', async (req: Request, res: Response) => {
  const { market } = req.params;
  const controller = new SpreadController();
  const serviceResponse = await controller.getSpread(market);
  handleServiceResponse(serviceResponse, res);
});

export default router;
