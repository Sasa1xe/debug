import jwt from "jsonwebtoken";

export function checkAuth(req, res, next) {
  //Get Token
  const token = req.cookies.node_api_token;

  try {
    // Verify the token
    const user = jwt.verify("token", process.env.SECRET_JWT);

    //if OK ---> next()
    next();

    //if NOT ok ---> send (401) "unauthorized"
  } catch {
    return res.status(401).json({
      error: "invalid token",
    });
  }
}
