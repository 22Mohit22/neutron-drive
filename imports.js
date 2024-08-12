const express = require('express');
const path = require('path');

const authRouter = require('./routers/authRouter');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));


app.use('/', authRouter);


module.exports = app;