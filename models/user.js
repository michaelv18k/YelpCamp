const mongoose = require('mongoose')
const plm = require('passport-local-mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    }
})

userSchema.plugin(plm)

module.exports = mongoose.model('User', userSchema)
