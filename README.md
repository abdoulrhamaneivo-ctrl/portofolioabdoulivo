# Portfolio personnel

Portfolio Next.js en français avec un espace d’administration protégé, une bibliothèque de certificats et un CV consultable.

## Démarrer le site

```bash
npm install
npm run dev
```

Ouvre ensuite `http://localhost:3000/admin` et connecte-toi avec l’adresse e-mail et le mot de passe définis dans `.env.local`. Le fichier `.env.example` décrit les variables attendues. Redémarre le serveur après toute modification des variables.

Pour lancer la version de production :

```bash
npm run build
npm run start
```

L’administration permet de modifier le profil, d’ajouter et publier des projets et certificats, et d’envoyer un CV PDF. Les documents envoyés sont consultables depuis `/certifications` et `/cv` (4 Mo maximum par fichier sur Vercel).

## Stockage et hébergement

En local, le contenu et les fichiers peuvent être enregistrés dans `data/portfolio.json` et `data/uploads/`. En production, le portfolio utilise Neon Postgres pour les données et Neon Object Storage pour les fichiers. Ces ressources et les variables Vercel sont configurées hors du dépôt ; `.env.local`, `data/` et `.vercel/` sont ignorés par Git. N’ajoute jamais de secrets ou de documents personnels à un commit.

Vercel Hobby et Neon Free permettent de démarrer gratuitement dans leurs quotas et conditions respectifs. La formule Hobby de Vercel est réservée aux projets personnels et non commerciaux. Si tu ajoutes ensuite un usage qui ne respecte plus ces conditions ou dépasses les quotas Neon, le déploiement peut être suspendu ou nécessiter une formule payante.
