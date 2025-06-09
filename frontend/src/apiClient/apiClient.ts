import { API_BASE_URL, API_LOGGING_ENABLED } from './config';
import { getAuthToken } from './authApi';

/**
 * Helper for logging API calls
 */
const logApiCall = (method: string, endpoint: string, data?: any, headers?: any) => {
  if (!API_LOGGING_ENABLED) return;
  
  console.group(`🚀 ${method} ${endpoint}`);
  console.log('URL:', `${API_BASE_URL}${endpoint}`);
  console.log('Headers:', headers);
  if (data) {
    console.log('Request Body:', data);
  }
  console.groupEnd();
};

/**
 * Helper for logging API responses
 */
const logApiResponse = (method: string, endpoint: string, response: Response, data: any) => {
  if (!API_LOGGING_ENABLED) return;
  
  const logStyle = response.ok ? '✅' : '❌';
  console.group(`${logStyle} ${method} ${endpoint} - ${response.status} ${response.statusText}`);
  console.log('Status:', response.status);
  console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
  console.log('Response Body:', data);
  console.groupEnd();
};

/**
 * Helper for error handling
 */
export const handleResponseError = async (response: Response, defaultMessage: string) => {
  const responseText = await response.text();
  let responseData;
  
  try {
    responseData = JSON.parse(responseText);
  } catch {
    responseData = { error: responseText || defaultMessage };
  }
  
  if (!response.ok) {
    throw new Error(responseData.error || defaultMessage);
  }
  
  return responseData;
};

/**
 * Common headers including authentication
 */
export const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * GET request with authentication
 */
export const apiGet = async (endpoint: string, defaultErrorMessage: string = 'Request failed') => {
  const headers = getAuthHeaders();
  logApiCall('GET', endpoint, null, headers);
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers,
  });
  
  const data = await handleResponseError(response, defaultErrorMessage);
  logApiResponse('GET', endpoint, response, data);
  
  return data;
};

/**
 * POST request with authentication
 */
export const apiPost = async (endpoint: string, data: any, defaultErrorMessage: string = 'Request failed') => {
  const headers = getAuthHeaders();
  logApiCall('POST', endpoint, data, headers);
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  
  const responseData = await handleResponseError(response, defaultErrorMessage);
  logApiResponse('POST', endpoint, response, responseData);
  
  return responseData;
};

/**
 * PUT request with authentication
 */
export const apiPut = async (endpoint: string, data: any, defaultErrorMessage: string = 'Request failed') => {
  const headers = getAuthHeaders();
  logApiCall('PUT', endpoint, data, headers);
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  
  const responseData = await handleResponseError(response, defaultErrorMessage);
  logApiResponse('PUT', endpoint, response, responseData);
  
  return responseData;
};

/**
 * DELETE request with authentication
 */
export const apiDelete = async (endpoint: string, defaultErrorMessage: string = 'Request failed') => {
  const headers = getAuthHeaders();
  logApiCall('DELETE', endpoint, null, headers);
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers,
  });
  
  const responseData = await handleResponseError(response, defaultErrorMessage);
  logApiResponse('DELETE', endpoint, response, responseData);
  
  return responseData;
}; 