import Jwt from "jsonwebtoken";
import { errorResponse } from "../utils/response.js";
import { MongoServerError } from "mongodb";
import Joi from "joi";

// Base error class
class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = this.constructor.name;
  }
}

// Specific error classes
class BadRequestError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message) {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message) {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
  }
}

class InternalServerError extends AppError {
  constructor(message) {
    super(message, 500);
  }
}

// Error middleware
class errorMiddleware {
  static handle(error, req, res, next) {
    const JsonWebTokenError = Jwt.JsonWebTokenError;
    if (error instanceof JsonWebTokenError) {
      return errorResponse(res, 403, "Invalid token.");
    }

    // Handle MongoDB-specific errors
    if (error instanceof MongoServerError) {
      switch (error.code) {
        case 11000: {
          const field = Object.keys(error.keyPattern)[0];
          return errorResponse(res, 400, `${field} already exists.`);
        }
        case 121:
          return errorResponse(res, 400, "Document validation failed.");
        default:
          return errorResponse(res, 500, "Database error occurred.");
      }
    }

    // Handle Joi validation errors
    if (error instanceof Joi.ValidationError) {
      const errorDetails = error.details.reduce((acc, detail) => {
        acc[detail.path.join(".")] = detail.message;
        return acc;
      }, {});
      return errorResponse(res, 400, "Validation Error", errorDetails);
    }

    // Handle application-specific errors
    if (error instanceof AppError) {
      return errorResponse(res, error.status, error.message);
    }

    // Handle unexpected errors without crashing the app
    console.error("Unexpected error:", error);
    return errorResponse(res, 500, "An unexpected error occurred.");
  }
}

export {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  InternalServerError,
  errorMiddleware,
};
