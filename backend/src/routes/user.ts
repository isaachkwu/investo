import AuthMiddleware from '#middlewares/auth.middleware.js';
import express from 'express';
import MeRoute from './user/me.route.js';
const router = express.Router();

router.use(AuthMiddleware);
router.get('/me', MeRoute);

export default router;