var request = require('request');
var JSONStream = require('JSONStream');
var es = require('event-stream');
var assert = require('assert');

// read settings
var ak = process.env['AK'];
var feed = process.env['FEED'];
assert(ak, 'need access key');
assert(feed, 'need feed');

function subscribe() {
    request.get("https://beta.tt.se/punkt/v1/subscribe?name=" + feed + "&ak=" + ak)
	.on('error', console.error)
	.on('response', function(res) {
	    console.log("subscribe -- " + res.statusCode);
	});
}

function update() {
    console.log('update()');
    request.get("https://beta.tt.se/punkt/v1/update?name=" + feed + "&ak=" + ak)
	.on('error', function(err) {
	    if (err) {
		console.log(err);
		update();
	    }
	})
	.on('response', function(res) {
	    if (res.statusCode == 504) {
		// timeout
		console.log('timeout');
		update();
	    } else if (res.statusCode == 200) {
		console.log('contact');
		res.pipe(JSONStream.parse('item'))
		    .on('data', function(data) {
			console.log('data', data.type, data.uri);
		    })
		    .on('close', function() {
			console.log('close');
			update();
		    });
	    }
	});
}

function start() {
    subscribe();
    setInterval(subscribe, 30 * 1000);
    update();
}

start();
