'use strict';

/* Märkmed

 * Pärime skoobid 'user' ja 'public_repo'. Vt https://developer.github.com/apps/building-integrations/setting-up-and-registering-oauth-apps/about-scopes-for-oauth-apps/

 */


/* 1 Sõltuvuste importimine
   ------------------------------------------
*/

const express = require('express');
const cookieParser = require('cookie-parser')
const simpleOauthModule = require('simple-oauth2');
const uid = require('rand-token').uid;
const requestModule = require('request');

/* 2 Objektide loomine ja konfigureerimine 
   -----------------------------------------
*/

// Veebiserveri ettevalmistamine
const app = express();
app.use(cookieParser());
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

// Authorization uri definition
const authorizationUri = oauth2.authorizationCode.authorizeURL({
  redirect_uri: 'https://samategev.herokuapp.com/OAuthCallback',
  scope: 'user public_repo',
  state: token,
});

/* 3 Marsruutimine
   -------------------------------------------
*/

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
      console.error('Viga juurdepääsutõendi pärimisel', error.message);
      return res.json('Autentimine ebaõnnestus');
    }
    console.log('==Juurdepääsutõend: ', result);
    // Selgitada, milleks järgnev kasulik on
    const token = oauth2.accessToken.create(result);
    // Juurdepääsutõendi saatmine küpsisesse panekuks - ettevalmistus
    res.cookie('GHtoend', JSON.stringify(token));
    res.redirect('/autenditud');
  });
});

app.get('/autenditud', (req, res) => {
  /* Juurdepääsutõendi väljavõtmine päringuga saadetud küpsisest */
  const GHtoend = req.cookies.GHtoend;
  console.log('GHtoend: ' + GHtoend);
  const access_token = JSON.parse(GHtoend).access_token;
  console.log('Ekstraheeritud juurdepääsutõend: ' + access_token);
  /* Pärime kasutaja nime Github-st Vt. https://developer.github.com/v3/users/#get-the-authenticated-user
  */
  const GithubAPIURL = 'https://api.github.com/';
  var options = {
    url: GithubAPIURL + 'user',
    headers: {
      'User-Agent': 'Samatekst',
      'Authorization': 'token ' + access_token
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
      var saadudAndmed = JSON.parse(body);
      console.log('kasutaja: ', saadudAndmed.login);
      res.status(200)
        .render('pages/autenditud', { kasutaja: saadudAndmed.login });
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

/* 4 Käimatõmbamine
   -------------------------------------------
*/

// Veebiserveri käivitamine
app.listen(app.get('port'), function () {
  console.log('Node rakendus töötab, port', app.get('port'));
});


