export function notFound(req, res) {
  res.status(404).json({ error: "Route not found" });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = Number(err.status) || 500;
  const message = status >= 500 && process.env.NODE_ENV === "production"
    ? "Internal server error"
    : (err.message || "Server error");
  res.status(status).json({ error: message });
}
