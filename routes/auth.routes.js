import express from "express";
import bcrypt from "bcrypt";    
import { createDB } from "../db.js";
import { validateBody } from "../validation Middlewares/validateBody.js";
import { registerSchema } from "../schemas/auth/register.schema.js";

export const authRouter = express.Router();
const db = createDB();

//Register
authRouter.post("/register", validateBody(registerSchema), async (req, res) => {
  //validate -> DONE

  //Hash Password
  const hashedPass = await bcrypt.hash(req.body.password,10);

  //Check if the email is Unique
  const authAuthors = await db.getAll("auth_authors");
  const existingAuthor = authAuthors.find((u) => u.email === req.body.email);

  //if email exist -> Send (422) "email is already in use"
  if (existingAuthor) {
    res.status(422).json({
      error: "Author with the same Email already exist!",
    });
  }

  //if email doesn't exist -> Add Author to the DB
  await db.create("authAuthors", {
    email: req.body.email,
    userName: req.body.userName,
    password: hashedPass,
    is_verified: false,
  });
    
  res.status(201).json({
    message: "you've been Successfully Registered",
  });
});

// Login



