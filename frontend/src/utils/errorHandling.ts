/**
 * Extracts a user-friendly error message from an API error response
 * @param error - The error object from axios or other API calls
 * @param defaultMessage - Default message to show if no specific error is found
 * @returns A user-friendly error message string
 */
export function getErrorMessage(error: any, defaultMessage: string = 'An error occurred'): string {
  // Check if it's an axios error with response
  if (error?.response?.data) {
    const data = error.response.data
    
    // Check for various common error message fields
    if (data.message) return data.message
    if (data.error) return data.error
    if (data.msg) return data.msg
    if (data.detail) return data.detail
    
    // If it's a string response
    if (typeof data === 'string') return data
  }
  
  // Check for network errors
  if (error?.code === 'NETWORK_ERROR' || error?.message === 'Network Error') {
    return 'Network error. Please check your connection and try again.'
  }
  
  // Check for timeout errors
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return 'Request timed out. Please try again.'
  }
  
  // Check for direct error message
  if (error?.message) return error.message
  
  // Fallback to default message
  return defaultMessage
}

/**
 * Creates a standardized error handler for React Query mutations
 * @param setError - State setter function for error state
 * @param defaultMessage - Default error message
 * @returns Error handler function
 */
export function createErrorHandler(
  setError: (error: string | null) => void, 
  defaultMessage: string = 'Operation failed'
) {
  return (error: any) => {
    const message = getErrorMessage(error, defaultMessage)
    setError(message)
  }
}