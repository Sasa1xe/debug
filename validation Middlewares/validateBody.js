import z from "zod";

export function validateBody(schema) {
  return (req, res, next) => {
    const body = req.body;

    const result = schema.safeParse(body);

    if (result.success) {
      next();
    } else {
      res.status(422).json({
        // error: result.error?.flatten().fieldErrors, //flattened so its more easy to read
        error: z.treeifyError(result.error).properties,
      });
    }
  };
}

// import z from "zod";

// export function validateBody(schema) {
//   return (req, res, next) => {
//     const body = req.body;
//     const result = schema.safeParse(body);

//     if (result.success) {
//       next();
//     } else {
//       return res.status(422).json({
//         
//         // errors: z.treeifyError(result.error).properties,   good too
//       });
//     }
//   };
// }
