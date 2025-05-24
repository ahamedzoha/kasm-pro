import { ApiErrorResponse } from "../interfaces";

/**
 * Convert camelCase object keys to snake_case
 */
export const camelToSnake = <T = any>(obj: any): T => {
  if (obj === null || obj === undefined || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(camelToSnake) as T;
  }

  const snakeObj: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = key.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`
      );
      snakeObj[snakeKey] = camelToSnake(obj[key]);
    }
  }
  return snakeObj as T;
};

/**
 * Convert snake_case object keys to camelCase
 */
export const snakeToCamel = <T = any>(obj: any): T => {
  if (obj === null || obj === undefined || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel) as T;
  }

  const camelObj: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      );
      camelObj[camelKey] = snakeToCamel(obj[key]);
    }
  }
  return camelObj as T;
};

/**
 * Default error response transformer for RTK Query
 */
export const defaultTransformErrorResponse = (
  baseQueryReturnValue: any,
  meta: any,
  arg: any
): ApiErrorResponse => {
  // If it's already in the correct format, return as is
  if (baseQueryReturnValue?.success === false) {
    return baseQueryReturnValue;
  }

  // Transform based on the error structure
  if (baseQueryReturnValue?.status) {
    return {
      success: false,
      error: {
        message: baseQueryReturnValue.data?.message || "An error occurred",
        code: baseQueryReturnValue.data?.code,
        details: baseQueryReturnValue.data,
      },
      statusCode: baseQueryReturnValue.status,
    };
  }

  // Fallback error format
  return {
    success: false,
    error: {
      message: "An unexpected error occurred",
      details: baseQueryReturnValue,
    },
    statusCode: 500,
  };
};
