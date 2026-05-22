import type { Request, Response } from "express";
import { authService } from "./auth.service";
import { StatusCodes } from "http-status-codes";


const registerUser = async (req: Request, res: Response) => {

  try {
    const result = await authService.registerUserIntoDB(req.body);
    
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
      
    });
  } catch (err: any) {
  
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: err.message,
    });
  }
};

const loginUser = async (req: Request, res: Response) => {

  try {

    const result = await authService.loginUserIntoDB(req.body);

    const {refreshToken} = result;

    res.cookie(
      "refreshToken",
      refreshToken,
      {
        secure: false, 
        httpOnly: true,
        sameSite: "lax",
      }
    );

 
    res.status(StatusCodes.OK).json({
      success: true,
      message:
        "Login successful",
      data: {
        token:
          result.token,

        user:
          result.user,
      },
    });

  } catch (error: any) {


    if (error.message === "Invalid credentials") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message:
          error.message,
      });
    }

    
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message:
        error.message,
    });

  }
};



export const authController = {
  loginUser,
  registerUser
};
