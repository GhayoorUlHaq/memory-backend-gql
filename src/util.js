const jwt = require("jsonwebtoken");
const config = require('./config');
const bcrypt = require("bcryptjs");
const cloudinary = require('cloudinary').v2;


const encryptPassword = password => new Promise((resolve, reject) => {
	bcrypt.genSalt(10, (err, salt) => {
		if (err) {
			reject(err)
			return false
		}
		bcrypt.hash(password, salt, (err, hash) => {
			if (err) {
				reject(err)
				return false
			}
			resolve(hash)
			return true
		})
	})
})

const comparePassword = (password, hash) => new Promise(async (resolve, reject) => {
	try {
		const isMatch = await bcrypt.compare(password, hash)
		resolve(isMatch)
		return true
	} catch (err) {
		reject(err)
		return false
	}
})

const getToken = payload => {
    const token = jwt.sign(payload, config.secret, {
        expiresIn: 604800, // 1 Week
    })
    return token
}

const verifyToken = token => {
    try {
        const payload = jwt.verify(token, config.secret);
        return { ...payload, status: 'ok', loggedIn: true  };
    } catch (err) {
        // Add Err Message
        return { loggedIn: false }
    }
}

const uploadImageToCloudinary = async (image64, tag ) => {
	let remoteImageURL = '' ;
	await cloudinary.uploader.upload(image64,
		{ tags: tag, public_id: Math.floor( Math.random()*1000000) },  (err, image) => {
			if (err) { console.warn(err); }
			remoteImageURL = image.url
		});

	return remoteImageURL
}

const uploadMultipleImages = async (image64, tag) => {
	return await cloudinary.uploader.upload(image64, { tags: tag })
}

const deleteImageFromCloudinary = async (public_ic) => {
	// await cloudinary.uploader.destroy(public_ic, function(result) { console.log('delete image results - - -  ',result) });
	await cloudinary.api.delete_resources([public_ic], function(error, result) {console.log(result, error); });
}

const getImagePublicId = (url) => {
	let parseUrl = url.split('/');
	parseUrl = parseUrl[parseUrl.length-1]
	return parseUrl.split('.')[0]
}

module.exports = {
    getToken,
    encryptPassword,
    comparePassword,
	verifyToken,
	uploadImageToCloudinary,
	uploadMultipleImages,
	deleteImageFromCloudinary,
	getImagePublicId
}
