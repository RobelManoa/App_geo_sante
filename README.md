# MedicApp — V1

Application de géolocalisation santé pour Madagascar : elle permet à un utilisateur de trouver des prestataires de soins (pharmacies, médecins, hôpitaux, cliniques, dentistes...) autour de lui, d'obtenir des conseils via un assistant conversationnel, et donne à une équipe interne un back-office pour administrer les prestataires et les utilisateurs.

Ce document décrit l'état réel du projet à la version **V1** : architecture, fonctionnalités effectivement implémentées, comment le lancer en local, et les limites connues à traiter avant un déploiement en production.

## Sommaire

- [Vue d'ensemble](#vue-densemble)
- [État du projet](#état-du-projet)
- [Architecture](#architecture)
- [Stack technique](#stack-technique)
- [Fonctionnalités](#fonctionnalités)
  - [Application cliente (MedicApp)](#application-cliente-medicapp)
  - [Interface d'administration (admin-medicapp)](#interface-dadministration-admin-medicapp)
  - [API backend (api-medicapp)](#api-backend-api-medicapp)
- [Modèles de données](#modèles-de-données)
- [Démarrage rapide (local, Docker)](#démarrage-rapide-local-docker)
- [Démarrage sans Docker (dev par service)](#démarrage-sans-docker-dev-par-service)
- [Variables d'environnement](#variables-denvironnement)
- [Intégration continue](#intégration-continue)
- [Limitations connues / dette technique](#limitations-connues--dette-technique)
- [Pistes pour la V2](#pistes-pour-la-v2)

## Vue d'ensemble

Le projet est composé de 4 applications qui partagent une seule base de données MongoDB :

| Application | Rôle | Public |
|---|---|---|
| `MedicApp` | App mobile/web pour les usagers (React Native + Expo) | Grand public |
| `admin-medicapp` | Back-office web (React) | Équipe interne / administrateurs |
| `portail-prestataire` | Portail web de vérification de carte d'assuré (React) | Personnel des prestataires du réseau |
| `api-medicapp` | API REST (Node.js/Express) consommée par les 3 apps ci-dessus | — |

## État du projet

- **Statut : conception / développement, non déployé en production.** Tout tourne en local via Docker Compose sur la machine de développement.
- Les 3 principaux bugs bloquants identifiés lors des premiers tests ont été corrigés (voir [Historique des corrections](#limitations-connues--dette-technique) plus bas pour le détail) :
  1. Le login client pointait vers une ancienne URL Railway désaffectée → corrigé pour utiliser l'API locale configurée.
  2. La carte ne s'affichait pas sur le web (`react-native-webview` ne supporte pas la plateforme web) → un composant `CrossPlatformWebView` bascule automatiquement vers un rendu `<iframe>` sur le web.
  3. Le chatbot n'utilisait jamais le moteur plus riche du backend (regex + fallback OpenAI) → il est maintenant utilisé pour les questions hors urgence/recherche de prestataire.
- Le déploiement (Vercel, Railway, VPS...) a été discuté mais n'est pas encore mis en place — voir la conversation précédente pour les options envisagées. Rien de ce README ne présuppose une plateforme de déploiement choisie.
- **Carte d'assuré numérique : les 4 phases prévues sont maintenant implémentées et testées** (client cible : BSA Madagascar / ASK Gras Savoye, courtier en assurances) :
  1. **Backend** — jeton de session, jeton de carte à courte durée de vie (60s), vérification côté prestataire, journal d'audit (`CarteValidation`). Testé au curl.
  2. **App cliente** — écran `CarteScreen` (QR code) verrouillé par un code PIN local (`PinGate`, hashé avec salage via `expo-crypto`, stockage sécurisé natif/web).
  3. **Portail de vérification prestataire** (`portail-prestataire`) — appli web dédiée (login, scan QR caméra via `@zxing/browser`, écran de résultat) consommée par le personnel des prestataires du réseau. Typecheck + build Docker + smoke test validés.
  4. **Administration** — écrans `admin-medicapp` pour créer/modifier/désactiver les comptes du portail prestataire (CRUD complet), et widget "Dernières vérifications de carte" sur le tableau de bord.

## Architecture

```
                        ┌──────────────────────┐
                        │   MongoDB (mongo:7)   │
                        │  volume: mongo_data    │
                        └───────────▲────────────┘
                                    │
                        ┌───────────┴────────────┐
                        │   api-medicapp (5000)   │
                        │  Express + Mongoose     │
                        │  + OpenAI (fallback)    │
                        └──▲──────────▲─────────▲─┘
                           │          │         │
        ┌──────────────────┘   ┌──────┘         └──────────────────┐
┌───────┴────────────────┐ ┌───┴─────────────────────┐ ┌────────────┴──────────────────┐
│ admin-medicapp (3000)   │ │ portail-prestataire     │ │  MedicApp / mobile-web (3001) │
│ React + nginx           │ │ (3002), React + nginx   │ │  Expo (React Native + web)    │
│ Back-office interne     │ │ Vérification de carte   │ │  App usagers                  │
└─────────────────────────┘ └──────────────────────────┘ └────────────────────────────────┘
```

5 services Docker (`docker-compose.yml`) : `mongo`, `api`, `admin`, `mobile-web`, `portail`. `MedicApp` peut aussi tourner en natif (iOS/Android) via Expo, hors Docker, en pointant sur la même API.

## Stack technique

| Service | Techno principale | Détails |
|---|---|---|
| `api-medicapp` | Node.js 20, Express 5, Mongoose 8 | Auth simple (nom + identifiant) + jeton de session JWT, upload d'images (Multer), détection d'intention par regex + fallback OpenAI (`gpt-3.5-turbo`), validation Joi, `bcryptjs` pour les comptes prestataires |
| `admin-medicapp` | React 19, TypeScript, react-router-dom, Bootstrap 5, Leaflet/react-leaflet | Build statique servi par nginx |
| `portail-prestataire` | React 19, TypeScript, react-router-dom, `@zxing/browser` (scan QR caméra) | Build statique servi par nginx, `create-react-app` |
| `MedicApp` | Expo ~54, React Native 0.81, TypeScript, React Navigation (bottom-tabs) | Cible mobile (iOS/Android) **et** web (`expo export --platform web` + nginx) |
| Base de données | MongoDB 7 | Conteneur Docker local avec volume persistant (`mongo_data`) |
| Cartographie | Leaflet + tuiles OpenStreetMap | Chargées via CDN (`unpkg.com`) dans une WebView/iframe HTML, nécessite un accès internet même en usage local |

## Fonctionnalités

### Application cliente (MedicApp)

Navigation par onglets en bas d'écran (5 onglets + deux écrans cachés de la barre) :

- **Accueil** — présentation de l'app, accès rapide à Recherche / Carte / Chat, lien vers le développeur (ITConceptor).
- **Recherche** — recherche textuelle de prestataires (nom, prestations) avec filtre par ville (liste de villes malgaches en dur), cartes de résultats animées, navigation vers la fiche détail.
- **Carte** — carte interactive (Leaflet/OpenStreetMap) affichant tous les prestataires avec géolocalisation ; marqueur cliquable → panneau de détail avec actions Appeler / Itinéraire (ouvre Google Maps) / Voir la fiche complète. Fonctionne maintenant en natif **et** en web.
- **Chat** — assistant conversationnel :
  - Urgences et recherche de prestataire : gérées **localement** dans l'app (numéros d'urgence Madagascar 124 SAMU / 118 pompiers, cartes prestataire avec actions rapides, tri par distance si la géolocalisation est autorisée).
  - Tout le reste (symptômes, conseils, conversation libre) : délégué à l'API `/api/chat`, qui fait une détection d'intention plus fine côté serveur et retombe sur OpenAI (`gpt-3.5-turbo`) pour les questions non reconnues. En cas d'erreur réseau, l'app retombe sur ses réponses locales génériques.
- **Profil** — connexion (nom + identifiant), affichage des informations utilisateur (société, fonction, dates...), changement de photo de profil (galerie/caméra — **stockée uniquement en local sur l'appareil**, pas envoyée au serveur), préférences (langue FR/MG, notifications — non persistées côté serveur), déconnexion.
- **Fiche prestataire** (écran accessible depuis Recherche/Carte, hors barre d'onglets) — détail complet d'un prestataire : mini-carte, galerie photo, infos (catégorie, prestations, ville, adresse, téléphone), actions Appeler / Itinéraire.
- **Carte d'assuré** (`CarteScreen`, écran caché de la barre) — QR code affiché à l'écran, généré à partir du jeton de carte à courte durée de vie (`GET /api/carte/token`, renouvelé automatiquement avant expiration). Protégé par un verrou PIN local (`PinGate`, code à 6 chiffres hashé + salé via `expo-crypto`, stocké en stockage sécurisé natif/web, verrouillage temporaire après 5 tentatives échouées) — ce verrou protège uniquement l'accès occasionnel via l'appareil déverrouillé de quelqu'un d'autre, ce n'est pas une authentification serveur.

### Portail de vérification prestataire (portail-prestataire)

Application web dédiée au personnel des prestataires du réseau (pharmacies, cliniques...), séparée du back-office admin :

- **Connexion** (`/login`) — email + mot de passe, via `POST /api/prestataireAuth/login`. Session stockée en `localStorage`, protège les autres écrans (`PrivateRoute`).
- **Scanner** (`/scan`) — accès à la caméra du navigateur, décodage de QR code en direct (`@zxing/browser`), envoi du jeton scanné à `POST /api/carte/verifier`.
- **Résultat** (`/result`) — affiche le statut de couverture (valide / expirée / invalide / introuvable) et les informations de l'assuré (nom, prénom, société, fonction, numéro de carte) si le jeton est valide, avec possibilité de relancer un scan.

### Interface d'administration (admin-medicapp)

Back-office React accessible sur `/` (pas d'authentification actuellement) :

- **Dashboard** (`/`, `/admin`) — statistiques : nombre total de prestataires/utilisateurs, villes couvertes, répartition par ville/catégorie, derniers ajouts, mini-carte de synthèse, et widget **"Dernières vérifications de carte"** (5 dernières entrées du journal d'audit `/api/carte/validations`, avec badge de statut coloré et établissement vérificateur).
- **Prestataires** (`/admin/prestataires`) — liste, recherche, suppression.
- **Ajouter un prestataire** (`/admin/ajouter`) — formulaire complet (nom, catégorie, ville, adresse, téléphone, prestations, coordonnées GPS, jusqu'à 5 photos).
- **Modifier un prestataire** (`/admin/edit/:id`).
- **Utilisateurs** (`/admin/users`) — liste des comptes internes (société, fonction, dates...).
- **Ajouter un utilisateur** (`/admin/users/new`).
- **Comptes du portail prestataire** (`/admin/prestataire-accounts`) — CRUD complet des comptes utilisés pour se connecter au portail de vérification de carte : liste (avec prestataire lié et statut actif/inactif basculable en un clic), création (`/admin/prestataire-accounts/new`), modification (`/admin/prestataire-accounts/edit/:id`, avec changement de mot de passe optionnel), suppression. Remplace le script `scripts/createPrestataireAccount.js` pour l'usage courant (le script reste utile pour un premier compte de bootstrap).

### API backend (api-medicapp)

Base : `http://localhost:5000` (en local). Toutes les routes métier sont sous `/api`.

| Méthode | Route | Description |
|---|---|---|
| GET | `/health`, `/api/health` | Health check |
| GET | `/api/prestataires` | Liste tous les prestataires |
| GET | `/api/prestataires/:id` | Détail d'un prestataire |
| POST | `/api/prestataires` | Créer un prestataire (multipart, jusqu'à 5 photos) |
| PUT | `/api/prestataires/:id` | Modifier un prestataire (+ photos optionnelles) |
| DELETE | `/api/prestataires/:id` | Supprimer un prestataire |
| GET | `/api/utilisateurs` | Liste tous les utilisateurs |
| GET | `/api/utilisateurs/:id` | Détail d'un utilisateur |
| POST | `/api/utilisateurs` | Créer un utilisateur |
| PUT | `/api/utilisateurs/:id` | Modifier un utilisateur |
| DELETE | `/api/utilisateurs/:id` | Supprimer un utilisateur |
| POST | `/api/utilisateurs/login` | "Connexion" par `{ nom, identifiant }` (pas de mot de passe) → renvoie `{ user, sessionToken }`. Limité en débit (10 tentatives / 15 min / IP). |
| GET | `/api/carte/token` | 🔒 Assuré — émet un jeton de carte signé, valable 60s, à encoder en QR |
| POST | `/api/carte/verifier` | 🔒 Prestataire — vérifie un jeton scanné, renvoie le statut de couverture + infos d'affichage, journalise la vérification. Limité en débit (30 / min / IP). |
| GET | `/api/carte/validations` | Liste les dernières entrées du journal d'audit des vérifications de carte (`?limit=`, 20 par défaut, 200 max), triées par date décroissante, avec assuré et compte prestataire peuplés. Utilisée par le widget "Dernières vérifications" du dashboard admin. |
| POST | `/api/prestataireAuth/login` | Connexion d'un compte du portail prestataire par `{ email, password }` → `{ sessionToken, account }`. |
| GET | `/api/prestataireAccounts` | Liste tous les comptes du portail prestataire (sans `passwordHash`, prestataire lié peuplé) |
| GET | `/api/prestataireAccounts/:id` | Détail d'un compte prestataire |
| POST | `/api/prestataireAccounts` | Créer un compte prestataire `{ email, password, nomEtablissement, prestataireId? }` |
| PUT | `/api/prestataireAccounts/:id` | Modifier un compte (email, mot de passe optionnel, établissement, prestataire lié, actif) |
| DELETE | `/api/prestataireAccounts/:id` | Supprimer un compte prestataire |
| POST | `/api/chat` | Assistant conversationnel : `{ message, userLocation?, sessionId? }` → détection d'intention (urgence, grossesse, symptôme, prestataire, conseil, conversation, orientation, ou fallback OpenAI). Historique de conversation gardé en mémoire process (Map), expiré après 1h. |
| GET | `/uploads/:fichier` | Sert les photos uploadées (stockage disque local) |

🔒 = route protégée par `Authorization: Bearer <sessionToken>` ([middlewares/auth.js](api-medicapp/middlewares/auth.js)). `GET /api/utilisateurs/:id` est également protégée (un assuré ne peut lire que son propre profil).

## Modèles de données

**Prestataire** (`models/prestataireModel.js`)

| Champ | Type | Requis |
|---|---|---|
| `nom` | String | oui |
| `categorie` | String (indexé) | oui |
| `ville` | String (indexé) | oui |
| `adresse` | String | non |
| `telephone` | String | non |
| `prestations` | String | non |
| `localisation.latitude` / `.longitude` | Number | non |
| `photos` | String[] (noms de fichiers) | non |

**User / Utilisateur** (`models/User.js`)

| Champ | Type | Requis |
|---|---|---|
| `societe` | String | oui |
| `identifiant` | String (unique) | oui |
| `nom` / `prenom` | String | oui |
| `dateNaissance` / `dateArrivee` | Date | oui |
| `fonction` / `niveauFonction` | String | oui |
| `numeroCarte` | String | non |
| `carteValideJusquau` | Date | non |

**PrestataireAccount** (`models/PrestataireAccount.js`) — compte du personnel d'un prestataire, utilisé pour se connecter au portail de vérification de carte (à ne pas confondre avec `Prestataire`, la fiche annuaire).

| Champ | Type | Requis |
|---|---|---|
| `email` | String (unique) | oui |
| `passwordHash` | String (bcrypt) | oui |
| `nomEtablissement` | String | oui |
| `prestataireId` | ObjectId (ref `Prestataire`) | non |
| `actif` | Boolean (défaut `true`) | — |

**CarteValidation** (`models/CarteValidation.js`) — journal d'audit de chaque vérification de carte (base des futures alertes anti-fraude).

| Champ | Type | Requis |
|---|---|---|
| `userId` | ObjectId (ref `User`) | non (absent si jeton invalide/introuvable) |
| `prestataireAccountId` | ObjectId (ref `PrestataireAccount`) | oui |
| `resultat` | String (`valide` / `expiree` / `invalide` / `introuvable`) | oui |

## Démarrage rapide (local, Docker)

Prérequis : Docker + Docker Compose.

```bash
# 1. Créer le fichier .env à la racine (lu par docker-compose pour OPENAI_API_KEY)
cp .env.example .env
# puis renseigner OPENAI_API_KEY (nécessaire uniquement pour les réponses IA
# du chat sur les questions libres — le reste de l'app fonctionne sans)

# 2. Lancer toute la stack
docker compose up -d --build

# 3. Accéder aux applications
# API             : http://localhost:5000
# Admin           : http://localhost:3000
# App client      : http://localhost:3001
# Portail prestataire : http://localhost:3002
```

Après une modification du code de `MedicApp`, `admin-medicapp` ou `portail-prestataire`, il faut reconstruire l'image concernée pour voir le changement (le build web est fait à l'intérieur de l'image Docker, il n'y a pas de hot-reload en mode Docker) :

```bash
docker compose build mobile-web && docker compose up -d mobile-web
docker compose build admin && docker compose up -d admin
docker compose build portail && docker compose up -d portail
```

## Démarrage sans Docker (dev par service)

Utile pour avoir le hot-reload pendant le développement.

```bash
# API
cd api-medicapp
cp .env.example .env   # renseigner MONGO_URI (une instance Mongo locale ou Atlas) et OPENAI_API_KEY
npm install
npm start               # http://localhost:5000

# Admin
cd admin-medicapp
npm install
npm start                # http://localhost:3000, hot-reload

# Portail prestataire
cd portail-prestataire
npm install --legacy-peer-deps
npm start                # http://localhost:3002 (par défaut CRA, ex: PORT=3002 npm start), hot-reload
# Créer un compte de test au préalable (voir la note plus bas sur createPrestataireAccount.js,
# ou utiliser l'écran "Comptes portail" du back-office admin)

# App cliente (web)
cd MedicApp
npm install
npm run web               # ou `npx expo start` pour tester sur mobile via Expo Go
```

## Variables d'environnement

| Variable | Utilisée par | Défaut local | Rôle |
|---|---|---|---|
| `MONGO_URI` | api | `mongodb://mongo:27017/medicapp` (fixé dans `docker-compose.yml`) | Connexion MongoDB |
| `PORT` | api | `5000` | Port d'écoute de l'API |
| `OPENAI_API_KEY` | api | vide | Clé API OpenAI, utilisée uniquement par le fallback du chat pour les questions non reconnues par les regex |
| `SESSION_TOKEN_SECRET` | api | **requis, pas de défaut** | Signe les jetons de session (login assuré et prestataire). L'API refuse de démarrer si absent. |
| `CARD_TOKEN_SECRET` | api | **requis, pas de défaut** | Signe les jetons de carte à courte durée de vie (QR). Séparé de `SESSION_TOKEN_SECRET` pour pouvoir le faire tourner indépendamment. |
| `REACT_APP_API_BASE_URL` | admin, portail | `http://localhost:5000/api` | Base URL API (chaque app définit sa propre valeur au build) |
| `REACT_APP_UPLOADS_BASE_URL` | admin | `http://localhost:5000` | Base URL pour afficher les photos uploadées |
| `EXPO_PUBLIC_API_URL` | MedicApp | `http://localhost:5000/api` | Base URL API (login, chat...) |
| `EXPO_PUBLIC_PRESTATAIRES_API_URL` | MedicApp | `http://localhost:5000/api/prestataires` | Base URL dédiée à la liste des prestataires (carte, recherche, chat) |
| `EXPO_PUBLIC_UPLOADS_URL` | MedicApp | `http://localhost:5000` | Base URL pour afficher les photos uploadées |

> Ces variables `EXPO_PUBLIC_*` / `REACT_APP_*` sont injectées **au moment du build** (`ARG` dans les `Dockerfile`), pas au runtime : changer leur valeur nécessite de reconstruire l'image correspondante.

> `SESSION_TOKEN_SECRET` et `CARD_TOKEN_SECRET` se génèrent avec `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Un compte de test pour le portail prestataire se crée soit via l'écran admin **Comptes portail** (`/admin/prestataire-accounts/new`), soit en ligne de commande avec `docker compose exec api node scripts/createPrestataireAccount.js <email> <mot-de-passe> <nom-établissement>` (utile pour un tout premier compte avant même que l'admin ne soit démarré).

## Intégration continue

`.github/workflows/ci.yml` s'exécute sur chaque push/PR vers `master`/`main` :
- build Docker de chacun des 4 services (`api-medicapp`, `admin-medicapp`, `MedicApp`, `portail-prestataire`, sans push),
- validation du `docker-compose.yml`,
- `admin-medicapp` : `tsc --noEmit` + tests (`npm test`),
- `portail-prestataire` : `npm ci --legacy-peer-deps` + `tsc --noEmit`,
- `MedicApp` : `tsc --noEmit`,
- `api-medicapp` : `npm ci` + vérification syntaxique (`node --check server.js`).

Il n'y a pas de tests automatisés fonctionnels (pas de tests d'intégration API, pas de tests E2E sur les apps) au-delà de ce que couvre `admin-medicapp` (`react-scripts test`, peu de cas couverts).

## Limitations connues / dette technique

À garder en tête avant tout déploiement en production :

- **Identifiants de connexion toujours très basiques** : le login ne vérifie que `nom` + `identifiant` en clair, sans mot de passe — n'importe qui connaissant ces deux informations peut se connecter à la place d'un assuré (choix assumé pour l'instant, voir le plan de la carte d'assuré numérique). Ce qui a changé : le login renvoie désormais un `sessionToken` JWT, et les routes qui exposent des données personnelles (`GET /api/utilisateurs/:id`, `GET /api/carte/token`) exigent ce jeton — un ID Mongo deviné ne suffit plus à lire le profil de quelqu'un d'autre. Restent non protégées : `PUT`/`DELETE /api/utilisateurs/:id`, toutes les routes `/api/prestataires`, `/api/prestataireAccounts` (CRUD complet, y compris la création de comptes portail) et `/api/carte/validations`, ainsi que l'intégralité du back-office admin (`admin-medicapp` est accessible à quiconque a l'URL).
- **`helmet` est dans les dépendances mais n'est toujours pas branché** dans `server.js`. `express-rate-limit` est désormais utilisé sur `/api/utilisateurs/login`, `/api/prestataireAuth/login` et `/api/carte/verifier` — mais pas encore sur les autres routes d'écriture (dont `/api/prestataireAccounts`).
- **Clé OpenAI à vérifier** : la clé actuellement dans `api-medicapp/.env` est rejetée par OpenAI (`invalid_api_key`). Le chat fonctionne quand même pour les intentions reconnues par regex (urgence, prestataire, symptôme, conseil, conversation), mais les questions libres retombent sur un message générique tant qu'une clé valide n'est pas fournie.
- **Photos de profil utilisateur non persistées côté serveur** : dans `ProfileScreen`, la photo choisie est stockée uniquement dans `AsyncStorage` sur l'appareil (`uploadProfilePhoto` simule un upload avec un `setTimeout`) — elle n'est pas envoyée à l'API et sera perdue si l'utilisateur change d'appareil ou vide le cache.
- **Photos des prestataires stockées sur disque local** (`api-medicapp/uploads/`, volume Docker `api_uploads`) : pas de CDN/stockage objet (S3, Cloudinary...), ce qui deviendra un problème dès qu'il faudra scaler l'API horizontalement ou la déployer sur une plateforme sans disque persistant.
- **Cartographie dépendante d'un CDN externe** : Leaflet et les tuiles OpenStreetMap sont chargés depuis `unpkg.com` / `tile.openstreetmap.org` à l'intérieur de la WebView/iframe HTML — la carte ne fonctionne pas hors-ligne, même en usage 100% local.
- **Scan QR du portail prestataire nécessite un contexte sécurisé** : `getUserMedia` (accès caméra utilisé par `@zxing/browser`) est bloqué par les navigateurs hors HTTPS/`localhost` — en local (`http://localhost:3002`) ça fonctionne, mais un déploiement derrière un nom de domaine devra être servi en HTTPS pour que l'écran `/scan` puisse accéder à la caméra.
- **Chatbot hybride** : les intentions "urgence" et "recherche de prestataire" restent gérées côté client (par choix, pour l'UI riche et les numéros d'urgence locaux), le reste est délégué au backend. Cela crée une détection d'intention dupliquée (mots-clés côté client, regex côté serveur) qui peut diverger avec le temps si l'une des deux listes évolue sans l'autre.
- **`MedicApp/src/services/database.ts`** utilise une API `expo-sqlite` obsolète (`openDatabase`, `.transaction(...)`) qui ne compile plus avec la version d'`expo-sqlite` installée (échecs `tsc`) — ce fichier semble ne plus être utilisé mais casse le typecheck strict.
- **Pas de tests automatisés** sur `api-medicapp` et `MedicApp` au-delà du typecheck ; `admin-medicapp` a le harnais de test CRA mais très peu de cas couverts.
- **Aucun environnement de déploiement mis en place** : tout tourne en local via Docker Compose. Les options de déploiement (VPS + Docker Compose, VPS + Coolify, ou split Vercel pour les frontends + Railway/VPS pour API+Mongo) ont été évaluées mais aucune n'est encore configurée.

## Pistes pour la V2

Non planifiées, à discuter — listées ici pour mémoire :

- Authentification réelle (mot de passe hashé ou OTP) côté app cliente — le jeton de session existe désormais, mais les identifiants eux-mêmes (`nom` + `identifiant`) restent faibles — **et** protection du back-office admin.
- Activer `helmet` sur l'API (le rate limiting est en place sur les routes sensibles, `helmet` reste à brancher).
- Upload effectif de la photo de profil vers l'API (au lieu du `setTimeout` simulé).
- Stockage objet (S3-compatible) pour les photos de prestataires plutôt qu'un volume disque local.
- Réponses structurées du endpoint `/api/chat` (JSON avec type + données) plutôt qu'une simple chaîne de texte, pour permettre au client d'afficher des cartes interactives même pour les réponses générées côté serveur.
- Choix et mise en place d'une stratégie de déploiement (voir discussion précédente : séparation frontends/API ou VPS unique avec Docker Compose/Coolify).
- Nettoyer ou retirer `src/services/database.ts` si `expo-sqlite` n'est plus utilisé.
- Alertes anti-fraude à partir du journal `CarteValidation` (ex: multiples vérifications `invalide`/`expiree` rapprochées pour le même assuré ou le même établissement) — le widget "Dernières vérifications" du dashboard admin n'est pour l'instant qu'un affichage brut, sans détection ni notification.
