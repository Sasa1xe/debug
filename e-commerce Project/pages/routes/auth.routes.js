import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createDB } from "../db.js";
import { validateBody } from "../validation Middlewares/validateBody.js";
import { registerSchema } from "../schemas/auth/register.schema.js";
import { loginSchema } from "../schemas/auth/login.schema.js";

process.loadEnvFile(".env");

export const authRouter = express.Router();
const db = createDB();

/*
--------------------Register--------------------
 1- validate -> DONE
 2- Hash Password (via bcrypt)
 Check if the email is Unique
    ---> 3- if email exist -> Send (422) "email is already in use"
    ---> 4- if email doesn't exist -> Add Author to the DB  
 5- send Response of completion
 ------------------------------------------------
*/
authRouter.post("/register", validateBody(registerSchema), async (req, res) => {
  // 1- DONE by validateBody middleware

  // ### 2 ###
  const hashedPass = await bcrypt.hash(req.body.password, 10);

  const authUsers = await db.getAll("authUsers");

  //-------------Checking------------
  const existingAuthor = authUsers.find((u) => u.email === req.body.email);
  // ### 3 ###
  if (existingAuthor) {
    res.status(422).json({
      error: "Author with the same Email already exist!",
    });
  } else {
    // ### 4 ###
    await db.create("authUsers", {
      email: req.body.email,
      userName: req.body.userName,
      password: hashedPass,
      is_verified: false,
    });
  }
  //---------------------------------

  // ### 5 ###
  res.status(201).json({
    message: "you've been Successfully Registered",
  });
});

/*
--------------------Login--------------------
1- Validate requset's Body
2- get user by email
3- find that email in the DB
4- if not found ---> (422) "email or password is invalid"
5- if found ---> compare Passwords (HASHED body Password vs existing HASHED Password in DB)
6- if not matched ---> (422) "email or password is invalid"
7- if matched ---> make and send token as a cookie
8- send response of completion
---------------------------------------------
*/
authRouter.post("/login", validateBody(loginSchema), async (req, res) => {
  // Validate ✅

  //checking on email and pass
  const authUsers = await db.getAll("authUsers");
  const existingAuthor = authUsers.find((u) => u.email === req.body.email);
  if (!existingAuthor) {
    return res.status(422).json({ error: "email or password is invalid" });
  }
  const isValid = await bcrypt.compare(
    req.body.password,
    existingAuthor.hashedPass,
  );
  if (!isValid) {
    return res.status(422).json({
      error: "email or password is invalid",
    });
  }

  //token
  const token = jwt.sign(existingAuthor, process.env.JWT_SECRET);

  //response
  res.cookie("node_api_token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 1000,
  });

  return res.status(200).json({
    message: "login successfull",
    data: token,
  });
});

/*
--------------Logout---------------
1- clear cookie
2- send response
-----------------------------------
*/
authRouter.post("/logout", (req, res) => {
  res.clearCookie("node_api_token");
  return res.status(200).json({
    message: "logout successfull",
  });
});
