import { Request, Response, Router } from 'express';

import { handleServiceResponse } from '../../common/utils/httpHandlers';
import { AlertController } from '../controllers/alert';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { market, spread } = req.body;
  const controller = new AlertController();
  const serviceResponse = await controller.createAlert({ market, spread });
  handleServiceResponse(serviceResponse, res);
});

router.put('/', async (req: Request, res: Response) => {
  const { market, spread } = req.body;
  const controller = new AlertController();
  const serviceResponse = await controller.updateAlert({ market, spread });
  handleServiceResponse(serviceResponse, res);
});

router.delete('/', async (req: Request, res: Response) => {
  const { market } = req.body;
  const controller = new AlertController();
  const serviceResponse = await controller.deleteAlert(market);
  handleServiceResponse(serviceResponse, res);
});

router.get('/', async (req: Request, res: Response) => {
  const controller = new AlertController();
  const serviceResponse = await controller.getAllAlerts();
  handleServiceResponse(serviceResponse, res);
});

router.get('/:market', async (req: Request, res: Response) => {
  const { market } = req.params;
  const controller = new AlertController();
  const serviceResponse = await controller.getAlert(market);
  handleServiceResponse(serviceResponse, res);
});

router.get('/:market/check', async (req: Request, res: Response) => {
  const { market } = req.params;
  const controller = new AlertController();
  const serviceResponse = await controller.checkAlert(market);
  handleServiceResponse(serviceResponse, res);
});

export default router;
