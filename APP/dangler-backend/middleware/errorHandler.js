export function errorHandler(err, req, res, next) {
  console.error("❌ Backend Error:", err);

  if (err.array) {
    // express-validator errors
    return res.status(400).json({
      errors: err.array().map(e => ({ field: e.param, message: e.msg })),
    });
  }

  if (err.code === "ER_DUP_ENTRY") {
    return res.status(400).json({ error: "Duplicate entry" });
  }

  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
}