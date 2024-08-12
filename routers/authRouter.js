const { Router } = require("express");
const { getHome, signinPage, signupPage, signupUser, signinUser } = require("../controllers/auth");

const router = Router();

router.get('/', getHome);
router.get('/signin', signinPage);
router.get('/signup', signupPage);

router.post('/signup', signupUser);
router.post('/signin', signinUser);

module.exports = router;