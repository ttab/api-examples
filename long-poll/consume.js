var request = require('request');
var yargs = require('yargs');

// parse command line args
var args = require('yargs')
    .env('LP')
    .option('host', { default: 'https://app.tt.se' })
    .option('ak')
    .option('feed')
    .demandOption(['ak', 'feed'])
    .argv;

console.log('host: ' + args.host);

function subscribe() {
    request.get({
	url: args.host + "/punkt/v1/subscribe",
	qs: { ak: args.ak, name: args.feed }
    }).on('error', console.error);
}

var from = undefined;

function update() {
    console.log('update()');
    request.get({
	url: args.host + "/punkt/v1/update",
	qs: { ak: args.ak }
    }, function(err, res, body) {
	if (err) {
	    console.error(err);
	} else if (res.statusCode == 200) {
	    var json = JSON.parse(body);
	    console.log('data', json.item.type, json.item.uri);
	    from = json.item.uri;
	} else {
	    console.error('update -- ', res.statusCode);
	}
	update();
    });
}

function start() {
    subscribe();
    setInterval(subscribe, 30 * 1000);
    update();
}

start();
