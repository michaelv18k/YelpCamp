const mongoose = require('mongoose')
const Review = require('./reviews')

const ImageSchema = new mongoose.Schema({
    url: String,
    filename: String
})
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})

// const opts = { toJSON: { virtuals: true } };

const campSchema = new mongoose.Schema({
    title: String,
    price: Number,

    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    images: [ImageSchema],
    description: String,
    location: String,
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

campSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Camp', campSchema)
