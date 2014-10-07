var express = require('express'),
	app = express(),
	http = require('http'),
	fs = require('fs'),
	querystring = require('querystring'),
	request = require('request'),
	mysql = require('mysql')
	port = 9456;

app.listen(port);
app.use(express.bodyParser())

app.use(express.static(__dirname + '/public'));
app.use('/images', express.static(__dirname + '/images'));

app.use(express.cookieParser());

app.all('*', function(req, res, next) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  next();
 });

console.log("Server started.\nAvailable on localhost:" + port);

var connectionSettings = {
	host     : '127.0.0.1',
	connectionLimit : 10,
	user     : 'root',
	password : 'root',
	port     : '8889',
	database : 'awkward',
	webport : 8080
}

var database = mysql.createConnection(connectionSettings);
	database.connect();

app.get('/situation/new/:description/:rating/:latitude/:longitude', function(req, res){

	var description = req.param('description'),
		rating = req.param('rating'),
		latitude = req.param('latitude'),
		longitude = req.param('longitude');

	database.query("INSERT INTO situations (description, rating, latitude, longitude) VALUES (?, ?, ?, ?)", [description, rating, latitude, longitude], function(err, fields, rows){
		if(err){
			console.log(err);
		}
	});

	res.json({
		description : description,
		rating : rating,
		latitude : latitude,
		longitude : longitude
	});

});

app.get('/situation/check/:latitude/:longitude', function(req, res){

	var latitude = parseFloat(req.param('latitude')),
		longitude = parseFloat(req.param('longitude'));

	console.log(latitude, longitude);

	database.query("SELECT * FROM situations WHERE latitude < ? AND latitude > ? AND longitude < ? AND longitude > ?", [latitude + 0.6, latitude - 0.6, longitude + 0.6, longitude - 0.6], function(err, rows, fields) {

		if(err){
			console.log(err);
		}

		var events = [],
			awks = 0;

		if(rows.length > 0){
			
			console.log(rows);	

			for(var f = 0; f < rows.length; f += 1){
				delete rows[f].id;
				events.push(rows[f]);
				awks += rows[f].rating;
			}

		}

		res.json({
			situations : events,
			awkLevel : awks / rows.length
		});

		/*res.json({
			latitude : latitude,
			longitude : longitude
		});*/

	});

});