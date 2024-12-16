class SystemError extends Error {
  constructor(code, message = "Sorry, something went wrong!", errors) {
    super(message);
    this._code = code || 500;
    this._errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  get code() {
    return this._code;
  }

  get errors() {
    return this._errors;
  }
}

class ApplicationError extends SystemError {
  constructor(code, message, errors) {
    super(code, message, errors);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class NotFoundError extends SystemError {
  constructor(message) {
    super(404, message || "Resource not found.");
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class ConflictError extends SystemError {
  constructor(message) {
    super(409, message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class UnauthorizedError extends SystemError {
  constructor(message) {
    super(401, message || "You are not authorized to access this resource.");
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class BadRequestError extends SystemError {
  constructor(message) {
    super(400, message || "Bad Request!");
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class ForbiddenError extends SystemError {
  constructor(message) {
    super(403, message || "Access Denied!");
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
