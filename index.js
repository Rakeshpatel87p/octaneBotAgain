// Present user immediately w/ drink options

// Set up MongoDB and find prices of drinks
// Output drink summary

// Set up payment request

// Q's for Victor:
// How to login to my heroku webhook?

'use strict'

const 
	express = require('express'),
	bodyParser = require('body-parser'),
	request = require('request'),
	app = express();

app.set('port', (process.env.PORT || 5000))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// index
app.get('/', function(req, res) {
    res.send('hello world i am a secret bot')
})

// for facebook verification
app.get('/webhook/', function(req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token');
    sendGenericMessage();
})

// to post data
app.post('/webhook/', function(req, res) {
    let messaging_events = req.body.entry[0].messaging;
    console.log('messaging events-----------', messaging_events);
    for (let i = 0; i < messaging_events.length; i++) {
        let event = req.body.entry[0].messaging[i]
        let sender = event.sender.id
        if (event.message && event.message.text) {
            let text = event.message.text
            if (text === 'Generic') {
                sendGenericMessage(sender)
                continue
            }
            sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
        }
        if (event.postback) {
            let text = JSON.stringify(event.postback)
            sendTextMessage(sender, "Postback received: " + text.substring(0, 200), token)
            continue
        }
    }
    res.sendStatus(200)
})


// recommended to inject access tokens as environmental variables, e.g.
// const token = process.env.PAGE_ACCESS_TOKEN
const token = "EAALR6yLCTuoBALKsjMzUnGMnmxV5jfSvJY3l1XAUbNYA7Mgl31TFAvT9QEkXxy0uklBPyeWdLFroZBf6hdTXX1ZBYPKCSUaTdDHdnxhpaaRhpCk50kvMzDVOZBCHzgO6IzXXq6JC1OX7aZBIn0xHFH8nydrFe5rU7pvGjZCs6tQZDZD";

function sendTextMessage(sender, text) {
    let messageData = { text: text }

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
    let messageData = {
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
                    "subtitle": "Italian Coffee drink, prepared with 2 shots of espresso, hot milk, and steamed milk foam. $3.45.",
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
                    "subtitle": "Equal parts espresso and steamed milk. 5 ounches total volume. $3.00",
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
                	"subtitle": "We want to explore if this is something our customers would use. If we dont have your drink, you'll have to use our beautiful register",
                	"subtitle": "Click the button if you would use this feature!",
                	"buttons": [{
                		"type": "postback",
                		"title": "You like me",
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
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

// curl -X POST "https://graph.facebook.com/v2.6/me/subscribed_apps?access_token=EAALR6yLCTuoBAMWHH6iaHUqPlwMM1dTUyKzjuZBodoqXRAPkq14x5JZAIaHE7KIA9gMxhwxUWhBmcXKZBRcLLecKAeZCZAJ4qehSZA3FHzXEpczahTwxaYow3hPGp7XtSZCEr5upEUMslUZC1bgXeP39EgHyU2JDNXnZBWmdQLG7voQZDZD"
