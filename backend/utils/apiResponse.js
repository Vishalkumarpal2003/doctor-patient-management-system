/**
 * Standardized API Response Utilities
 * Guarantees uniform payload structure across all endpoints
 */

const sendResponse = (res, statusCode = 200, { success = true, message, data, count, pagination, meta }) => {
  const payload = { success };

  if (message) payload.message = message;
  if (count !== undefined) payload.count = count;
  if (data !== undefined) payload.data = data;
  if (pagination) payload.pagination = pagination;
  if (meta) payload.meta = meta;

  return res.status(statusCode).json(payload);
};

const sendError = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const payload = {
    success: false,
    message,
  };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
};

module.exports = {
  sendResponse,
  sendError,
};
