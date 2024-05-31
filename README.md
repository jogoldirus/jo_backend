
# Evalution STUDI  | Frontend

### Lien utile 
GIT Frontend : https://github.com/jogoldirus/jo_frontend

GIT Backend : https://github.com/jogoldirus/jo_backend

Live : https://studijo.alexiscollignon.fr/

### Prérequis 
- Avoir NodeJS
- Avoir un serveur MariaDB
- Avoir une connexion internet
- Avoir un ordinateur 

### Documentation technique 
#### Environnement de travail

Ce projet a été développer sous `Windows` avec les technologies suivantes : 

     Serveur : 
        - MySQL
        - Apache
        - Certificat Let's Encrypt (HTTPS)
     Backend (API) :
        - NodeJS

     Frontend : 
        - ReactJS
        - TailwindCSS
        - Javascript
    
L'application est sécurisé, et utilise différences technologies pour s'y assurer :

 - Hashage des mots de passe.
 - Utilisation de token pour identifier l'utilisateur lors des requetes importantes. (JsonWebToken)
 - Utilisation de package ne dépendant de presque aucun autre pour s'assurer la viabilité dans le temps.

### Manuel d'utilisation

#### Installation
- Télécharger le projet Gib

- Aller dans le dossier du projet

- Installer les dépendances avec `npm install`

- Crée un fichier `.env` a la racine du projet sous la forme :  
`
DB_USERNAME=

DB_PASSWORD=.

DB_HOST=

DB_DATABASE=

DB_PORT=3306

PORT=3010

SECRET_JWT=
`
- Installez la base de donnée grâce au fichier .sql disponible à la racine du projet
- Allez dans le dossier src
- Lancer l'API avec `node .\index.js`
- L'API devrait être disponible à l'adresse localhost:<PORT CHOISI>/

