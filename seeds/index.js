const mongoose = require('mongoose')
const { descriptors, places } = require('./seedHelper')
const location = require('./cities')
const Camp = require('../models/camp')
const cities = require('./cities')
mongoose.connect('mongodb://localhost:27017/YELPCAMP')
    .then(() => {
        console.log("server was connected to database through mongoose")
    })
    .catch(() => {
        console.log("mongoose connection failed")
    })
function selectRandom(arr) {
    return arr[Math.floor(Math.random() * (arr.length))]
}
const seedDB = async () => {
    await Camp.deleteMany({})
    for (var i = 0; i < 100; i++) {
        selectedCity = selectRandom(cities)
        const camp = new Camp({
            author: "676e7adf7bff98aa8d3a3d46",
            title: `${selectRandom(descriptors)},${selectRandom(places)}`,
            price: `${Math.floor(Math.random() * 100) + 100}`,
            description: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam",
            location: `${selectedCity.city},${selectedCity.state}`,
            geometry: {
                type: 'Point',
                coordinates: [selectedCity.longitude, selectedCity.latitude]
            },
            images: [{
                url: 'https://res.cloudinary.com/dltrwgtck/image/upload/v1735457130/YelpCamp/miiiaoywidjh3q5fimpe.jpg',
                filename: 'YelpCamp/miiiaoywidjh3q5fimpe',
            }]

        })
        await camp.save()
    }
}
seedDB().then(() => {
    mongoose.connection.close()
})
