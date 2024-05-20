import { Router } from 'express';

import alertRouter from './routes/alert';
import healthCheckRouter from './routes/healthCheck';
import spreadRouter from './routes/spread';

const router = Router();

router.use('/spread', spreadRouter);
router.use('/healthcheck', healthCheckRouter);
router.use('/alerts', alertRouter);

export default router;
