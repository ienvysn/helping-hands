const { z } = require("zod");

const validate = (schema) => (req, res, next) => {
  try {

    // Verify that req.body is what we expect
    console.log("Validating request body:", req.body);
    const parsedData = schema.parse(req.body);
    req.body = parsedData; // Update req.body with coerced values
    next();
  } catch (error) {
    console.error("Validation error:", error);
    if (error instanceof z.ZodError) {

      const formattedErrors = error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formattedErrors,
      });
    }
    // Fallback for non-Zod errors
    res.status(500).json({
      success: false,
      message: "Internal server error during validation",
    });
  }
};

module.exports = validate;
