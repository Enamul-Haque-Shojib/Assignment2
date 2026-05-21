import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";
import type { ROLES } from "../types";
import { StatusCodes } from "http-status-codes";

const auth = (...roles: ROLES[]) => {

  const result = async (req: Request, res: Response, next: NextFunction) => {
    
    try {
    
      const token = req.headers.authorization;

  
      if (!token) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized access!!",
        });
      }

      const decoded = jwt.verify(
        token as string,
        config.secret as string,
      ) as JwtPayload;

    

      const userData = await pool.query(
        `
     SELECT * FROM users WHERE email=$1   
        `,
        [decoded.email],
      );

      

      const user = userData.rows[0];

    
      if (userData.rows.length === 0) {
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: "User not found!",
        });
      }

  

      if (roles.length && !roles.includes(user.role)) {
        res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message: "Forbidden!!,This role have no access!",
        });
      }

      req.user = decoded; 

      next();
    } catch (error) {
      next(error);
    }
  };

  return result;
};

export default auth;
