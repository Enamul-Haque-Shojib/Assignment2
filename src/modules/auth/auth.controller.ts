import type { Request, Response } from "express";
import { authService } from "./auth.service";


const registerUser = async (req: Request, res: Response) => {

  try {
    const result = await authService.registerUserIntoDB(req.body);
    
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
      
    });
  } catch (err: any) {
  
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const loginUser =
async (
  req: Request,
  res: Response
) => {

  try {

    const result =
      await authService
        .loginUserIntoDB(
          req.body
        );

    const {
      refreshToken,
    } = result;

    // =========================
    // SET COOKIE
    // =========================
    res.cookie(
      "refreshToken",
      refreshToken,
      {
        secure: false, // production => true
        httpOnly: true,
        sameSite: "lax",
      }
    );

    // =========================
    // RESPONSE
    // =========================
    res.status(200).json({
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

    // =========================
    // INVALID CREDENTIALS
    // =========================
    if (
      error.message ===
      "Invalid credentials"
    ) {
      return res.status(401).json({
        success: false,
        message:
          error.message,
      });
    }

    // =========================
    // SERVER ERROR
    // =========================
    res.status(500).json({
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
