import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (_, res) => {
  //TODO: build a healthcheck response that simply returns the OK status as json with a message
  res.status(200).json(200 , "ok");
});

export { healthcheck };
