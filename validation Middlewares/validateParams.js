export function validateParams(schema) {
  return function (req, res, next) {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        message: "invalid params",
        issues: result.error.issues,
      });
    }

    req.params = result.data;
    next();
  };
}
