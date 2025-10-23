import AuthMiddleware from '#middlewares/auth.middleware.js';
import express from 'express';
import listInstrumentRoute from './instrument/listInstrument.route.js';
import getInstrumentRoute from './instrument/getInstrument.route.js';

const router = express.Router();

router.use(AuthMiddleware);
router.get('/', listInstrumentRoute);
router.get('/:id', getInstrumentRoute);

export default router;
