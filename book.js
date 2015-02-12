var user_agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.94 Safari/537.4';
var Browser = require("zombie");
var async = require('async');
var fs = require('fs');
//var browser = new Browser({userAgent: user_agent, debug: true, waitFor: 10000, maxWait: 1000, silent:true});


var browserVisit = function(cb) {
    var browser = new Browser({userAgent: user_agent, debug: true, waitFor: 10000, maxWait: 1000, silent:true});
    var url = 'http://www.olacabs.com/book?cityID=3&pickupDate=15%2F02%2F2015&pickupTime=09%3A30+AM&airportType=ap_to&serviceType=3';
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

var step1 = function(browser, cb) {
    browser.fill('#email', 'swathi.2301@gmail.com')
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

var step2 = function(browser, cb) {

    browser.fill('#customerName','swathi')
        .fill('#customerPhone', '9740532019')
        .select('#pickupLocality', 'Begur Road')
        .fill('#pickupAddress', 'Begur')
        .select('#dropLocality','Bellandur')
        .fill('#dropAddress','ecospace')
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


var step3 = function(browser, cb) {
    browser.check('#tncCB')
        .pressButton('#submitId', function(data, error) {
            write(browser.html(), 'p3.html');
            if(browser.html().contains('Thank you for using Olacabs. We have sent you an email and a SMS confirming your booking details. Hope you have a pleasant drive.')){
                return cb(null, 'success');
            }
            return cb(null, 'error');
        })
};


module.exports = {
     book : function(userInput, cb) {
        async.waterfall([
            function (callback) {
                browserVisit(callback);
            },
            function (browser, callback) {
                step1(browser, callback)
            },
            function (browser, callback) {
                step2(browser, callback)
            }
            //function(browser, callback) {step3(browser, callback)}
        ], function (err, responses) {
            console.log('Final response: ');
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
