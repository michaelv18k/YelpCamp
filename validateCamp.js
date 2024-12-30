const BaseJoi = require('joi')
const AppError = require('./AppError')
const sanitizeHtml = require('sanitize-html')

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTMl'
    },
    rules: {
        escapeHTMl: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean != value) return helpers.error('string.escapeHTML', { value })
                return clean
            }
        }
    }
})
const Joi = BaseJoi.extend(extension)

function validateCamp(req, res, next) {
    const campSchema = Joi.object({
        Camp: Joi.object({
            title: Joi.string().required().escapeHTMl(),
            price: Joi.number().required().min(0),
            // image: Joi.string().required(),
            location: Joi.string().required().escapeHTMl(),
            description: Joi.string().required().escapeHTMl(),
        }).required(),
        deleteImage: Joi.array()
    })
    const { error } = campSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(400, msg)
    } else {
        next()
    }
}

function validateReview(req, res, next) {
    const reviewSchema = Joi.object({
        review: Joi.object({
            rating: Joi.number().required().min(1).max(5),
            body: Joi.string().required().escapeHTMl()
        }).required()
    }).required()
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(404, msg)
    } else {
        next()
    }
}

module.exports = { validateCamp, validateReview }
