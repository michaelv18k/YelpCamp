const Camp = require('./models/camp')

const isAuthor = async (req, res, next) => {
    const { id } = req.params
    const campground = await Camp.findById(id)
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'you dont have permission to do that')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports = isAuthor