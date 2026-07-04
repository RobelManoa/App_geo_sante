import client from './client';

export interface PrestataireAccountInfo {
  id: string;
  email: string;
  nomEtablissement: string;
}

export interface LoginResponse {
  sessionToken: string;
  account: PrestataireAccountInfo;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await client.post<LoginResponse>('/prestataireAuth/login', { email, password });
  return response.data;
}
