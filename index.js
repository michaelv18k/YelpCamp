if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')
const AppError = require('./AppError')
const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')
const users = require('./routes/users')
const path = require('path')
const session = require('express-session')
const flash = require('connect-flash')
const User = require('./models/user')
const passport = require('passport')
const localStrategy = require('passport-local')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const MongoDBStore = require("connect-mongo")(session)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.engine('ejs', ejsMate)

const dbUrl = 'mongodb://localhost:27017/YELPCAMP'
// const dbUrl=process.env.MONGO_URL
mongoose.connect(dbUrl)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error("connection failed"));

app.use(express.static('public'));
app.use(mongoSanitize())
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(helmet({ contentSecurityPolicy: false }))

const store = new MongoDBStore({
    url: dbUrl,
    secret: 'thisshouldbebettersecret',
    touchAfter: 24 * 60 * 60
})
store.on("error", function (e) {
    console.log("session stroe error", e)
})

const sessionConfig = {
    store,
    secret: 'thisshouldbebettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})


app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)
app.use('', users)


app.get('/', (req, res) => {
    res.render('home')
})

app.all(/(.*)/, (req, res, next) => {
    next(new AppError(404, "page not found"))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = "soemthing went wrong"
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log("server is listening on port 3000")
})


// const scriptSrcUrls = [
//     "https://stackpath.bootstrapcdn.com/",
//     // "https://api.tiles.mapbox.com/",
//     // "https://api.mapbox.com/",
//     "https://kit.fontawesome.com/",
//     "https://cdnjs.cloudflare.com/",
//     "https://cdn.jsdelivr.net",
//     "https://cdn.maptiler.com/", // add this
// ];
// const styleSrcUrls = [
//     "https://kit-free.fontawesome.com/",
//     "https://stackpath.bootstrapcdn.com/",
//     // "https://api.mapbox.com/",
//     // "https://api.tiles.mapbox.com/",
//     "https://fonts.googleapis.com/",
//     "https://use.fontawesome.com/",
//     "https://cdn.jsdelivr.net",
//     "https://cdn.maptiler.com/", // add this
// ];
// const connectSrcUrls = [
//     // "https://api.mapbox.com/",
//     // "https://a.tiles.mapbox.com/",
//     // "https://b.tiles.mapbox.com/",
//     // "https://events.mapbox.com/",
//     "https://api.maptiler.com/", // add this
// ];

// const fontSrcUrls = [];
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: [],
//             connectSrc: ["'self'", ...connectSrcUrls],
//             scriptSrc: ["'unsafe-inline'", ...styleSrcUrls],
//             workerSrc: ["'self'", "blob:"],
//             objectSrc: [],
//             imgSrc: [
//                 "'self'",
//                 "blob:",
//                 "data:",
//                 "https://res.cloudinary.com/dltrwgtck",
//                 "https://images.unsplash.com/"
//             ],
//             fontSrc: ["'self'", ...fontSrcUrls]

//         }
//     })
// )
