var user_agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.94 Safari/537.4';
var Browser = require("zombie");
var async = require('async');
var fs = require('fs');

// visit the url
var browserVisit = function(url, cb) {
    var browser = new Browser({userAgent: user_agent, debug: true, waitFor: 10000, maxWait: 1000, silent:true});
    //var url = 'http://www.olacabs.com/book?cityID=3&pickupDate=15%2F02%2F2015&pickupTime=09%3A30+AM&airportType=ap_to&serviceType=3';
    console.log('url: ', url);
    browser.visit(url, function (error, data) {
        write(browser.html(), 'p1.html');
        console.log('Email Address: ' + browser.text('#bookingContent > table > tbody > tr:nth-child(2) > td.inputLabels'));
        var tag = browser.text('#bookingContent > table > tbody > tr:nth-child(2) > td.inputLabels');
        if( tag != 'Email Address') {
            return cb('Page 1 [Email Address] error', null);
        }
        return cb(null, browser);
    });
};

// step 1 - fill email address
var step1 = function(browser, user, cb) {
    browser.fill('#email', user.email)
        .pressButton('#bookingContent > table > tbody > tr:nth-child(5) > td:nth-child(2) > button', function (data, error) {
            write(browser.html(), 'p2.html');
            console.log('Travellers details: ' + browser.text('#bookingContent > h2:nth-child(3)'));
            var tag = browser.text('#bookingContent > h2:nth-child(3)');
            if(tag != 'Traveller\'s details') {
                return cb('Page 2 [Booking Details] Error', null);
            }
            cb(null, browser);
        })
};

//step 2 - fill booking details
var step2 = function(browser, user, bookingDetails, cb) {

    browser.fill('#customerName',user.name)
        .fill('#customerPhone', user.phone)
        .select('#pickupLocality', bookingDetails.pickupLocality)
        .fill('#pickupAddress', bookingDetails.pickupAddress)
        .select('#dropLocality',bookingDetails.dropLocality)
        .fill('#dropAddress',bookingDetails.dropAddress)
        .pressButton('#bookingContent > div:nth-child(14) > button', function(data, error){
            write(browser.html(), 'p3.html');
            console.log(browser.text('#bookingContent > h2'));
            var tag = browser.text('#bookingContent > h2');
            if(tag != 'Review Details') {
                return cb('Page 3 [Review Details] error', null);
            }
            cb(null, browser);
        });
};


//step 3 - review and confirm
var step3 = function(browser, cb) {
    browser.check('#tncCB')
        .pressButton('#submitId', function(data, error) {
            write(browser.html(), 'p4.html');

            var response = browser.text('#bookingContent > div');
            console.log('Response: ', response);
            if(response != null && response.contains('Thank you for using Olacabs. We have sent you an email and a SMS confirming your booking details. Hope you have a pleasant drive.')){
                var confirmationNumber = response.substring(response.indexOf('Your Reference No. :') + 'Your Reference No. :'.length, response.indexOf('Kindly use this your Reference'));
                var status = {status: 'success', confirmationNo: confirmationNumber}
                return cb(null, status);
            }
            var status = {status: 'error'}
            return cb(null, status);
        })
};


module.exports = {
     book : function(user, bookingDetails, cb) {

        var query = 'cityID=3&pickupDate=' + encodeURIComponent(bookingDetails.date) + '&pickupTime=' + encodeURIComponent(bookingDetails.time) + '&airportType=ap_to&serviceType=3';
        var url = 'http://www.olacabs.com/book?' + query;
        async.waterfall([
            function (callback) {
                browserVisit(url, callback);
            },
            function (browser, callback) {
                step1(browser, user, callback)
            },
            function (browser, callback) {
                step2(browser, user, bookingDetails, callback)
            }//,
            //function(browser, callback) {step3(browser, callback)}
        ], function (err, responses) {
            console.log('err: ', err);
            cb(err, responses);
        });
    }
};

var write = function(input, fname) {
    var stream = fs.createWriteStream(fname);
    stream.once('open', function(fd) {
        stream.write(input);
        stream.end();
    });
}
