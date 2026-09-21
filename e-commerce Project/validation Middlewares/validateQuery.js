export function validateQuery(schema) {
  return function (req, res, next) {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        message: "invalid query params",
        issues: result.error.issues,
      });
    }

    req.query = result.data;
    next();
  };
}