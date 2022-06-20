const express = require('express');
const res = require('express/lib/response');
const app = express();
userRoutes = require('./routes/user');
saucesRoutes = require('./routes/sauce');
const path = require('path');

/* MongoDB */
const mongoose = require('mongoose');
const uri = "mongodb+srv://Tom:MongoDB@cluster0.afknvvw.mongodb.net/P6?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true})  
  .then( () => console.log('Connexion à MongoDB par mongoose réussie !'))
  .catch( err => console.log('Connexion à MongoDB par mongoose échouée ! ' + err)) 
;

/* configuration CORS */
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});





app.use(express.json()); /* intercepte tout Json depuis la requête HTPP , pour mettre le corps à disposition(req) */

app.use('/api/auth', userRoutes);/* redirection vers le routeur */
app.use('/api/sauces', saucesRoutes);

app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;