import AuthMiddleware from '#middlewares/auth.middleware.js';
import express from 'express';
import listTransactionRoute from './transaction/listTransaction.route.js';
import getTransactionRoute from './transaction/getTransaction.route.js';
import createTransactionRoute from './transaction/createTransaction.route.js';

const router = express.Router();

router.use(AuthMiddleware);
router.get('/', listTransactionRoute)
router.get('/:id', getTransactionRoute)
router.post('/', createTransactionRoute)

export default router;