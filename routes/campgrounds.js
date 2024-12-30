const express = require('express')
const router = express.Router()
const { validateCamp } = require('../validateCamp')
const wrapAsync = require('../wrapAsync')
const Camp = require('../models/camp')
const AppError = require('../AppError')
const isLoggedin = require('../isLoggedin')
const isAuthor = require('../isAuthor')
const multer = require('multer')
const { storage, cloudinary } = require('../cloudinary')
const upload = multer({ storage })

const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;


router.get('/', wrapAsync(async (req, res) => {
    const cps = await Camp.find({})
    res.render('index', { cps })
}))
router.get('/new', isLoggedin, (req, res) => {
    res.render('new')
})
router.get('/:id', wrapAsync(async (req, res) => {
    const cp = await Camp.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!cp) {
        req.flash('error', 'campground was not found')
        res.redirect('/campgrounds')
    }
    res.render('details', { cp })
}))
router.post('/', isLoggedin, upload.array('image'), validateCamp, wrapAsync(async (req, res, next) => {
    const geoData = await maptilerClient.geocoding.forward(req.body.Camp.location, { limit: 1 });
    const newCamp = new Camp(req.body.Camp)
    newCamp.author = req.user._id;
    newCamp.geometry = geoData.features[0].geometry;
    newCamp.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    await newCamp.save()
    req.flash('success', 'successfully made a new campground')
    res.redirect(`/campgrounds/${newCamp._id}`)
}))

router.get('/:id/edit', isLoggedin, isAuthor, wrapAsync(async (req, res) => {
    const cp = await Camp.findById(req.params.id)
    if (!cp) {
        req.flash('error', 'campground was not found')
        res.redirect('/campgrounds')
    }
    res.render('edit', { cp })
}))
router.put('/:id', isLoggedin, isAuthor, upload.array('image'), validateCamp, wrapAsync(async (req, res) => {
    const { id } = req.params

    const cp = await Camp.findByIdAndUpdate(id, req.body.Camp, { new: true })
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    cp.images.push(...images)
    if (req.body.deleteImage) {
        for (let filename of req.body.deleteImage) {
            await cloudinary.uploader.destroy(filename)
        }
        await cp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImage } } } })

    }
    await cp.save()
    req.flash('success', 'successfully edited a  campground')
    res.redirect(`/campgrounds/${id}`)
}))
router.delete('/:id/delete', isLoggedin, isAuthor, wrapAsync(async (req, res) => {
    const { id } = req.params
    await Camp.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))

module.exports = router