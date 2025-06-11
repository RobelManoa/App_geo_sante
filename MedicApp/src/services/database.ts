// src/database/db.ts
import { openDatabase, SQLiteDatabase } from 'expo-sqlite';

// Ouverture de la base de données
const db: SQLiteDatabase = openDatabase('medicapp.db');

// Interface pour typer les prestataires
export interface Prestataire {
  id: string;
  nom: string;
  specialite: string;
  localisation: string;
}

/**
 * Crée les tables de la base de données
 * @returns Promise<void>
 */
export const createTables = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS prestataires (
            id TEXT PRIMARY KEY NOT NULL,
            nom TEXT NOT NULL,
            specialite TEXT NOT NULL,
            localisation TEXT NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );`,
          [],
          () => resolve(),
          (_, error) => {
            reject(new Error(`Erreur création table: ${error.message}`));
            return false;
          }
        );
      },
      (error) => reject(error)
    );
  });
};

/**
 * Insère ou met à jour un prestataire
 * @param prestataire Prestataire à insérer
 * @returns Promise<void>
 */
export const upsertPrestataire = (
  prestataire: Prestataire
): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT OR REPLACE INTO prestataires 
          (id, nom, specialite, localisation) 
          VALUES (?, ?, ?, ?);`,
          [
            prestataire.id,
            prestataire.nom,
            prestataire.specialite,
            prestataire.localisation,
          ],
          () => resolve(),
          (_, error) => {
            reject(new Error(`Erreur insertion: ${error.message}`));
            return false;
          }
        );
      },
      (error) => reject(error)
    );
  });
};

/**
 * Récupère tous les prestataires
 * @returns Promise<Prestataire[]>
 */
export const getPrestataires = (): Promise<Prestataire[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM prestataires ORDER BY nom ASC;',
          [],
          (_, { rows }) => resolve(rows._array),
          (_, error) => {
            reject(new Error(`Erreur lecture: ${error.message}`));
            return false;
          }
        );
      },
      (error) => reject(error)
    );
  });
};

/**
 * Supprime un prestataire par son ID
 * @param id string
 * @returns Promise<void>
 */
export const deletePrestataire = (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'DELETE FROM prestataires WHERE id = ?;',
          [id],
          () => resolve(),
          (_, error) => {
            reject(new Error(`Erreur suppression: ${error.message}`));
            return false;
          }
        );
      },
      (error) => reject(error)
    );
  });
};

// Fonction utilitaire pour initialiser la DB
export const initDatabase = async (): Promise<void> => {
  try {
    await createTables();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};