# 75Tribune - Plateforme de Contenu Premium

Une plateforme SaaS moderne permettant à l'administrateur de publier du contenu premium et de gérer des abonnements. Les utilisateurs peuvent accéder au contenu selon leur niveau d'abonnement. Intègre des capacités d'IA avancées grâce à Ollama.

## 🚀 Fonctionnalités

### 👨‍💼 Administration du Blog

- 📝 Interface administrateur pour la publication de contenu
- 🎯 Gestion des niveaux d'accès par article
- 🏷️ Organisation par catégories
- 📈 Analytics et suivi des articles

### 💎 Système d'Abonnement

#### Plans d'Accès

- 🆓 **Accès Gratuit**

  - Lecture d'articles publics
  - Création de compte
  - Accès limité aux ressources

- 💫 **Accès Premium**
  - Accès à tous les articles
  - Fonctionnalités exclusives
  - Support prioritaire

### 🎯 Gestion du Contenu

- 📄 Création et édition d'articles avec éditeur riche (TipTap)
- 🌟 Système de catégorisation
- 📊 Gestion des droits d'accès
- 🔍 Recherche avancée

### ⚙️ Fonctionnalités Techniques

- 🔐 Authentification complète (JWT + Next-Auth)
- 📧 Système de vérification par email
- 🎨 Interface utilisateur moderne avec Tailwind CSS
- 🌓 Mode sombre/clair
- 📱 Design responsive

## 📋 Prérequis

- Node.js 18.x ou supérieur
- MySQL
- WAMP/XAMPP (pour le développement local)

## 🛠️ Installation

1. Clonez le dépôt :

```bash
git clone [url-du-repo]
cd 75Tribune
```

2. Installez les dépendances :

```bash
npm install
```

3. Configurez les variables d'environnement :

```bash
cp .env.example .env
```

Puis modifiez le fichier `.env` avec vos configurations :

- `DATABASE_URL`: URL de connexion MySQL
- `NEXTAUTH_SECRET`: Clé secrète pour l'authentification
- `SMTP_*`: Configuration pour l'envoi d'emails
- `NEXT_PUBLIC_APP_URL`: URL de votre application

4. Initialisez la base de données :

```bash
npx prisma generate
npx prisma db push
```

5. Lancez le serveur de développement :

```bash
npm run dev
```

6. Pour la production :

```bash
npm run build
npm run start
```

## 🏗️ Structure du Projet

```
75Tribune/
├── src/
│   ├── app/                # Routes et pages Next.js
│   │   ├── (admin)/       # Routes administrateur
│   │   ├── (auth)/        # Routes authentification
│   │   ├── api/           # API Routes
│   │   └── articles/      # Gestion des articles
│   ├── components/        # Composants React
│   ├── lib/              # Utilitaires et configurations
│   └── types/            # Types TypeScript
├── prisma/               # Schéma et migrations Prisma
└── public/              # Fichiers statiques
```

## 🔧 Technologies Utilisées

- **Framework** : Next.js 14
- **Langage** : TypeScript
- **UI** :
  - Tailwind CSS
  - Radix UI
  - Lucide Icons
- **Base de données** :
  - MySQL
  - Prisma ORM
- **Authentification** :
  - NextAuth.js
  - JWT
- **Éditeur** : TipTap
- **Emails** : Nodemailer
- **Validation** : Zod
- **Notifications** : React Hot Toast

## 🔐 Sécurité

- Authentification JWT
- Vérification des emails
- Protection CSRF
- Validation des entrées
- Hachage des mots de passe (bcrypt)
- Middleware de protection des routes

## 🚀 Déploiement

1. Assurez-vous d'avoir configuré toutes les variables d'environnement
2. Exécutez `npm run build`
3. Démarrez avec `npm run start`

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez suivre ces étapes :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📧 Contact

Pour toute question ou suggestion, n'hésitez pas à nous contacter.

## 🙏 Remerciements

Un grand merci à tous les contributeurs qui ont aidé à faire de ce projet une réalité !
