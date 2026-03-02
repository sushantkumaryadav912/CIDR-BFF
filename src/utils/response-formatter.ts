/**
 * Standard success response format
 */
export const formatSuccessResponse = <T>(data: T, meta?: any) => {
  return {
    data,
    ...(meta ? { meta } : {}),
  };
};

/**
 * Standard error response format
 */
export const formatErrorResponse = (code: string, message: string, details: any[] = []) => {
  return {
    error: {
      code,
      message,
      details,
    },
  };
};
