
// export const validateRequest = (schema, property = "body") => {
//     return (req, res, next) => {
//         const result = schema.safeParse(req[property]);
//         if (!result.success) {
//             return res.status(400).json({
//                 message:"Validation error",
//                 details: result.error.flatten(),
//             });
//         }
//         req[property] = result.data;
//         return next();
//     }
// } 

export const validateRequest =(schema, property = "body") => {
    return (req, res, next) => {

    const result = schema.safeParse(req[property]);
    if (!result.success) {
      return res
        .status(400)
        .json({
          message: "Validation error",
          details: result.error.flatten(),
        });
    }

    req.validated = {
      ...(req.validated || {}),
      [property]: result.data,
    };

    return next();
  };
};
// TODO: Create middleware factory to run validation and return 400 on errors.
// TODO: Normalize validation error format for client usage.
