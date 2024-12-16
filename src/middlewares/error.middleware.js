import { JsonWebTokenError } from "jsonwebtoken";
import { errorResponse } from "../utils/apiResponse";
import { MongoServerError } from "mongodb";
import Joi from "joi";

// Bad Request error
class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = "BadRequestError";
    this.status = 400;
  }
}

// Unauthorized error
class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = "UnauthorizedError";
    this.status = 401;
  }
}

// Forbidden error
class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = "ForbiddenError";
    this.status = 403;
  }
}

// Not found error
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.status = 404;
  }
}

// Internal server error
class InternalServerError extends Error {
  constructor(message) {
    super(message);
    this.name = "InternalServerError";
    this.status = 500;
  }
}

export const errorHandler = (error, req, res, next) => {
  if (error instanceof JsonWebTokenError) {
    return errorResponse(res, 403, "Invalid token.");
  }

  // MongoDB specific error handling
  if (error instanceof MongoServerError) {
    // Duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return errorResponse(res, 400, `${field} already exists.`);
    }

    // No documents matched the query criteria
    if (error.code === 209) {
      return errorResponse(res, 404, "Record not found.");
    }

    // Invalid ObjectId
    if (error.code === 51024) {
      return errorResponse(res, 400, "Invalid ID format.");
    }
  }

  // Joi validation error
  if (error instanceof Joi.ValidationError) {
    const errorDetail = error.details.reduce((key, value) => {
      key[value.path.join(".")] = `${value.message}.`;
      return key;
    }, {});
    return errorResponse(res, 400, "Validation Error", errorDetail);
  }

  // Handle custom errors
  if (error.status) {
    return errorResponse(res, error.status, error.message);
  }

  // Handle unexpected errors
  console.error("Unexpected error:", error);
  return errorResponse(res, 500, "An unexpected error occurred.");
};

module.exports = {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  InternalServerError,
};
