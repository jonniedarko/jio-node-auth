var config = require('./config');
var authHelper;
var tokenHelper = require('./token.util');
var TIME_TO_LIVE = 60*60*24; //24 hours

/*
* Middleware to verify the token and store the user data in req._user
*/
function verify(req, res, next) {
	var headers = req.headers;
	if (headers == null) return res.send(401);

	// Get token
	try {
		var token = tokenHelper.extractTokenFromHeader(headers);
	} catch (err) {
		console.log(err);
		return res.send(401);
	}

	//Verify it in redis, set data in req._user
	authHelper.getDataByToken(token, function(err, data) {
		if (err) return res.send(401);

		req._user = data;

		next();
	});
};

/*
 * Create a new token, stores it in redis with data during ttl time in seconds
 * callback(err, token);
 */
function createAndStoreToken(data, ttl, callback) {
	data = data || {};
	ttl = ttl || TIME_TO_LIVE;

	if (data != null && typeof data !== 'object') callback(new Error('data is not an Object'));
	if (ttl != null && typeof ttl !== 'number') callback(new Error('ttl is not a valid Number'));

	tokenHelper.createToken(function(err, token) {
		if (err) callback(err);

		authHelper.setTokenWithData(token, data, ttl, function(err, success) {
			if (err) callback(err);

			if (success) {
				callback(null, token);
			}
			else {
				callback(new Error('Error when saving token'));
			}
		});
	});
};

/*
 * Expires the token (remove from redis)
 */
function expireToken(headers, callback) {
	if (headers == null) callback(new Error('Headers are null'));
	// Get token
	try {
		var token = tokenHelper.extractTokenFromHeader(headers);

		if (token == null) callback(new Error('Token is null'));

		authHelper.expireToken(token, callback);
	} catch (err) {
		console.log(err);
		return callback(err);
	}
}

module.exports = function (options){
	var options = options || {};

	authHelper = require( config[options.dataStore] || config['MONGO']);

	return {
		verify : verify,
		createAndStoreToken: createAndStoreToken,
		expireToken: expireToken
	}
}