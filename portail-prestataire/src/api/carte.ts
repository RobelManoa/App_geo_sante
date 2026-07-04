import client from './client';

export interface CarteVerificationResult {
  resultat: 'valide' | 'expiree' | 'invalide' | 'introuvable';
  valide: boolean;
  raison?: string;
  nom?: string;
  prenom?: string;
  societe?: string;
  fonction?: string;
  numeroCarte?: string;
  photoUrl?: string | null;
}

export async function verifierCarte(token: string): Promise<CarteVerificationResult> {
  const response = await client.post<CarteVerificationResult>('/carte/verifier', { token });
  return response.data;
}
