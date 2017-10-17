'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const uid = require('rand-token').uid;
const qs = require('query-string');
// https://www.npmjs.com/package/query-string 
const requestModule = require('request');
require('request-debug')(requestModule);

// Veebiserveri ettevalmistamine
// https://expressjs.com/en/4x/api.html#app 
const app = express();
app.use(cookieParser());
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
// root directory from which to serve static assets
// http://expressjs.com/en/starter/static-files.html 
// https://expressjs.com/en/4x/api.html#express.static
app.set('views', __dirname + '/views');
// a directory for application's views
app.set('view engine', 'ejs');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const CLIENT_SECRET = process.env.CLIENT_SECRET;

// Esilehe kuvamine
app.get('/', function (req, res) {
  res.render('pages/index');
});

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
 
  // request mooduli kasutamisega
  var options = {
    url: 'https://tara-test.ria.ee/oidc/accessToken',
    method: 'POST',
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
        res.send(JSON.stringify(error));
        return;
      }
      if (response) {
        console.log('Identsustõendi pärimine - statusCode: ', response.statusCode);
      }
      var saadudAndmed = JSON.parse(body);
      console.log('Saadud identsustõend: ', saadudAndmed.id_token);
      res.send(saadudAndmed.id_token);
    });
  
});

// Veebiserveri käivitamine
app.listen(app.get('port'), function () {
  console.log('---- Node rakendus töötab ----');
});


