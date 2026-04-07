// =====================================================
// APPLICATION EXPRESS MOVIES - Serveur Principal
// =====================================================

// Importation du module Express pour créer le serveur web
const express = require('express');
const session = require('express-session');

const PORT = 3000; // Port sur lequel le serveur écoute
const bodyParser = require('body-parser')

const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

const app = express();

const jwt = require('jsonwebtoken');


let frenchMovies = [
  {
    id: 1,
    title: 'Le fabuleux destin d\'Amélie Poulain',
    director: 'Jean-Pierre Jeunet',
    releaseYear: 2001
  },
  {
    id: 2,
    title: 'Intouchables',
    director: 'Olivier Nakache, Éric Toledano',
    releaseYear: 2011
  },
  {
    id: 3,
    title: 'La Haine',
    director: 'Mathieu Kassovitz',
    releaseYear: 1995
  },
  {
    id: 4,
    title: 'Les Choristes',
    director: 'Christophe Barratier',
    releaseYear: 2004
  }
];
// =====================================================
// CONFIGURATION MIDDLEWARE
// =====================================================
// Middleware : Sert les fichiers statiques (CSS, images, etc.) depuis le dossier 'public'
app.use('/public', express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))

// Configuration des sessions
app.use(session({
  secret: 'your-secret-key-expressemovies',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 // 24 heures
  }
}));

// Middleware pour passer l'info utilisateur aux templates
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Configuration des templates
// Indique à Express où trouvé les fichiers de template (vues)
app.set('views', './views');
// Définit le moteur de templating utilisé (EJS)
app.set('view engine', 'ejs');

// =====================================================
// ROUTES - Définition des URL et leurs traitements
// =====================================================

// ROUTE 1 : Afficher la liste des films
app.get('/movies', (req, res) => {
  // Titre de la page
  const title = 'films français de trente dernières années';

  // Rendu du template 'movies' avec les données des films et le titre
  res.render('movies', { movies: frenchMovies, title: title });
});

/* app.post('/movies', (req, res) => {
  console.log('Données reçues :', req.body);
  const newMovie = {
    id: frenchMovies.length + 1,
    title: req.body.title,
    director: req.body.director,
    releaseYear: Number(req.body.releaseYear)
  };
  frenchMovies.push(newMovie);
  console.log(frenchMovies);
  res.sendStatus(201);
}); */

app.post('/movies', upload.single('poster'), (req, res) => {
  console.log('Données reçues :', req.body);
  console.log('Fichier reçu :', req.file);
  const newMovie = {
    id: frenchMovies.length + 1,
    title: req.body.title,  
    director: req.body.director,
    releaseYear: Number(req.body.releaseYear),
    poster: req.file ? req.file.filename : null
  };
  frenchMovies.push(newMovie);
  console.log(frenchMovies);
  res.sendStatus(201);
});


// ROUTE 2 (commentée) : Ancienne route pour les détails d' un film
// app.get('/movie-details', (req, res) => {
//   res.render('movie-details')
// })

// ROUTE 3 : Ajouter un film
app.get('/movies/add', (req, res) => {
  res.render('add-movie');
})

// ROUTE 4 : Afficher les détails d'un film spécifique via son ID
app.get('/movies/:id', (req, res) => {
  // Récupère l'ID du film depuis l'URL
  const id = req.params.id;
  // Récupère le titre si fourni dans l'URL
  const title = req.params.title;
  
  // Rendu du template 'movie-details' avec l'ID du film
  res.render('movie-details', { movieid: id })
});

// ROUTE 5 : Page d'accueil - Route racine
app.get('/', (req, res) => {
  // Rendu du template 'index' pour afficher la page d'accueil
  res.render('index');
});

// ROUTE 6 : Page de connexion
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const email = req.body.email ? req.body.email.trim() : '';
  const password = req.body.password ? req.body.password : '';

  // Utilisateur de test
  const fakeUser = {
    email: 'testuser@example.com',
    password: '123'
  };

  if (fakeUser.email === email && fakeUser.password === password) {
    const secret = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30';
    const token = jwt.sign({
      sub: '1234567890',
      name: 'John Doe',
      admin: true,
      iat: 1516239022
    }, secret, { expiresIn: '1h' });
    console.log('Token JWT généré :', token);

    // Création de la session utilisateur avec le token
    req.session.user = {
      email: email,
      name: 'Utilisateur',
      token: token
    };

    return res.json({ token });
  }

  res.status(401).json({ error: 'Identifiants invalides. Essayez testuser@example.com / 123' });
});

// ROUTE 7 : Logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.render('login', { error: 'Erreur lors de la déconnexion' });
    }
    res.redirect('/login');
  });
});

app.get('/movie-search', (req, res) => {
  res.render('movie-search');
});

// =====================================================
// DÉMARRAGE DU SERVEUR
// =====================================================
// Le serveur écoute sur le port 3000
// Un message de confirmation s'affiche dans la console
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});