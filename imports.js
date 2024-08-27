const express = require('express');
const path = require('path');
const expressSession = require('express-session');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('@prisma/client');
const passport = require('passport');


const authRouter = require('./routers/authRouter');
const homeRouter = require('./routers/homeRouter');
const fileRouter = require('./routers/fileRouter');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(expressSession({
    cookie: {
        maxAge: 7 * 24 * 60 * 1000
    },
    secret: 'tatvamasi',
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(
        new PrismaClient(),
        {
            checkPeriod: 2 * 60 * 1000,
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined
        }
    )
}))

app.use(passport.initialize());
app.use(passport.session());

app.use('/', authRouter);
app.use('/', homeRouter);
app.use('/', fileRouter);
app.all('*', (req, res) => {
    if (req.user) {
        res.render('errorPage', {user: req.user.username})
    } else {
        res.redirect('/signin');
    }
});

module.exports = app;