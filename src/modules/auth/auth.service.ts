import bcrypt from "bcryptjs";
import { pool } from "./../../db/index";

import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../../config";
import type { RegisterPayload } from "../../types";


const registerUserIntoDB = async (
  payload: RegisterPayload
) => {

  const {
    name,
    email,
    password,
    role = "contributor",
  } = payload;

  // =========================
  // HASH PASSWORD
  // =========================
  const hashedPassword =
    await bcrypt.hash(password, 10);

  // =========================
  // INSERT USER
  // =========================
  const query = `
    INSERT INTO users (
      name,
      email,
      password,
      role
    )
    VALUES (
      $1,
      $2,
      $3,
      $4
    )
    RETURNING
      id,
      name,
      email,
      role,
      created_at,
      updated_at;
  `;

  const values = [
    name,
    email,
    hashedPassword,
    role,
  ];

  const result =
    await pool.query(query, values);

  return result;
};



const loginUserIntoDB =
async (
  payload: {
    email: string;
    password: string;
  }
) => {

  const {
    email,
    password,
  } = payload;

  // =========================
  // VALIDATION
  // =========================
  if (!email?.trim()) {
    throw new Error(
      "Email is required"
    );
  }

  if (!password?.trim()) {
    throw new Error(
      "Password is required"
    );
  }

  // =========================
  // CHECK USER EXISTS
  // =========================
  const userData =
    await pool.query(
      `
      SELECT *
      FROM users
      WHERE email = $1
      `,
      [email]
    );

  if (
    userData.rows.length === 0
  ) {
    throw new Error(
      "Invalid credentials"
    );
  }

  // =========================
  // USER
  // =========================
  const user =
    userData.rows[0];

  // =========================
  // COMPARE PASSWORD
  // =========================
  const isPasswordMatched =
    await bcrypt.compare(
      password,
      user.password
    );

  if (!isPasswordMatched) {
    throw new Error(
      "Invalid credentials"
    );
  }

  // =========================
  // JWT PAYLOAD
  // =========================
  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
  };

  // =========================
  // ACCESS TOKEN
  // =========================
  const accessToken =
    jwt.sign(
      jwtPayload,
      config.secret as string,
      {
        expiresIn: "1d",
      }
    );

  // =========================
  // REFRESH TOKEN
  // =========================
  const refreshToken =
    jwt.sign(
      jwtPayload,
      config.refresh_secret as string,
      {
        expiresIn: "10d",
      }
    );

  // =========================
  // RETURN RESPONSE
  // =========================
  return {

    token: accessToken,

    refreshToken,

    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at:
        user.created_at,
      updated_at:
        user.updated_at,
    },
  };
};


export const authService = {
  registerUserIntoDB,
  loginUserIntoDB,
};
