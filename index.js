// Present user immediately w/ drink options

// Output drink summary

// Set up payment request

// Q's for Victor:
// How to access webhook? Wrong Error Token message

// 'use strict'

var 
	express = require('express'),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	bodyParser = require('body-parser'),
	request = require('request'),
	port = process.env.PORT || 8080,
	app = express();
	
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))	
// parse application/json
app.use(bodyParser.json())

app.set('port', (process.env.PORT || 8080))

app.use(express.static('public'));
mongoose.connect('mongodb://localhost/drinkPrices');

mongoose.connection.on('error', function(err) {
    console.error('Could not connect. Error', err)
});

var coffeeDrinkSchema = mongoose.Schema({
	name: {type: String, unique: true},
	price: {type: Number},
})

// For accessing /webhook locally??
// app.use(function(req, res, next){
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   next();
// })

var CoffeeDrink = mongoose.model('CoffeeDrink', coffeeDrinkSchema);

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
    sendGenericMessage();
})

// to post data
app.post('/webhook', function(req, res) {
    var messaging_events = req.body.entry[0].messaging;
    console.log('messaging events-----------', messaging_events);
    for (var i = 0; i < messaging_events.length; i++) {
        var event = req.body.entry[0].messaging[i]
        var sender = event.sender.id
        console.log('sender from post function----------', sender);
        if (event.message && event.message.text) {
            var text = event.message.text
            if (text === 'Generic') {
                sendGenericMessage(sender)
                continue
            }
            sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
        }
        if (event.postback) {
            var text = JSON.stringify(event.postback)
            sendTextMessage(sender, "Postback received: " + text.substring(0, 200), token)
            continue
        }
    }
    res.sendStatus(200)
});

app.post('/drinkInfo', function(req, res){
	 CoffeeDrink.create({name: req.body.drinkName, price: req.body.price}, function(err, newDrinkEntry){
	 	if (err) {
	 		res.status(500).json(err)
	 	}; 
	 	res.status(201).json(newDrinkEntry);
	 });
});

app.get('/drinkInfo/:drink', function(req, res){
	var coffeeDrink = req.params.drink;
	console.log('this is the drink', coffeeDrink);
	CoffeeDrink.find(function(err, coffeeDrinks){
		if (err) {
			res.status(500).json(err);
		}; 
		res.status(201).json(coffeeDrinks)
	});
});


// recommended to inject access tokens as environmental variables, e.g.
// const token = process.env.PAGE_ACCESS_TOKEN
const token = "EAALR6yLCTuoBALKsjMzUnGMnmxV5jfSvJY3l1XAUbNYA7Mgl31TFAvT9QEkXxy0uklBPyeWdLFroZBf6hdTXX1ZBYPKCSUaTdDHdnxhpaaRhpCk50kvMzDVOZBCHzgO6IzXXq6JC1OX7aZBIn0xHFH8nydrFe5rU7pvGjZCs6tQZDZD";

function sendTextMessage(sender, text) {
    var messageData = { text: text }
    console.log('sender from sendTextMessage function----------', sender);
    request({
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

function sendGenericMessage(sender) {
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
                        "payload": "House Coffee"

                    }, {
                        "type": "postback",
                        "title": "Checkout",
                        "payload": "Check out"
                    }],
                },

                {
                    "title": "Cappuccino",
                    "subtitle": "Italian Coffee drink, prepared with 2 shots of espresso, hot milk, and steamed milk foam. (Let drooling commence) $4.00.",
                    "image_url": "http://del.h-cdn.co/assets/15/45/980x490/landscape-1446486666-giulia-mule.jpg",
                    "buttons": [{
                        "type": "postback",
                        "title": "Order Me!",
                        "payload": "Cappuccino"

                    }, {
                        "type": "postback",
                        "title": "Checkout",
                        "payload": "Checkout"
                    }],
                },

                {
                    "title": "Cortado",
                    "subtitle": "Equal parts espresso and steamed milk. 5 ounches total volume. We got you! $3.00",
                    "image_url": "https://upload.wikimedia.org/wikipedia/commons/1/16/Caf%C3%A9Cortado(Tallat).jpg",
                    "buttons": [{
                        "type": "postback",
                        "title": "Order Me!",
                        "payload": "Cortado",

                    }, {
                        "type": "postback",
                        "title": "Checkout",
                        "payload": "Checkout",
                    }],
                },
                {
                	"title": "In Limited Release",
                	"subtitle": "If we dont have your drink, you'll have to use our beautiful register",
                	"subtitle": "Click the button below PLEASE if you like this feature!",
                	"buttons": [{
                		"type": "postback",
                		"title": "You like me!",
                		"payload": "Other users"
                	}],
                }]
            }
        }
    };

    request({
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

// spin spin sugar
app.listen(process.env.PORT || 8080);
exports.app = app;

// app.listen(app.get('port'), function() {
//     console.log('running on port', app.get('port'))
// })

// curl -X POST "https://graph.facebook.com/v2.6/me/subscribed_apps?access_token=EAALR6yLCTuoBAMWHH6iaHUqPlwMM1dTUyKzjuZBodoqXRAPkq14x5JZAIaHE7KIA9gMxhwxUWhBmcXKZBRcLLecKAeZCZAJ4qehSZA3FHzXEpczahTwxaYow3hPGp7XtSZCEr5upEUMslUZC1bgXeP39EgHyU2JDNXnZBWmdQLG7voQZDZD"
