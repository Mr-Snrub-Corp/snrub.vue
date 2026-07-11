/**
 * Custom error class for HTTP-related errors
 * Extends the standard Error class with HTTP-specific properties
 */
export class HttpError extends Error {
  status: number;
  statusText: string;
  data: unknown;

  constructor(message: string, status: number, statusText: string, data?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.statusText = statusText;
    this.data = data;

    // This is needed to make instanceof work correctly in TypeScript
    Object.setPrototypeOf(this, HttpError.prototype);
  }

  /**
   * Check if the error is a client error (4xx status code)
   */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if the error is a server error (5xx status code)
   */
  isServerError(): boolean {
    return this.status >= 500;
  }

  /**
   * Check if the error is an authentication error (401)
   */
  isAuthError(): boolean {
    return this.status === 401;
  }

  /**
   * Check if the error is a validation error (typically 422)
   */
  isValidationError(): boolean {
    return this.status === 422;
  }
}

// You can add other error types here as needed
// export class ValidationError extends Error {
//   errors: Record<string, string[]>;

//   constructor(message: string, errors: Record<string, string[]>) {
//     super(message);
//     this.name = "ValidationError";
//     this.errors = errors;

//     Object.setPrototypeOf(this, ValidationError.prototype);
//   }
// }
