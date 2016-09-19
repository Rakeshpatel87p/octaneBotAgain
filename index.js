'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

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
    res.send('Error, wrong token')
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
                    "buttons": [{
                        "title": "Order Me!"
                    }, {
                        "title": "Checkout",
                        // "payload": "Payload for first element in a generic bubble",
                    }],
                } 
                // {
                //     "title": "Cappuccino",
                //     "subtitle": "Italian Coffee drink, prepared with 2 shots of espresso, hot milk, and steamed milk foam. $3.45.",
                //     "buttons": [{
                //         "type": "order",
                //         "title": "Order Me!",
                //         // "payload": "Payload for second element in a generic bubble",
                //     }, {
                //         "type": 'checkout',
                //         "title": 'Checkout'
                //     }],
                // }, {
                //     "title": "Cortado",
                //     "subtitle": "Equal parts espresso and steamed milk. 5 ounches total volume. $3.00.",
                //     "buttons": [{
                //         "type": "order",
                //         "title": "Order Me!",
                //         // "payload": "Payload for second element in a generic bubble",
                //     }, {
                //         "type": 'checkout',
                //         "title": 'Checkout'
                //     }],
                // }
                ]
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

// let messageData = {
//     attachment: {
//         type: 'template',
//         payload: {
//             template_type: 'generic',
//             elements: [{
//                 title: 'House Coffee',
//                 subtitle: 'Freshly brewed, brought to you from Honduras.',
//                 buttons: [
//                 {
//                 	type: 'orderMe',
//                 	title : 'Order Me'
//                 },

//                 {
//                 	type: 'checkOut',
//                 	title: 'Check Out'
//                 }
//                 ]
//             }, {
//                 title: 'Cappuccino',
//                 subtitle: 'Italian Coffee drink, prepared with 2 shots of espresso, hot milk, and steamed milk foam. $3.45.',
//                 buttons: [
//                 {
//                 	type: 'orderMe',
//                 	title : 'Order Me'
//                 },

//                 {
//                 	type: 'checkOut',
//                 	title: 'Check Out'
//                 }
//                 ]
//             }, {
//                 title: 'Cortado',
//                 subtitle: 'Equal parts espresso and steamed milk. 5 ounches total volume. $3.00.',
//                 buttons: [
//                 {
//                 	type: 'orderMe',
//                 	title : 'Order Me'
//                 },

//                 {
//                 	type: 'checkOut',
//                 	title: 'Check Out'
//                 }
//             }]
//         }
//     }
// };

// spin spin sugar
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

// curl -X POST "https://graph.facebook.com/v2.6/me/subscribed_apps?access_token=EAALR6yLCTuoBAMWHH6iaHUqPlwMM1dTUyKzjuZBodoqXRAPkq14x5JZAIaHE7KIA9gMxhwxUWhBmcXKZBRcLLecKAeZCZAJ4qehSZA3FHzXEpczahTwxaYow3hPGp7XtSZCEr5upEUMslUZC1bgXeP39EgHyU2JDNXnZBWmdQLG7voQZDZD"
