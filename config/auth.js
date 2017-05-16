module.exports = {

    'facebookAuth': {
        'clientID': '1034525143315992', // your App ID
        'clientSecret': 'ee39d751432e62024b1fee75f275e91e', // your App Secret
        // 'callbackURL': 'http://localhost:3000/auth/facebook/callback',
        'callbackURL': 'https://shopify-webapp.herokuapp.com/auth/facebook/callback',
        'profileFields': ['emails', 'displayName']
    },

    'twitterAuth': {
        'consumerKey': 'wJ7d4ajmqOS5jsWO31MqpSdWN',
        'consumerSecret': 'xhrhV9fBbTqLDDpSZtLN2aM39KK4Rkw4aN0Oo4CRzzKMOoOQsN',
        // 'callbackURL': 'http://localhost:3000/auth/twitter/callback'
        'callbackURL': 'https://shopify-webapp.herokuapp.com/auth/twitter/callback'
    },

    'googleAuth': {
        'clientID': '105159512048-2da243kh38390f2hqr90lqt66ca0km0c.apps.googleusercontent.com',
        'clientSecret': 'UynirhftOWkTw04FP4dKd478',
        // 'callbackURL': 'http://localhost:3000/auth/google/callback'
        'callbackURL': 'https://shopify-webapp.herokuapp.com/auth/google/callback'
    }

};