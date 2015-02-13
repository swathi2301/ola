var express = require('express');
var morgan = require("morgan");
var bookCab = require('./book');
var utility = require('./utility');

var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(morgan('combined'));
app.use(express.static(__dirname + '/public'));


//TODO: move all template strings to jade
//@txtola: d5274899-d6d5-40a5-b461-7d444203908b
var responseStartTemplate = '<html> <head> <title> Ola! </title> <meta http-equiv=\'Content-Type\' content=\'text/html; charset=UTF-8\' /> <meta name=\'txtweb-appkey\' content=\'c8fdc5e0-056b-4c99-ac5f-95ba249b1e92\' /></head><body>';
var responseEndTemplate = '</body></html>';

var registrationTemplateString = 'Register using @ola reg email:&lt;email address&gt; phone:&lt;phone number&gt; name:&lt;name&gt;';
var registrationSuccessfulTemplateString = 'Registration complete! ';

var bookTemplateString = 'Book using @ola book date:&lt;dd/mm/yyyy&gt; time:&lt;hh:mm&gt; AM/PM from:&lt;from locality&gt; to:&lt;to locality&gt; faddr:&lt;from address&gt; taddr:&lt;to address&gt;'
var bookErrorResponseTemplate = 'There was an error booking your cab. Please try again later';
var bookSuccessResponseTemplate = 'Successfully booked you cab. Ola confirmation number: ';

// Happy happy scenarios. TODO: handle every single exception
app.get('/', function(request, response) {

    var txtWebMsg = request.param('txtweb-message');
    var txtWebMobile = request.param('txtweb-mobile');

    console.log('txtWebMsg: ', txtWebMsg, 'hash number: ', txtWebMobile);

    if(/reg .*/g.test(txtWebMsg)){
        return handleRegistrationMessage(response, txtWebMsg, txtWebMobile);
    }

    if(/book .*/g.test(txtWebMsg)) {
         handleBookMessage(response, txtWebMsg, txtWebMobile, function(err, data) {
            //TODO: async.
            if(err) {
                return response.send(responseStartTemplate + bookErrorResponseTemplate + responseEndTemplate);
            }
             else {
                return response.send(responseStartTemplate + bookSuccessResponseTemplate + data.confirmationNo + responseEndTemplate)
            }
        });
    } else {
        return handleEmptyMessage(response, txtWebMobile);
    }

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

function handleBookMessage(response, txtWebMsg, txtWebMobile, cb) {
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

        //TODO: push notification failure

        //TODO: push notification - success
        return cb(err, data);
    });
    //return response.send(responseStartTemplate + bookSuccessResponseTemplate + responseEndTemplate);

}
