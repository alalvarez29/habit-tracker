export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
}

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
