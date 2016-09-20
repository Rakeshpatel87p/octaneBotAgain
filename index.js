// Present user immediately w/ drink options

// Output drink summary

// Set up payment request

// Q's for Victor:
// Is my connection to MLabs properly set up?

// 'use strict'

var
    express = require('express'),
    router = express.Router(),
    mongodb = require('mongodb'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bodyParser = require('body-parser'),
    Request = require('request'),
    port = process.env.PORT || 8080,
    app = express(),
    ObjectID = mongodb.ObjectID,
    Heroku_URI = 'https://salty-chamber-30914.herokuapp.com',
    // MONGOLAB_URI = "mongodb://Rakeshpatel87p:Printer1@ds035846.mlab.com:35846/coffeedrinkinfo",
    db;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static('public'));
// Need this anymore?
// app.set('port', (process.env.PORT || 8080))

// Connect to the database before starting the application server.
mongoose.connect(process.env.MONGOLAB_URI, function(err, database) {
    if (err) {
        console.log(err);
        process.exit(1);
    }

    db = database;
    console.log('Database connection ready captain')

    var server = app.listen(process.env.PORT || 8080, function() {
        var port = server.address().port;
        console.log('App now running on port', port)
    });

});

var CoffeeDrinkSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    price: { type: Number },
});

// For accessing /webhook locally??
// app.use(function(req, res, next){
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   next();
// })

var CoffeeDrink = mongoose.model('CoffeeDrink', CoffeeDrinkSchema);

// index
app.get('/', function(req, res) {
    res.send('hello world i am a secret bot')
})

// for facebook verification
app.get('/webhook', function(req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token');
    sendMenuMessage();
})

// to post data
app.post('/webhook', function(req, res) {
    var messaging_events = req.body.entry[0].messaging;
    for (var i = 0; i < messaging_events.length; i++) {
        var event = req.body.entry[0].messaging[i];
        var sender = event.sender.id;
        if (event.message && event.message.text) {
            var text = event.message.text
            if (text === 'order') {
                sendMenuMessage(sender)
                continue
            }
        }
        if (event.postback) {
            // How to make this work so that start overs are redirected?
            var postbackText = JSON.stringify(event.postback.payload)
            console.log('this is the postbackText--------------', postbackText);
            if (postbackText === "start_over") {
                sendMenuMessage(sender)
                process.exit();
            }
            CoffeeDrink.findOne({ name: event.postback.payload }, function(err, coffeeDrink) {
                if (err) {
                    console.log(err)
                }
                orderSummaryMessage(sender, coffeeDrink)


            })
        }
    }
    res.sendStatus(200)
});

app.post('/drinkInfo', function(req, res) {
    CoffeeDrink.create({ name: req.body.drinkName, price: req.body.price }, function(err, newDrinkEntry) {
        if (err) {
            res.status(500).json(err)
        };
        res.status(201).json(newDrinkEntry);
    });
});

app.get('/drinkInfo/:drink', function(req, res) {
    CoffeeDrink.findOne({ name: req.params.drink }, function(err, coffeeDrink) {
        if (err) {
            res.status(500).json(err);
        };

        res.status(201).json(coffeeDrink)
    });
});


// recommended to inject access tokens as environmental variables, e.g.
// const token = process.env.PAGE_ACCESS_TOKEN
const token = "EAALR6yLCTuoBALKsjMzUnGMnmxV5jfSvJY3l1XAUbNYA7Mgl31TFAvT9QEkXxy0uklBPyeWdLFroZBf6hdTXX1ZBYPKCSUaTdDHdnxhpaaRhpCk50kvMzDVOZBCHzgO6IzXXq6JC1OX7aZBIn0xHFH8nydrFe5rU7pvGjZCs6tQZDZD";

function sendTextMessage(sender, text) {
    var messageData = { text: text }
    Request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendMenuMessage(sender) {
    var messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                        "title": "House Coffee",
                        "subtitle": "Freshly brewed, brought to you from la montanas de Honduras. $3.00",
                        "image_url": "http://wtop.com/wp-content/uploads/2015/03/getty_030315_coffee.jpg",
                        "buttons": [{
                            "type": "postback",
                            "title": "Order Me!",
                            "payload": "House_Coffee"

                        }],
                    },

                    {
                        "title": "Cappuccino",
                        "subtitle": "Italian Coffee drink, prepared with 2 shots of espresso, hot milk, and steamed milk foam. (Let drooling commence) $4.00.",
                        "image_url": "http://del.h-cdn.co/assets/15/45/980x490/landscape-1446486666-giulia-mule.jpg",
                        "buttons": [{
                            "type": "postback",
                            "title": "No, Pick Me!",
                            "payload": "Cappuccino"

                        }],
                    },

                    {
                        "title": "Cortado",
                        "subtitle": "Equal parts espresso and steamed milk. 5 ounches total volume. We got you! $3.00",
                        "image_url": "https://upload.wikimedia.org/wikipedia/commons/1/16/Caf%C3%A9Cortado(Tallat).jpg",
                        "buttons": [{
                            "type": "postback",
                            "title": "Here Here!",
                            "payload": "Cortado",

                        }],
                    }, {
                        "title": "In Limited Release",
                        "subtitle": "If we dont have your drink, you'll have to use our beautiful register",
                        "buttons": [{
                            "type": "postback",
                            "title": "Click If You Want This Option!",
                            "payload": "Other users"
                        }],
                    }
                ]
            }
        }
    };

    Request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function orderSummaryMessage(sender, coffeeDrink) {
    var messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": coffeeDrink.name + ' order.',
                    "subtitle": 'For $' + coffeeDrink.price,
                    "buttons": [{
                        "type": "postback",
                        "title": "Confirm",
                        "payload": 'confirmed'
                    }, {
                        "type": "postback",
                        "title": "Start Over",
                        "payload": "start_over"
                    }]
                }]
            }
        }
    };
    Request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: messageData
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

exports.app = app;
