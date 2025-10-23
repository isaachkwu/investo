import express from 'express';
import loginRoute from './auth/login.route.js';
import registerRoute from './auth/register.route.js';
import refreshRoute from './auth/refresh.route.js';

const router = express.Router();

router.post("/login", loginRoute);
router.post("/register", registerRoute);
router.post("/refresh", refreshRoute);

export default router;
