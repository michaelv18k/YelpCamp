const express = require('express')
const wrapAsync = require('../wrapAsync')
const router = express.Router()
const User = require('../models/user')
const passport = require('passport')

router.get('/register', (req, res) => {
    res.render('register')
})

router.get('/login', (req, res) => {
    res.render('login')
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'welcome back!')
    res.redirect('/campgrounds')
})
router.post('/register', wrapAsync(async (req, res) => {
    try {
        const u = req.body.User
        const user = new User({ email: u.email, username: u.username })
        const registeredUser = await User.register(user, u.password)
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', "you have registered succesfully")
            res.redirect('/campgrounds')
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}))
router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
});

module.exports = router