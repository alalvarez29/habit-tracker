import { apiRequest } from '../../lib/apiClient';
import type { AuthUser, LoginInput, RegisterInput } from '../../types/auth';

export function fetchCurrentUser() {
  return apiRequest<AuthUser>('/auth/me');
}

export function registerRequest(input: RegisterInput) {
  return apiRequest<AuthUser>('/auth/register', { method: 'POST', body: input });
}

export function loginRequest(input: LoginInput) {
  return apiRequest<AuthUser>('/auth/login', { method: 'POST', body: input });
}

export function logoutRequest() {
  return apiRequest<{ success: boolean }>('/auth/logout', { method: 'POST' });
}
