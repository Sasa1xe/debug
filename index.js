import express from "express";

import { AuthorsRouter } from "./routes/authors.routes.js";
import { authRouter } from "./routes/auth.routes.js";

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  console.log(new Date().toLocaleString(), req.method, req.url);
  next();
});

//------------Routes---------------
app.use("/auth",authRouter)
app.use("/authors", AuthorsRouter);
//---------------------------------

//------------Error Handler-----------
app.use((err, req, res, next) => {
  console.error(err.err);
  res.status(500).json({ error: "something went wrong" });
});
//------------------------------------

app.listen(3000, () => {
  console.log("listening on port 3000");
});