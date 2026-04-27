# Blind Storage

API backend Zero Knowledge pour le stockage chiffré de fichiers.

## Objectifs

- **Zero Knowledge :** Le serveur ne voit jamais les données en clair, les clés privées ni les fichiers déchiffrés.
- **Multi-plateforme :** API RESTful pour les applications Web et Mobile.
- **Gestion multi-terminaux :** Synchronisation sécurisée sur plusieurs appareils liés à un seul compte.
- **Partage sécurisé :** Partage de fichiers entre utilisateurs avec droits d'accès granulaires.
- **Intégration Cloud :** Stockage des fichiers chiffrés sur des fournisseurs tiers (Dropbox, Google Cloud, etc.).
- **Résilience :** Solution de recouvrement en cas de perte d'un terminal.

## Documentation

- [Architecture & Modèle Cryptographique](doc/architecture.md)
- [Schémas des Flux Cryptographiques](doc/crypto-flows.md)

---

## Get Started

### Prérequis

- [Node.js](https://nodejs.org/) >= 20
- [Docker](https://www.docker.com/) & Docker Compose

### Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/thomas-cad/blind-storage.git
cd blind-storage/back

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env
```

### Lancer la base de données

```bash
# Depuis la racine du projet
docker compose up -d
```

### Initialiser la base de données (Prisma)

```bash
# Appliquer les migrations (crée les tables)
npx prisma migrate deploy

# Générer le client Prisma
npx prisma generate
```

> En développement, pour créer une nouvelle migration après modification du schéma :
> ```bash
> npx prisma migrate dev --name <nom-de-la-migration>
> ```

### Lancer le backend

```bash
# Développement
npm run start:dev

# Production
npm run build
npm run start:prod
```

L'API est disponible sur `http://localhost:3000` (ou le `PORT` défini dans `.env`).

### Variables d'environnement

| Variable             | Description                     | Défaut |
| -------------------- | ------------------------------- | ------ |
| `PORT`               | Port d'écoute du serveur NestJS | `3000` |
| `POSTGRES_USER`      | Utilisateur PostgreSQL          | —      |
| `POSTGRES_PASSWORD`  | Mot de passe PostgreSQL         | —      |
| `POSTGRES_DB`        | Nom de la base de données       | —      |
| `POSTGRES_PORT`      | Port exposé par le conteneur    | `5432` |
| `DATABASE_URL`       | URL de connexion Prisma         | —      |

---

## Contributeurs

- **Thomas Cadegros** — Étudiant cycle ingénieur cybersécurité, Télécom Paris — [thomas.cadegros@telecom-paris.fr](mailto:thomas.cadegros@telecom-paris.fr)
- **Amine Slaoui** — Étudiant cycle ingénieur cybersécurité, Télécom Paris — [amine.slaoui@telecom-paris.fr](mailto:amine.slaoui@telecom-paris.fr)
