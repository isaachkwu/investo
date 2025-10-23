import express from "express";
import cors from "cors";
import mainRouter from "./routes/index.js";
import ZodErrorMiddleware from "./middlewares/zodError.middleware.js";
import ErrorMiddleware from "./middlewares/error.middleware.js";

const app = express();
const port = process.env.PORT ?? "9001";

app.use(cors({
  origin: 'http://localhost:' + process.env.FRONTEND_PORT,
  credentials: true,
}));
app.use(express.json());
app.use('/', mainRouter);
app.use(ZodErrorMiddleware);
app.use(ErrorMiddleware);

app.listen(port, () => {
  console.log(`Investo backend listening on port ${port}`);
});