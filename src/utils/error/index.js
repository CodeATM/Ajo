export class ApplicationError extends Error {
  constructor(code = 500, message = "Something went wrong", errors) {
    super(message);
    this.code = code;
    this.errors = errors;
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message = "Resource not found.") {
    super(404, message);
  }
}

export class ConflictError extends ApplicationError {
  constructor(message = "Conflict occurred.") {
    super(409, message);
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message = "You are not authorized to access this resource.") {
    super(401, message);
  }
}

export class BadRequestError extends ApplicationError {
  constructor(message = "Bad Request!") {
    super(400, message);
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message = "Access Denied!") {
    super(403, message);
  }
}
