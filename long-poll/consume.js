var request = require('request');
var JSONStream = require('JSONStream');
var es = require('event-stream');
var assert = require('assert');

// read settings
var ak = process.env['AK'];
var feed = process.env['FEED'];
var host = process.env['HOST'] || 'https://beta.tt.se'
assert(ak, 'need access key');
assert(feed, 'need feed');

console.log('host: ' + host);

function subscribe() {
    request.get(host + "/punkt/v1/subscribe?name=" + feed + "&ak=" + ak).on('error', console.error);
}

function update() {
    console.log('update()');
    request.get(host + "/punkt/v1/update?ak=" + ak)
	.on('error', function(err) {
	    if (err) {
		console.log(err);
		update();
	    }
	})
	.on('response', function(res) {
	    if (res.statusCode == 200) {
		console.log('connected');
		res.pipe(JSONStream.parse('item'))
		    .on('data', function(data) {
			console.log('data', data.type, data.uri);
		    })
		    .on('close', function() {
			console.log('close');
			update();
		    });
	    } else {
		console.error('update -- ' + res.statusCode);
		update();
	    }
	});
}

function start() {
    subscribe();
    setInterval(subscribe, 30 * 1000);
    update();
}

start();
