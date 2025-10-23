import AuthMiddleware from '#middlewares/auth.middleware.js';
import express from 'express';
import listInvestmentRoute from './investment/listInvestment.route.js';
import getInvestmentRoute from './investment/getInvestment.route.js';

const router = express.Router();

router.use(AuthMiddleware);
router.get('/', listInvestmentRoute);
router.get('/:instrumentId', getInvestmentRoute);

export default router;