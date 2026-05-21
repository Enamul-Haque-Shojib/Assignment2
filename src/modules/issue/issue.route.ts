import { Router } from "express";
import { issueController } from "./issue.controller";
import { USER_ROLE } from "../../types";
import auth from "../../middleware/auth";


const router = Router();

router.post("/",
auth(USER_ROLE.contributor, USER_ROLE.maintainer),
   issueController.createIssue);

   
router.get(
  "/",
  issueController.getAllIssues
);

router.get(
  "/:id",
  issueController.getSingleIssue
);

// issue.route.ts

router.patch(
  "/:id",
//   verifyToken,
  issueController.updateIssue
);

// issue.route.ts

router.delete(
  "/:id",
//   verifyToken,
  issueController.deleteIssue
);

export const issueRoute = router;
