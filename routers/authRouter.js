const { Router } = require("express");
const { getHome, signinPage, signupPage, signupUser, validateSignUp, validateSignIn } = require("../controllers/auth");
const passport = require("passport");
const { validationResult } = require('express-validator');

const router = Router();

router.get('/', getHome);
router.get('/signin', signinPage);
router.get('/signup', signupPage);

router.post('/signup', validateSignUp, signupUser);
router.post('/signin', validateSignIn, (req, res, next) => {
    const errors = validationResult(req);
    if ( !errors.isEmpty() ) {
        console.log(errors.array());
        
        res.render('signin', {user: null, formData: req.body, errors: errors.array()});
        return;
    }

    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            const authError = { msg: info.message, path: 'username'};
            return res.render('signin', { user: null, formData: req.body, errors: [authError] });
        }
        req.logIn(user, err => {
            if (err) {
                return next(err);
            }
            return res.redirect('/');
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