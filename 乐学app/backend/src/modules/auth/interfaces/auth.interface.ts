export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
    name: string;
    role: string;
    avatar: string;
  };
}
