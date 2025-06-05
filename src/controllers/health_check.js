import { json } from "express";
import { ApiResponse } from "../utils/apiResponse.js";
import { Asynchandler } from "../utils/Asynchandler.js";

const health_check = Asynchandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "OK", "Health Check passed"));
});

export { health_check };
