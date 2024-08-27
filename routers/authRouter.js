const { Router } = require("express");
const { getHome, signinPage, signupPage, signupUser, validateSignUp, validateSignIn } = require("../controllers/auth");
const passport = require("passport");
const { validationResult } = require('express-validator');

const router = Router();

// router.get('/', getHome);
router.get('/signin', signinPage);
router.get('/signup', signupPage);

router.post('/signup', validateSignUp, signupUser);
router.post('/signin', validateSignIn, (req, res, next) => {
    const errors = validationResult(req);
    if ( !errors.isEmpty() ) {
        
        res.render('signin', {user: null, formData: req.body, errors: errors.array()});
        return;
    }

    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            
            let path;

            if (info.message.toLowerCase().includes("username")) {
                path = "username";
            } else if (info.message.toLowerCase().includes("password")) {
                path = "password";
            } else {
                path = "password";
            }

            const authError = { msg: info.message, path };
            
            return res.render('signin', { user: null, formData: req.body, errors: [authError] });
        }
        req.logIn(user, err => {
            if (err) {
                return next(err);
            }
            return res.redirect('/home');
        });
    })(req, res, next);
});

router.post('/logout', (req, res, next) => {
    req.logout( (err) => {
        if (err) {
            console.log(err);
            return next(err);
        }
        res.redirect('/');
    })
})

module.exports = router;