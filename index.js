'use strict';

/* Node.js rakendus

 Märkmed

 * Pärime skoobid 'user' ja 'public_repo'. Vt https://developer.github.com/apps/building-integrations/setting-up-and-registering-oauth-apps/about-scopes-for-oauth-apps/

 */

/* 0 Abifunktsioonid
   ------------------------------------------
*/

/* 1 Sõltuvuste importimine
   ------------------------------------------
*/

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const simpleOauthModule = require('simple-oauth2');
const uid = require('rand-token').uid;
const qs = require('query-string');
// https://www.npmjs.com/package/query-string 
const requestModule = require('request');
require('request-debug')(requestModule);

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

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const CLIENT_SECRET = process.env.CLIENT_SECRET;

// OAuth ülesseadmine
const oauth2 = simpleOauthModule.create({
  client: {
    id: 'ParmaksonResearch',
    secret: CLIENT_SECRET,
  },
  auth: {
    tokenHost: 'https://tara-test.ria.ee',
    tokenPath: '/oidc/accessToken',
    authorizePath: '/oidc/authorize',
  },
});

// Authorization uri definition
/* const authorizationUri = oauth2.authorizationCode.authorizeURL({
  redirect_uri: 'https://samategev.herokuapp.com/Callback',
  scope: 'openid',
  state: token,
}); */

// Autentimispäringu saatmine
app.get('/auth', (req, res) => {
  // Generate a 16 character alpha-numeric token:
  var token = uid(16);
  var u = 'https://tara-test.ria.ee/oidc/authorize?' + qs.stringify({
    redirect_uri: 'https://samategev.herokuapp.com/Callback',
    scope: 'openid',
    state: token,
    response_type: 'code',
    client_id: 'ParmaksonResearch'
  });
  console.log('autentimispäring: ', u);
  res.redirect(u);
});

// Tagasipöördumispunkt, parsib autoriseerimiskoodi ja pärib identsustõendi
app.get('/Callback', (req, res) => {
  const code = req.query.code;
  console.log('volituskood: ', code);
  const returnedState = req.query.state;
  console.log('tagastatud state: ', returnedState);
  var options = {
    url: 'https://tara-test.ria.ee/oidc/accessToken',
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',      'Authorization': 'Basic ' + CLIENT_SECRET
    },
    form: {
      'grant_type': 'authorization_code',
      'code': code,
      'redirect_uri': 'https://samategev.herokuapp.com/Callback',
      'client_id': 'ParmaksonResearch'
    }
  };
  requestModule(
    options,
    function (error, response, body) {
      if (error) {
        console.log('Viga identsustõendi pärimisel: ', error);
        return;
      }
      if (response) {
        console.log('Identsustõendi pärimine - statusCode: ', response.statusCode);
      }
      var saadudAndmed = JSON.parse(body);
      console.log('Saadud identsustõend: ', saadudAndmed.id_token);
      // res.status(200)
      //  .render('pages/autenditud', { kasutaja: saadudAndmed.login });
    });
  
  /*
  oauth2.authorizationCode.getToken(options, (error, result) => {
    if (error) {
      console.error('Viga juurdepääsutõendi pärimisel', error.message);
      return res.json('Autentimine ebaõnnestus');
    }
    console.log('Saadud TARA-teenusest juurdepääsutõend: ', result);
    // Selgitada, milleks järgnev kasulik on
    //const token = oauth2.accessToken.create(result);
    // Juurdepääsutõendi saatmine küpsisesse panekuks - ettevalmistus
    // res.cookie('GHtoend', JSON.stringify(token));
    res.redirect('/autenditud');
  });
  */
});

function accessTokenFromCookies(req) {
  /* Juurdepääsutõendi väljavõtmine päringuga saadetud küpsisest */
  const GHtoend = req.cookies.GHtoend;
  const access_token = JSON.parse(GHtoend).token.access_token;
  console.log('Päringuga kaasas juurdepääsutõend: ' + access_token);
  return access_token;
}

/* Tuleb esimest korda küpsisest kaasapandud juurdepääsutõendiga */
app.get('/autenditud', (req, res) => {
  const access_token = accessTokenFromCookies(req);
  /* Pärime kasutaja nime Github-st Vt. https://developer.github.com/v3/users/#get-the-authenticated-user
  */
  const GithubAPIURL = 'https://api.github.com/';
  var options = {
    url: GithubAPIURL + 'user',
    headers: {
      'User-Agent': 'Samategev',
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

app.post('/salvesta', (req, res) => {
  console.log(req.body);
  var fNimi = req.body.failinimi;
  var sTekst = req.body.salvestatavtekst;
  const access_token = accessTokenFromCookies(req);
  /* Salvestame teksti Githubi. Vt https://developer.github.com/v3/repos/contents/#create-a-file 
  PUT /repos/:owner/:repo/contents/:path
  */

  var buffer = new Buffer(sTekst);
  var toBase64 = buffer.toString('base64');

  var sisu = {
      message: 'Testimine',
      committer: { 
        name: "Priit Parmakson",
        email: "priit.parmakson@gmail.com"
      },
      content: toBase64
    };

  const GithubAPIURL = 'https://api.github.com/';
  var options = {
    method: 'PUT',
    url: GithubAPIURL + 'repos/PriitParmakson/Samategev/contents/' + fNimi,
    headers: {
      'User-Agent': 'Samategev',
      'Authorization': 'token ' + access_token
    },
    json: true,
    body: sisu
  };
  requestModule(
    options,
    function (error, response, body) {
      var vastus;
      if (error) {
        vastus = 'Viga faili salvestamisel Github-i: ' + error;
        console.log('Viga faili salvestamisel Github-i: ', error);
      }
      if (response) {
        console.log('Faili salvestamine Github-i - statusCode: ', response.statusCode);
        if (response.statusCode == 201) {
          vastus = 'Salvestatud';
        }
        else {
          vastus = 'Salvestamine ebaõnnestus. Kood: ' + response.statusCode;
        }
      }
      res.status(200)
        .render('pages/salvestatud', { vastus: vastus });
    });
})

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
  console.log('---- Node rakendus töötab ----');
});


