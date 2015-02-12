var express = require('express');
var morgan = require("morgan");
var bookCab = require('./book');
var utility = require('./utility');

var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(morgan('combined'));
app.use(express.static(__dirname + '/public'));


//TODO: move all template strings to jade
var responseStartTemplate = '<html> <head> <title> Ola! </title> <meta http-equiv=\'Content-Type\' content=\'text/html; charset=UTF-8\' /> <meta name=\'txtweb-appkey\' content=\'d5274899-d6d5-40a5-b461-7d444203908b\' /></head><body>';
var responseEndTemplate = '</body></html>';

var registrationTemplateString = 'Register using @ola reg email:&lt;email address&gt; phone:&lt;phone number&gt; name:&lt;name&gt;';
var registrationSuccessfulTemplateString = 'Registration complete! ';

var bookTemplateString = 'Book using @ola book date:&lt;dd/mm/yyyy&gt; time:hh:mm AM/PM from:&lt;from locality&gt; to:&lt;to locality&gt; faddr:&lt;from address&gt; taddr:&lt;to address&gt;'
var bookResponseTemplate = 'Successfully received message. Processing...'

// Happy happy scenarios. TODO: handle every single exception
app.get('/', function(request, response) {

    var txtWebMsg = request.param('txtweb-message');
    var txtWebMobile = request.param('txtweb-mobile');

    console.log('txtWebMsg: ', txtWebMsg, 'hash number: ', txtWebMobile);

    if(/reg .*/g.test(txtWebMsg)){
        return handleRegistrationMessage(response, txtWebMsg, txtWebMobile);
    }

    if(/book .*/g.test(txtWebMsg)) {
        return handleBookMessage(response, txtWebMsg, txtWebMobile);
    }
    return handleEmptyMessage(response, txtWebMobile);
});

app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});

function handleEmptyMessage(response, txtWebMobile) {
    if(txtWebMobile != null && utility.findUser(txtWebMobile) != null) {
        return response.send(responseStartTemplate + bookTemplateString + responseEndTemplate);
    }
    return response.send(responseStartTemplate + registrationTemplateString + responseEndTemplate);
}

function handleRegistrationMessage(response, txtWebMsg, txtWebMobile) {
    var data = /reg email:(.*)\s+phone:(.*)\s+name:(.*)/g.exec(txtWebMsg);
    utility.saveUser(txtWebMobile, data[1], data[2], data[3]);
    return response.send(responseStartTemplate + registrationSuccessfulTemplateString + bookTemplateString + responseEndTemplate);
}

function handleBookMessage(response, txtWebMsg, txtWebMobile) {
    var user = utility.findUser(txtWebMobile);
    if(user == null) {
        response.send(responseStartTemplate + registrationTemplateString + responseEndTemplate);
    }
    var data = /book date:(.*)\s+time:(.*)\s+from:(.*)\s+to:(.*)\s+faddr:(.*)\s+toaddr:(.*)/g.exec(txtWebMsg);
    var bookingDetails = {
        date:data[1],
        time:data[2],
        pickupLocality: data[3],
        dropLocality:data[4],
        pickupAddress:data[5],
        dropAddress:data[6]
    };
    console.log('user: ', user, 'bookingDetails: ', bookingDetails);
    bookCab.book(user, bookingDetails, function(err, data) {
        console.log('Completed booking attempt');
        if(err) {
            return console.log('Error while booking: ', err);
         //TODO: push notification failure
        }
        console.log('data: ', data);
        //TODO: push notification - success
    })
    response.send(responseStartTemplate + bookResponseTemplate + responseEndTemplate);

}
