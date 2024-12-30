const { validateReview } = require('../validateCamp')
const Review = require('../models/reviews')
const Camp = require('../models/camp')
const wrapAsync = require('../wrapAsync')
const express = require('express')
const router = express.Router({ mergeParams: true })
const isLoggedin = require('../isLoggedin')

const isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params
    const sanitizedRvId = reviewId.replace(/^>/, '');
    const review = await Review.findById(sanitizedRvId)
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'you dont have permission to do that')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}


router.post('/', isLoggedin, validateReview, wrapAsync(async (req, res) => {
    const cp = await Camp.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author = req.user._id
    cp.reviews.push(review)
    await review.save()
    await cp.save()
    req.flash('success', 'successfully made a new review')
    res.redirect(`/campgrounds/${cp._id}`)
}))

router.delete('/:reviewId', isLoggedin, isReviewAuthor, wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params
    const sanitizedRvId = reviewId.replace(/^>/, ''); // Removes a leading '>'
    await Camp.findByIdAndUpdate(id, { $pull: { reviews: sanitizedRvId } })
    await Review.findByIdAndDelete(sanitizedRvId)
    req.flash('success', 'successfully deleted a  review')
    res.redirect(`/campgrounds/${id}`)

}))

module.exports = router