'use strict';
var chai = require('chai');
var expect = chai.expect;

var Auth = require('../index');

describe('auth unit tests', function(){
	var token;

	it('initialize Auth correctly', function(){
		expect(typeof Auth).to.eq('function');
		Auth = Auth();
		expect(typeof Auth.verify).to.eq('function');
		expect(typeof Auth.createAndStoreToken).to.eq('function');
		expect(typeof Auth.expireToken).to.eq('function');
	});

	it('createAndStoreToken', function(done){
		var data = {name: 'John', x:1};
		var ttl = 15000;
		Auth.createAndStoreToken(data, ttl, function (err, token){
				expect(!!err).to.be(false);
				expect(token).to.not.be(null);
				expect(token).to.not.be(undefined);

				token = token;
				done();
		});
	});
	
	it('verify token', function (done){
		//Auth.verify

		done();
	});

});