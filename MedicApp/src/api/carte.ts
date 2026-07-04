import axios from 'axios';
import mapConfig from '../config/mapConfig';
import * as secureStorage from '../utils/secureStorage';

export const SESSION_TOKEN_KEY = 'sessionToken';

export interface CarteToken {
  token: string;
  expiresAt: string;
}

export async function fetchCarteToken(): Promise<CarteToken> {
  const sessionToken = await secureStorage.getItem(SESSION_TOKEN_KEY);
  if (!sessionToken) {
    throw new Error('Session expirée, veuillez vous reconnecter.');
  }

  const response = await axios.get<CarteToken>(`${mapConfig.API_BASE_URL}/carte/token`, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });

  return response.data;
}
