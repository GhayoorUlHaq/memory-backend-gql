const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.API_KEY,
    api_secret: process.env.cloud_sec,
});


module.exports = {
    database: process.env.mongo_URL,
    secret: process.env.mongo_sec
}
