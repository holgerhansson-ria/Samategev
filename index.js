'use strict';

const express = require('express');
const simpleOauthModule = require('simple-oauth2');
const uid = require('rand-token').uid;
const requestModule = require('request');

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
    secret: process.env.SECRET,
  },
  auth: {
    tokenHost: 'https://github.com',
    tokenPath: '/login/oauth/access_token',
    authorizePath: '/login/oauth/authorize',
  },
});

// Generate a 16 character alpha-numeric token:
var token = uid(16);

/* Pärime skoobid 'user' ja 'public_repo'. Vt https://developer.github.com/apps/building-integrations/setting-up-and-registering-oauth-apps/about-scopes-for-oauth-apps/ */

// Authorization uri definition
const authorizationUri = oauth2.authorizationCode.authorizeURL({
  redirect_uri: 'https://samategev.herokuapp.com/OAuthCallback',
  scope: 'user public_repo',
  state: token,
});

// Suunamine rakendusele õigust andma (Githubis)
app.get('/auth', (req, res) => {
  console.log(authorizationUri);
  res.redirect(authorizationUri);
});

// Tagasipöördumispunkt, parsib autoriseerimiskoodi ja pärib juurdepääsutõendi
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

    // Juurdepääsutõendi saatmine küpsisesse panekuks - ettevalmistus
    res.cookie('GHtoend', JSON.stringify(token));

    /* Tuleks tagastada kasutaja nimi
       Kõigepealt pärida kasutaja nime Github-st
      Vt. https://developer.github.com/v3/users/#get-the-authenticated-user */
    const GithubAPIURL = 'https://api.github.com/';
    var options = {
      url: GithubAPIURL + 'user',
      headers: {
        'User-Agent': 'Samatekst',
        'Authorization': 'token ' + token.access_token
      }
    };
    requestModule(
      options,
      function (error, response, body) {
        if (error) {
          console.log('Viga kasutaja andmete pärimisel Github-st: ', error);  
        }
        if (response) {
          console.log('Kasutaja andmete päring Github-st - statusCode: ', response.statusCode);  
        }
        console.log('body: ', body);  
    });

    res.status(200)
      .render('pages/autenditud', { token: token });

    // Saadab päringuvastuses juurdepääsutõendi, kuvamiseks   
    /* return res
      .status(200)
      .json(token); */
  });
});

// Selgitada, mida see teeb
app.get('/success', (req, res) => {
  res.send('');
});

// Esilehe kuvamine
app.get('/', function (request, response) {
  response.render('pages/index');
});

// Veebiserveri käivitamine

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});


