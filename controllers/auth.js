function getHome(req, res) {
    res.render('home', {user: 'Mohit'});
}

function signupPage(req, res) {
    res.render('signup', {user: null});
}

function signupUser(req, res) {
    res.json(req.body);
}

function signinPage(req, res) {
    res.render('signin', {user: null});
}

function signinUser(req, res) {
    res.json(req.body);
}

module.exports = {
    getHome,
    signinPage,
    signupPage,
    signupUser,
    signinUser,
}