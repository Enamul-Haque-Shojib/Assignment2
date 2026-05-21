import CookieParser from "cookie-parser";
import cors from "cors";
import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import logger from "./middleware/logger";
import { authRoute } from "./modules/auth/auth.route";
import globalErrorHandler from "./middleware/globalErrorHandler";
import { issueRoute } from "./modules/issue/issue.route";
const app: Application = express();

app.use(CookieParser());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

app.get("/", (req: Request, res: Response) => {
  //res.send("Hello World!");
  res.status(200).json({
    message: "Express Server",
    author: "Next Level",
  });
});


app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);

// Global Error Handling Middleware
app.use(globalErrorHandler);

export default app;
