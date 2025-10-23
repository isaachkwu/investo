import AuthMiddleware from '#middlewares/auth.middleware.js';
import express from 'express';
import listTransferRoute from './transfer/listTransfer.route.js';
import getTransferRoute from './transfer/getTransfer.route.js';
import createTransferRoute from './transfer/createTransfer.route.js';

const router = express.Router();

router.use(AuthMiddleware);
router.get('/', listTransferRoute);
router.get('/:id', getTransferRoute);
router.post('/', createTransferRoute);

export default router;