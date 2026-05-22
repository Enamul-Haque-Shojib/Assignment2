

import { Request, Response } from "express";

import { GetIssuesQuery } from "../../types";
import { issueService } from "./issue.service";
import { StatusCodes } from "http-status-codes";

export const createIssue = async (req: Request, res: Response) => {

  try {

   
    const reporterId = req.user?.id;

    const result =
      await issueService.createIssueIntoDB(
        req.body,
        reporterId
      );

    res.status(StatusCodes.CREATED).json({
      success: true,
      message:
        "Issue created successfully",
      data: result.rows[0],
    });

  } catch (err: any) {

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: err.message,
    });

  }
};

export const getAllIssues = async (req: Request, res: Response) => {

  try {

    const result =
      await issueService.getAllIssuesFromDB(
          req.query as GetIssuesQuery
        );

    res.status(StatusCodes.OK).json({
      success: true,
      data: result,
    });

  } catch (err: any) {

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: err.message,
    });

  }
};

const getSingleIssue = async (req: Request, res: Response) => {

  try {

    const issueId =
      Number(req.params.id);

    const result =
      await issueService
        .getSingleIssueFromDB(
          issueId
        );

    res.status(StatusCodes.ACCEPTED).json({
      success: true,
      data: result,
    });

  } catch (err: any) {

    res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: err.message,
    });

  }
};

const updateIssue = async (req: Request, res: Response) => {

  try {

    const issueId =
      Number(req.params.id);

    const currentUser = {
      id: req.user?.id,
      role: req.user?.role,
    };

    const result =
      await issueService
        .updateIssueIntoDB(
          issueId,
          req.body,
          currentUser
        );

    res.status(StatusCodes.ACCEPTED).json({
      success: true,
      message:
        "Issue updated successfully",
      data: result,
    });

  } catch (err: any) {

  
    if (
      err.message ===
      "Issue not found"
    ) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: err.message,
      });
    }

    if (
      err.message.includes(
        "not allowed"
      ) ||
      err.message.includes(
        "Contributors"
      )
    ) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: err.message,
      });
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: err.message,
    });

  }
};

const deleteIssue =
async (
  req: Request,
  res: Response
) => {

  try {

    const issueId =
      Number(req.params.id);

    const currentUser = {
      id: req.user?.id,
      role: req.user?.role,
    };

    await issueService
      .deleteIssueFromDB(
        issueId,
        currentUser
      );

    res.status(StatusCodes.OK).json({
      success: true,
      message:
        "Issue deleted successfully",
    });

  } catch (err: any) {

 
    if (
      err.message ===
      "Issue not found"
    ) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: err.message,
      });
    }

   
    if (
      err.message.includes(
        "maintainers"
      )
    ) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: err.message,
      });
    }

 
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: err.message,
    });

  }
};


export const issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,

};
