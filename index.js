var express = require('express');
var bodyParser = require('body-parser');
var morgan = require("morgan");
//var bookCab = require('./book');

var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(morgan('combined'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));


var responseString = '<html> <head> <title> Hello! </title> <meta http-equiv=\'Content-Type\' content=\'text/html; charset=UTF-8\' /> <meta name=\'txtweb-appkey\' content=\'d5274899-d6d5-40a5-b461-7d444203908b\' /></head><body> "Hello txtWeb!"</body></html>';
app.get('/', function(request, response) {
    //bookCab.book(null, function(err, response) {
    //    console.log('Done with booking!');
    //});
    response.send(responseString);
});

app.post('/', function(request, response) {
    var msg = request.body['txtweb-message'];
    var hashMobileNumber = request.body['txtweb-mobile'];
    console.log('msg: ', msg, 'mobNo: ', hashMobileNumber);
    response.send('Hello World!');
});

app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});
