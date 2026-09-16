// @ts-check
/**
 * constants/httpStatus.js
 * -----------------------
 * Named HTTP status codes for API assertions.
 * Prefer HTTP_STATUS.CREATED over bare 201 in specs.
 */
export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
});
