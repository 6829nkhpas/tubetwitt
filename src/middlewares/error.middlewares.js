import mongoose from "mongoose";
import { Apierror } from "../utils/errorResponse.js";

export default function errorHandler(err, req, res, next) {
  let error = err;
  if (!(err instanceof Apierror)) {
    const statusCode =
      err.statusCode || error instanceof mongoose.Error.ValidationError
        ? 400
        : 500;
    const message = err.message || "Internal Server Error";
    error = new Apierror(
      statusCode,
      [message],
      error?.errors || [],
      err.stack,
      message
    );
  }
  const respone = {
    ...error,
    message: error.message,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  return res.status(error.statusCode || 500).json(respone);
}
