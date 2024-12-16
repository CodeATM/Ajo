export const successResponse = (res, statusCode, message, error, data) => {
  if (statusCode < 200 || statusCode > 299) {
    throw new Error(`Invalid status code. Use a valid status code`);
  }

  message = message.endsWith(".") ? message : `${message}`;

  return res.status(statusCode).json({ message, data, error });
};

export const errorResponse = (res, statusCode, message, data, error = true) => {
  message = message.endsWith(".") ? message : `${message}`;
  return res.status(statusCode).json({ message, data, error });
};
