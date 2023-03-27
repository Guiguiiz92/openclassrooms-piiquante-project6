const express = require('express')
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require("dotenv");
const helmet = require('helmet');
const cors = require('cors');

const app = express()
dotenv.config();

const sauceRoutes = require('./routes/sauce')
const userRoutes = require('./routes/user')

const corsOptions = {
    origin: process.env.FRONT_URL
};

app.use(cors(corsOptions));

const cspOptions = {
    directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'img-src': ["'self'", process.env.FRONT_URL]
    }
};
app.use(helmet.contentSecurityPolicy(cspOptions));

mongoose.connect(process.env.MONGODB_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch((error) => console.log('Connexion à MongoDB échouée !', error));


app.use(express.json());


app.use('/api/sauces', sauceRoutes)
app.use('/api/auth', userRoutes)
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;