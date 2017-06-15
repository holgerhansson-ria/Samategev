---
title: Samategev
---

[https://samategev.herokuapp.com](https://samategev.herokuapp.com)

kood: [https://github.com/PriitParmakson/Samategev](https://github.com/PriitParmakson/Samategev)

# "Node.js-Heroku-OAuth-Github" demonstraator 
{: .no_toc}

Rakendus: 1) autentib kasutaja GitHub-i OAuth autentimisteenuse abil; 2) salvestab kasutaja sisestatud teksti kasutaja GitHub-i reposse, eraldi failina.

Sisukord

- TOC
{:toc}

## Tööriistad ja tehnoloogiad

Rakendus koosneb kasutaja veebisirvijas töötavast osast ja serveriosast.

Veebisirvija osas on kasutatud standardseid tehnoloogiaid: [HTML5](https://html.spec.whatwg.org/multipage/), [Javascript](https://www.ecma-international.org/publications/standards/Ecma-262.htm), [CSS](https://www.w3.org/Style/CSS/Overview.en.html), [Bootstrap 4](https://v4-alpha.getbootstrap.com/), [JQuery](https://jquery.com/).
 
Serveriosa põhineb [Node.js](https://nodejs.org/en/)-l, kasutusel on komponendid: [Express](https://expressjs.com/), [request](https://www.npmjs.com/package/request) (simplified HTTP request client), [body-parser](https://www.npmjs.com/package/body-parser), [cookie-parser](https://www.npmjs.com/package/cookie-parser) jt.
Aluseks on Heroku näide [getting-started-with-nodejs](https://devcenter.heroku.com/articles/getting-started-with-nodejs).

Rakendus on majutatud [Heroku]((https://devcenter.heroku.com/)) pilveteenusesse.

OAuth 2.0 klient on teostatud [simple-oauth2](http://lelylan.github.com/simple-oauth2/) alusel.

Dokumentatsioon on publitseeritud vahenditega: [GitHub](https://github.com/), [Markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet), [Jekyll](), [Liquid](https://shopify.github.io/liquid/), [Yaml](http://yaml.org/).

Töödokumentatsioonis on kasutusel ka: [Google Docs](https://docs.google.com/document/u/0/), [Google Apps Script](https://developers.google.com/apps-script/).

Töövahendid: [Git Bash (Windows)](https://git-for-windows.github.io/), [Visual Studio Code](https://code.visualstudio.com/), [npm](https://www.npmjs.com/), [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli), [Heroku veebi-dashboard](https://devcenter.heroku.com/), [curl](https://curl.haxx.se/) (Windows Git Bash koosseisus), [asciiflow](http://asciiflow.com/).

## Arhitektuurijoonis

Joonis 1
{: .joonis}

```
       ,+.
       `|'
       /|\
        +
       / \
    Kasutaja

+--------------+
|              |
| Veebisirvija |
|      osa     +-----------------------------------+
|              |                                   |
|              +----------------+                  |
+------+-------+                v                  v
       v
       O                        O                  O
       +                        +                  +
+------+-------+         +------+-------+  +-------+-------+
|              |         |              |  |               |
|   Serveri    |         | GitHub OAuth |  |   GitHub-i    |
|     osa      +-->  O+--+ autentimis-  |  |     repo      |
|              |         |   teenus     |  |               |
|   (Heroku)   |         |              |  |               |
+------+-------+         +--------------+  +-------+-------+
       |                                           +
       +-----------------------------------------> O

                                              GitHub API
```

<hr>

## OAuth autentimine (samm-sammuline sündmuste käik)

Rakenduse URL on:

`https://samategev.herokuapp.com`

1a. Avalehel esitatakse lühike teave rakenduse kohta ja ettepanek `Logi sisse GitHub-ga`.

1b. Kasutaja vajutab lingile `Logi sisse GitHub-ga`.

1c. Veebisirvijast läheb serverisse HTTP GET päring URL-ga `https://samategev.herokuapp.com/auth`:

PÄRING 1:

`HTTP GET https://samategev.herokuapp.com/auth`

1d. Server saadab päringule vastuseks ümbersuunamiskorralduse (_Redirect_) GitHub-i OAuth autentimisteenusesse. HTTP vastuse staatusekood on `302`. Ümbersuunamiskorralduses saadab server veebisirvijale GitHubi autentimisteenuse URL-i `https://github.com/login/oauth/authorize` ja veel viis olulist teabeelementi (nendest kohe allpool).

2a. Kasutaja veebisirvija saadab HTTP GET päringu ümbersuunamis-URL-le:

PÄRING 2

`HTTP GET https://github.com/login/oauth/authorize?redirect_uri=https://samategev.herokuapp.com/OAuthCallback&scope=user public_repo&state=OFfVLKu0kNbJ2EZk&response_type=code&client_id=ab5b4f1671a58e7ba35a`

Ümbersuunamis-URL-is on kuus OAuth autentimiseks vajalikku teabeelementi:

- GitHub-i autentimisteenuse URL (`https://github.com/login/oauth/authorize`) veel;
- tagasipöördumis-URL (`https://samategev.herokuapp.com/OAuthCallback`);
- õigused, mida rakendus kasutajalt küsib (`scope` - `user` (kasutaja profiiliandmed) ja `public_repo` (kirjutusõigus kasutaja repodesse));
- autentimise unikaalne identifikaator (server genereeris selle juhuslikult) `state`;
- autentimise tulemuse serverile edastamise viis - `code`;
- rakenduse identifikaator (`client_id`).

Rakenduse identifikaator on juhuslik sõne `ab5b4f1671a58e7ba35a`, mis moodustatakse rakenduse registreerimisel GitHub-is OAuth-i rakendusena.

Rakenduse registreerib GitHub-is rakenduse autor, oma konto all, valides `Settings` > `Developer Settings` > `OAuth Applications`. Otselink: [https://github.com/settings/developers](https://github.com/settings/developers).

Kuvapildistus 1
{: .joonis}

<img src='img/P1.PNG' width='80%'>

<hr>

Samas saab näha ka mitu kasutajat on rakendusel.

2b. GitHub-i autentimisteenus kuvab kasutajale õiguste andmise dialoogi.

Kuvapildistus 2
{: .joonis}

<img src='img/P2.PNG' width='80%'>

<hr>

2c. Kui kasutaja nõustub, siis palub GitHub-i autentimisteenus kinnituseks sisestada kasutaja GitHub-i konto parooli.

Märkus. Kasutaja saab nõusoleku GitHub-is igal ajal tagasi võtta. Otselink: [https://github.com/settings/applications](https://github.com/settings/applications).

2d. Seejärel saadab GitHub-i autentimisteenus kasutaja veebisirvijale ümbersuunamiskorralduse, millega veebisirvija suunatakse tagasi rakendusse:

PÄRING 3

`HTTP GET https://samategev.herokuapp.com/OAuthCallback?code=71ed5797c3d957817d31&state=OFfVLKu0kNbJ2EZk`

3a. Ümbersuunamis-URL-is paneb GitHub-i autentimisteenus kaasa turvakoodi (`code=71ed5797c3d957817d31`) ja rakenduse saadetud unikaalse identifikaatori (`state=OFfVLKu0kNbJ2EZk`). Turvakood on ühekordne "lubatäht" OAuth juurdepääsutõendi (_access token_) saamiseks. Unikaalne identifikaator (`state`) aitab tagada, et erinevate kasutajate autentimised sassi ei lähe.

3b. Server, saades selle päringu, teeb omakorda otsepäringu GitHub-i autentimisteenusesse, aadressile `https://github.com/login/oauth/access_token`.

PÄRING 4

`HTTP GET https://github.com/login/oauth/access_token?code=71ed5797c3d957817d31&client_secret=<...>`

4a. Päringule paneb server kaasa kaks asja: ülalnimetatud turvakoodi (`71ed5797c3d957817d31`) ja rakenduse nn salakoodi (`client_secret`).

Rakenduse salakood genereeritakse rakenduse registreerimisel GitHub-is. Erinevalt rakenduse identifikaatorist (`client_id`) on salakood salajane. Salakood võimaldab GitHub-il veenduda, et turvakoodi saadab ikka õige rakendus.

4b. GitHub-i autentimisteenus saadab turvakoodi vastu juurdepääsutõendi (_access token_).

`{ "token" : {
   "access_token" : "4e18c6770d4dedc317501faaf2963ef8009dcb6f",
   "token_type" : "bearer",
   "scope" : "public_repo,user",
   "expires_at":null }
  }`

4c. Server koostab nüüd vastuse päringule 3. Vastuses saadab server küpsise (_cookie_) veebisirvijasse asetamiseks. Küpsisesse paneb server GitHub-i autentimisteenusest saadud juurdepääsutõendi:

`GHtoend={"token":
{"access_token":"4e18c6770d4dedc317501faaf2963ef8009dcb6f",
"token_type":"bearer","scope":"public_repo,user","expires_at":null}}
; Path=/`

Vastus sisaldab ka ümbersuunamiskorraldust rakenduse lehele `/autenditud`.

5a. Veebisirvija salvestab saadud küpsise ja täidab korralduse, tehes järgmise pöördumise:

PÄRING 5

`HTTP GET https://samategev.herokuapp.com/autenditud`

Selles ja kõigis järgnevates päringutes paneb veebisirvija kaasa serverilt saadud küpsise (`GHtoend`). Tõend on kinnitus, et kasutaja GitHub-i identiteet on tuvastatud.

5b. Päringu 5 vastuseks tagastab server HTML-lehe, kus märgib, et kasutaja on autenditud ja kuvab ka kasutaja nime.

6a. Kust server kasutaja nime saab? Selleks teeb server päringu GitHub-i API-sse:

PÄRING 6

`HTTP GET https://api.github.com/user`

lisades päised (_HTTP Request Headers_):

```
User-Agent: Samategev,
 Authorization: token 4e18c6770d4dedc317501faaf2963ef8009dcb6f
```

`/user` tähendab kasutaja profiiliandmete pärimist.

6b. GitHub-i API tagastab juurdepääsutõendile vastava GitHub-i kasutaja profiiliandmed (nime jm).

6c. Server lisab saadud nime kasutajale päringu 5 vastuseks tagastatavasse HTML-teksti:

Kuvapildistus 3
{: .joonis}

<img src='img/P3.PNG' width='80%'>

<hr>

Sellega on kasutaja autentimine (sisselogimine) lõppenud.

## Salvestamine GitHub-i

7a. Autenditud kasutaja saab nüüd sisestada failinime ja teksti.

Kuvapildistus 4
{: .joonis}

<img src='img/P4.PNG' width='80%'>

<hr>

7b. Vajutab nupule `Salvesta`. Nupp on HTML-vormi `Submit`-element. Veebisirvija saadab selle peale serverile HTTP POST päringu:

PÄRING 7

`HTTP POST https://samategev.herokuapp.com/salvesta`

Päringu parameetritena (`Form data`) saadetakse kasutaja sisestatud failinimi ja tekst:

```
failinimi: "MinuFail.md"
salvestatavtekst: "See on sisu."
```

(Veebisirvija paneb päringule kaasa ka küpsisesse salvestatud juurdepääsutõendi).

7c. Server saadab `HTTP PUT` päringu GitHub-i API-le:

PÄRING 8

`HTTP PUT https://api.github.com/repos/PriitParmakson/Samategev/contents/MinuFail.md`

lisades päringupäised (_Headers_):

`User-Agent: Samategev,
Authorization: token 4e18c6770d4dedc317501faaf2963ef8009dcb6f` 

Faili sisu saadetakse päringu kehas (`body`).

GitHub-i API salvestab faili.

Kuvapildistus 5
{: .joonis}

<img src='img/P5.PNG' width='80%'>

<hr>

## Ohud

OAuth on selles mõttes hea protokoll, et turvariskide kohta on kohe omaette dokument: [OAuth 2.0 Threat Model and Security Considerations](https://tools.ietf.org/html/rfc6819). Kahjuks ei piisa dokumendi läbilugemisest - ja ega esimese lugemisega palju aru saagi. Turvameetmeid tuleb rakendada mitmes kohas. See vajab mõtlemist ja tähelepanu, sest võimalusi "ämbrisse astumiseks" on palju. GitHub teeb OAuth autentimisteenuse pakkujana head tööd. Neil on jooksmas algoritmid, mis jälgivad muuhulgas ka seda, et keegi turvavõtmeid ja -tõendeid GitHub-i avalikesse repodesse üles ei laadiks. Mina tegin selle vea ja sain kohe hoiatuskirja:

Kuvapildistus 6
{: .joonis}

<img src='img/P6.PNG' width='95%'>

<hr>

## LISA Marsruutimisskeem (URL-de järjekord)

Joonis 2
{: .joonis}

```
                             Autentima
           Avaleht   +--->    "/auth"           R
     +-->    "/"                       +------+
     |                                        |
   R |                                        v
     |
     +                                      GitHub-i
Välja logima                                autentimisdialoogi
 "/logout"                                  lehed

      ^                                       +
      |                                       |
      |                                       |  R
      |                                       v
      |
      |                                   Autentimiselt
   Salvesta         Autenditud                tagasi
  "/salvesta" <--+  "/autenditud"  <----+ "/OAuthCallback"

                                     R


   R = ümbersuunamine (redirect)
```

