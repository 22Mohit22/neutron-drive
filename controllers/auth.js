const bcrypt = require('bcryptjs');
const db = require('../db');
const { body, validationResult } = require("express-validator");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const user = await db.getUser(username.toLowerCase());
            if (!user) {
                return done(null, false, { message: 'Incorrect username' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: 'Incorrect password' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
))

passport.serializeUser((user, done) => {
    process.nextTick(() => {
        return done(null, {
            id: user.id, 
            username: user.username, 
            folders: user.folders,
            files: user.files,
        })
    })
})

passport.deserializeUser((user, done) => {
    process.nextTick(() => {
        return done(null, user);
    })
})

async function getHome(req, res) {
    if (req.user) {
        res.render('home', {user: req.user.username});
        return;
    } else {
        res.redirect('signin');
    }
}

function signupPage(req, res) {
    res.render('signup', {user: null, formData: {}, errors: []});
}

const genUser = (req, res) => {
    
    const {username, password} = req.body;

    bcrypt.hash(password, 10, async (err, hashPass) => {
        if (err) {
            throw new Error("Error hashing password");
        } 
        if (hashPass) {
            try {
                const newUsername = username.toLowerCase();
                db.createUser(newUsername, hashPass)
                .then(() => res.redirect('/signin'))
                .catch((err) => {
                    let error;
                    if (err.code == 'P2002') {
                        error = {msg: 'Username is taken', path: err.meta.target[0]};
                    }
                    res.render('signup', {user: null, formData: req.body, errors: [error]})
                })
                const newUser = await db.getUser(newUsername);
                db.createRoot(newUser);
                
            } catch (err) {
                console.error('Signup error: ', err.message);
                res.status(500).send('Server error');
            }
            return;
        }
    })
}

const validateSignUp = [
    body('username').trim().isLength({min: 3}).withMessage('Must be atleast 3 characters long').escape(),
    body('password').trim().isLength({min: 8}).withMessage('Password must be 8 characters long').escape(),
    body('confirmpassword').trim().custom((password, { req }) => {
        if (password !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    }).escape()
]

const validateSignIn = [
    body('username').trim().isLength({min: 3}).withMessage('Must be atleast 3 characters long').escape(),
    body('username').trim().matches(/^[^\s]+$/).withMessage('Username cannot contain spaces').escape(),
    body('password').trim().isLength({min: 8}).withMessage('Password must be 8 characters long').escape()
]

function signupUser(req, res) {
    const errors = validationResult(req);
    if ( !errors.isEmpty() ) {
        res.render('signup', {user: null, formData: req.body, errors: errors.array()});
        return;
    }
    genUser(req, res);
}

function signinPage(req, res) {
    res.render('signin', {user: null, formData: {}, errors: []});
}


module.exports = {
    getHome,
    signinPage,
    signupPage,
    signupUser,
    validateSignUp,
    validateSignIn,
}