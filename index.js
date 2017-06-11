'use strict';

const express = require('express');
const simpleOauthModule = require('simple-oauth2');

// Veebiserveri ettevalmistamine
const app = express();
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// OAuth ülesseadmine
const oauth2 = simpleOauthModule.create({
  client: {
    id: 'ab5b4f1671a58e7ba35a',
    secret: 'd276beb0af7d09ad1a2d5a74df280029dd9d2dbd',
  },
  auth: {
    tokenHost: 'https://github.com',
    tokenPath: '/login/oauth/access_token',
    authorizePath: '/login/oauth/authorize',
  },
});

// Authorization uri definition
const authorizationUri = oauth2.authorizationCode.authorizeURL({
  redirect_uri: 'https://samategev.herokuapp.com/OAuthCallback',
  scope: 'notifications',
  state: '3(#0/!~',
});

// Initial page redirecting to Github
app.get('/auth', (req, res) => {
  console.log(authorizationUri);
  res.redirect(authorizationUri);
});

// Callback service parsing the authorization token and asking for the access token
app.get('/OAuthCallback', (req, res) => {
  const code = req.query.code;
  const options = {
    code,
  };

  oauth2.authorizationCode.getToken(options, (error, result) => {
    if (error) {
      console.error('Access Token Error', error.message);
      return res.json('Authentication failed');
    }

    console.log('The resulting token: ', result);
    const token = oauth2.accessToken.create(result);

    return res
      .status(200)
      .json(token);
  });
});

// Selgitada, mida see teeb
app.get('/success', (req, res) => {
  res.send('');
});

// Esilehe kuvamine
app.get('/', function(request, response) {
  response.render('pages/index');
});

// Veebiserveri käivitamine

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


