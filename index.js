var express = require('express');
var bodyParser = require('body-parser');
var morgan = require("morgan");
//var bookCab = require('./book');

var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(morgan('combined'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', function(request, response) {
    //bookCab.book(null, function(err, response) {
    //    console.log('Done with booking!');
    //});
    response.send('Hello World!');
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
