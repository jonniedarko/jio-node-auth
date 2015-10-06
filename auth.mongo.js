var MongoClient = require('mongodb').MongoClient;
var MONGO_URL = process.env.MONGO || 'mongodb://localhost:27017/session-store';

MongoClient.connect(MONGO_URL, function (err, db) {
	
	if (err) {
		console.log('MongoClient.connect Error:', err);
		callback(err)
	}
	var sessionStore = db.collection('SESSION_STORE');
	sessionStore.createIndex({"expireAt": 1}, {expireAfterSeconds: 0})
	
	
});

function getDateFromTTL(ttl) {
	var date = new Date();
	date.setSeconds(date.getSeconds() + ttl);
	return date;
}
/*
 * Stores a token with user data for a ttl period of time
 * token: String - Token used as the key in redis
 * data: Object - value stored with the token
 * ttl: Number - Time to Live in seconds (default: 24Hours)
 * callback: Function
 */
exports.setTokenWithData = function (token, data, ttl, callback) {
	
	if (token == null) throw new Error('Token is null');
	if (data != null && typeof data !== 'object') throw new Error('data is not an Object');
	
	var userData = data || {};
	userData._ts = new Date();
	
	var timeToLive = ttl || auth.TIME_TO_LIVE;
	if (timeToLive != null && typeof timeToLive !== 'number') throw new Error('TimeToLive is not a Number');
	
	
	MongoClient.connect(MONGO_URL, function (err, db) {
		
		if (err) {
			console.log('setTokenWithData Error:', err);
			callback(err)
		}
		var sessionStore = db.collection('SESSION_STORE');
		sessionStore.insert({
			"token_data": JSON.stringify(userData),
			"token": token,
			"expireAt": getDateFromTTL(timeToLive)
		}, function (err, results) {
			if (err) callback(err);
			if (results) {
				callback(null, true);
			} else {
				callback(new Error('Token not set in redis'));
			}
		});
		
	});
};

/*
 * Gets the associated data of the token.
 * token: String - token used as the key in redis
 * callback: Function - returns data
 */
exports.getDataByToken = function (token, callback) {
	if (token == null) callback(new Error('Token is null'));
	
	MongoClient.connect(MONGO_URL, function (err, db) {
		
		if (err) {
			console.log('getDataByToken Error:', err);
			callback(err)
		}
		var sessionStore = db.collection('SESSION_STORE');
		sessionStore.findOne({"token": token}, function (err, result) {
			if (err) callback(err);
			
			if (result.token_data != null) callback(null, JSON.parse(result.token_data));
			else callback(new Error('Token Not Found'));
		});
		
	});
}

/*
 * Expires a token by deleting the entry in redis
 * callback(null, true) if successfuly deleted
 */
exports.expireToken = function (token, callback) {
	if (token == null) callback(new Error('Token is null'));
	
	MongoClient.connect(MONGO_URL, function (err, db) {
		
		if (err) {
			console.log('expireToken Error:', err);
			callback(err);
		}
		var sessionStore = db.collection('SESSION_STORE');
		sessionStore.remove({"token": token}, function (err, results) {
			if (err) callback(err);
			
			if (results) callback(null, true);
			else callback(new Error('Token Not Found'));
		});
		
	});
}
	
