import CookieParser from "cookie-parser";
import cors from "cors";
import express, {
  type Application,
  type Request,
  type Response,
} from "express";

import { authRoute } from "./modules/auth/auth.route";
import globalErrorHandler from "./middleware/globalErrorHandler";
import { issueRoute } from "./modules/issue/issue.route";
import { StatusCodes } from "http-status-codes";
const app: Application = express();

app.use(CookieParser());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

app.get("/", (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    message: "Express Server",
    author: "Next Level",
  });
});


app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);


app.use(globalErrorHandler);

export default app;
