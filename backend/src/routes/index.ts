import express from 'express';
import authRouter from './auth.js';
import transactionRouter from './transaction.js';
import investmentRouter from './investment.js';
import instrumentRouter from './instrument.js';
import transferRouter from './transfer.js';
import userRouter from './user.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/transaction', transactionRouter);
router.use('/investment', investmentRouter);
router.use('/instrument', instrumentRouter);
router.use('/transfer', transferRouter);
router.use('/user', userRouter);

export default router;