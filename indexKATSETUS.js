'use strict';

// Siit läheb käima

const { Issuer } = require('openid-client');
// Tarnib objektid Issuer, Registry, Strategy ja TokenSet

// const { Issuer } = require('..');

/* Teenuseparameetrite seadmine (discovery) - käsitsi
  Tehniliselt: klassi Issuer isendi loomine
  Vt https://www.npmjs.com/package/openid-client#get-started
  Teenuseparameetrid vt: https://tara-test.ria.ee/oidc/.well-known
*/
const TARAteenus = new Issuer({
  issuer: 'https://tara-test.ria.ee',
  authorization_endpoint: '"https://tara-test.ria.ee/oidc/authorize',
  token_endpoint: '"https://tara-test.ria.ee/oidc/accessToken',
  userinfo_endpoint: '"https://tara-test.ria.ee/oidc/profile',
  jwks_uri: '"https://tara-test.ria.ee/oidc/jwks',
});
console.log('Teenuseparameetrid seatud: %s', JSON.stringify(TARAteenus));

/*
const {
  ISSUER = 'https://tara-test.ria.ee',
  PORT = 3001,
} = process.env;
*/

// Klassi Client isendi moodustamine
const client = new TARAteenus.Client({
  client_id: 'ParmaksonResearch',
  client_secret: process.env.CLIENT_SECRET
}); // => Client

// Autentimispäringu URL-i moodustamine
var u = client.authorizationUrl({
  redirect_uri: 'https://samategev.herokuapp.com/Callback',
  scope: 'openid',
}); // => String (URL)

console.log('Autentimis-URL: ' + u);

const appFactory = require('./app');
const app = appFactory(TARAteenus);
app.listen(443);

/*

Issuer.discover(ISSUER).then((issuer) => {
  const app = appFactory(issuer);
  app.listen(PORT);
}).catch((err) => {
  console.error(err); // eslint-disable-line no-console
  process.exit(1);
});

*/