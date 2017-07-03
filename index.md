---
title: Samategev
---

# OAuth demorakendus 
{: .no_toc}

- TOC
{:toc}

## Ülevaade
Demorakenduse eesmärk on järgi proovida ja näitlikult kirjeldada mitme tehnoloogia kasutamine:

1) `Node.js` kui veebirakenduse serveripoolse komponendi raamistik;
2) `Heroku` kui majutusteenus;
3) `OAuth 2.0` kui autentimisraamistik;
4) `GitHub` kui salvestuslahendus.

Rakendus:
1) autendib kasutaja GitHub-i OAuth autentimisteenuse abil ja
2) salvestab kasutaja sisestatud teksti kasutaja GitHub-i reposse, eraldi failina.

Rakendus: [https://samategev.herokuapp.com](https://samategev.herokuapp.com).

Lähtekood: [https://github.com/PriitParmakson/Samategev](https://github.com/PriitParmakson/Samategev).

## Rakenduse arhitektuur

Suhtlevaid komponente ja teenuseid on neli:
- Veebirakenduse serveripoolne komponent (`https://samategev.herokuapp.com`)
- Veebirakenduse sirvijasse laetav komponent
- GitHub OAuth autentimisteenus
- GitHub-i API.

Kogu suhtlus toimub HTTPS protokolli järgi. Alloleval joonisel on numbritega näidatud edastatavad HTTP-päringud (nendest kohe allpool).

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
                    (3)          | Veebisirvija |
           +---------------------+      osa     |
           |                     |              |
           |                     |              |
           |                     +----+---------+
           |                          |
           |           (1)  (2)  (4)  |    ^
           |                          |    |
           v                (6)  (8)  v    |
                                           |                            O
    +--------------+             +---------+----+               +---------------+
    |              |             |              |               |               |
    | GitHub OAuth |             |   Serveri    |               |   GitHub+i    |
    | autentimis-  |O   <--------+     osa      +----------->  O|     repo      |
    |   teenus     |             |              |               |               |
    |              |    (5)      |   (Heroku)   |    (7) (9)    |               |
    +--------------+             +--------------+               +---------------+
github.com/login/oauth        samategev.herokuapp.com           api.github.com
````

## Samm-sammuline läbikäik (walkthrough): autentimine

Käime läbi OAuth autentimisprotseduuri. Näitlik on asi ise läbi teha, jälgides osapoolte vahelist sõnumiliiklust sirvija arendustööriista (Firefox-is Developer Tools võrguliikluse jälgimise tööriist, Chrome-is või Edge-s on samuti vastavad vahendid) abil.

Rakenduse URL on: `https://samategev.herokuapp.com`. Kasutaja läheb rakenduse avalehele. Sirvijast tehakse

***PÄRING 1***

```
HTTP GET https://samategev.herokuapp.com
```

Rakenduse serveripoolne komponent saadab sirvijasse rakenduse avalehe.

***VASTUS 1***

```
200 OK <rakenduse avaleht>
```

Avalehel esitatakse lühike teave rakenduse kohta ja ettepanek `Logi sisse GitHub-ga`. Kasutaja vajutab lingile `Logi sisse GitHub-ga`. Veebisirvijast läheb serverisse

***PÄRING 2***

```
HTTP GET https://samategev.herokuapp.com/auth
```

Server saadab päringule vastuseks ümbersuunamiskorralduse (_redirect_) GitHub-i OAuth autentimisteenusesse. HTTP vastuse staatusekood on `302`. Ümbersuunamiskorralduses saadab server veebisirvijale GitHubi autentimisteenuse URL-i `https://github.com/login/oauth/authorize` ja veel viis olulist teabeelementi (nendest kohe allpool).

***VASTUS 2***

```
302 Found
Location: https://github.com/login/oauth/authorize?redirect_uri=https%3A%2F%2Fsamategev.herokuapp.com%2FOAuthCallback&scope=user%20public_repo&state=hkMVY7vjuN7xyLl5&response_type=code&client_id=ab5b4f1671a58e7ba35a
```

Kasutaja veebisirvija saadab HTTP GET päringu ümbersuunamis-URL-le:

***PÄRING 3***

```
HTTP GET https://github.com/login/oauth/authorize?redirect_uri=https://samategev.herokuapp.com/OAuthCallback&scope=user public_repo&state=OFfVLKu0kNbJ2EZk&response_type=code&client_id=ab5b4f1671a58e7ba35a
```

Ümbersuunamis-URL-is on kuus OAuth autentimiseks vajalikku teabeelementi:

- GitHub-i autentimisteenuse URL (`https://github.com/login/oauth/authorize`);
- tagasipöördumis-URL (`https://samategev.herokuapp.com/OAuthCallback`);
- õigused, mida rakendus kasutajalt küsib (`scope` - `user` (kasutaja profiiliandmed) ja `public_repo` (kirjutusõigus kasutaja repodesse));
- autentimise unikaalne identifikaator (server genereeris selle juhuslikult) `state`;
- autentimise tulemuse serverile edastamise viis - `code`;
- rakenduse identifikaator (`client_id`).

***Rakenduse registreerimine identiteedipakkujas***. Rakenduse identifikaator (OAUth terminoloogias - _client ID_) on juhuslik sõne `ab5b4f1671a58e7ba35a`, mis moodustatakse rakenduse registreerimisel GitHub-is OAuth-i rakendusena. Rakenduse registreerib GitHub-is rakenduse autor, oma konto all, valides `Settings` > `Developer Settings` > `OAuth Applications`. Otselink: [https://github.com/settings/developers](https://github.com/settings/developers). GitHub-is OAuth-teenuses näeb rakenduse registreerimine välja nii:

Kuvapildistus 1
{: .joonis}

---
<img src='img/P1.PNG' width='80%' style='border: 1px solid Gray;'>

---

GitHub-i OAuth rakenduste registreerimislehel saab näha ka mitu kasutajat on rakendusel.

GitHub-i autentimisteenus kuvab kasutajale õiguste andmise dialoogi.

Kuvapildistus 2
{: .joonis}

---
<img src='img/P2.PNG' width='350px' style='border: 1px solid Gray;'>

---

Kui kasutaja nõustub, siis palub GitHub-i autentimisteenus kinnituseks sisestada kasutaja GitHub-i konto parooli. Märkus. Kasutaja saab nõusoleku GitHub-is igal ajal tagasi võtta. Otselink: [https://github.com/settings/applications](https://github.com/settings/applications).

Seejärel saadab GitHub-i autentimisteenus kasutaja veebisirvijale ümbersuunamiskorralduse, millega veebisirvija suunatakse tagasi rakendusse:

***PÄRING 4***

```
HTTP GET https://samategev.herokuapp.com/OAuthCallback?code=71ed5797c3d957817d31&state=OFfVLKu0kNbJ2EZk
```

Ümbersuunamis-URL-is paneb GitHub-i autentimisteenus kaasa turvakoodi (`code=71ed5797c3d957817d31`) ja rakenduse saadetud unikaalse identifikaatori (`state=OFfVLKu0kNbJ2EZk`). Turvakood on ühekordne "lubatäht" OAuth juurdepääsutõendi (_access token_) saamiseks. Unikaalne identifikaator (`state`) aitab tagada, et erinevate kasutajate autentimised sassi ei lähe ja ründaja protsessi ei saa vahele sekkuda.

Server, saades selle päringu, teeb omakorda otsepäringu GitHub-i autentimisteenusesse, aadressile `https://github.com/login/oauth/access_token`.

***PÄRING 5***

```
HTTP GET https://github.com/login/oauth/access_token?code=71ed5797c3d957817d31&client_secret=<...>
```

Päringule paneb server kaasa kaks asja: ülalnimetatud turvakoodi (`71ed5797c3d957817d31`) ja rakenduse nn salakoodi (`client_secret`).

Rakenduse salakood genereeritakse rakenduse registreerimisel GitHub-is (vt ülalpool). Erinevalt rakenduse identifikaatorist (`client_id`) on salakood salajane. Salakood võimaldab GitHub-il veenduda, et turvakoodi saadab ikka õige rakendus.

GitHub-i autentimisteenus saadab turvakoodi vastu juurdepääsutõendi (_access token_).

***VASTUS 5***

```
200 OK

 { "token" : {
   "access_token" : "4e18c6770d4dedc317501faaf2963ef8009dcb6f",
   "token_type" : "bearer",
   "scope" : "public_repo,user",
   "expires_at":null }
  }
```

Server koostab nüüd vastuse päringule 4. Vastuses saadab server küpsise (_cookie_) veebisirvijasse asetamiseks. Küpsisesse paneb server GitHub-i autentimisteenusest saadud juurdepääsutõendi.

***VASTUS 4***

```
302 Found

Location: /autenditud
Set-Cookie: GHtoend=%7B%22token%22%3A%7B%22access_token%22%3A%229f9e2aa0cf0697a14a14e6d5e72f277af7d5004d%22%2C%22token_type%22%3A%22bearer%22%2C%22scope%22%3A%22public_repo%2Cuser%22%2C%22expires_at%22%3Anull%7D%7D; Path=/
```

Dešifreeritult (URL-encoded kujust tavakujule teisendatult) on küpsise sisu järgmine:

```
GHtoend={"token":
{"access_token":"4e18c6770d4dedc317501faaf2963ef8009dcb6f",
"token_type":"bearer","scope":"public_repo,user","expires_at":null}}
; Path=/
```

Vastus sisaldab ka ümbersuunamiskorraldust rakenduse lehele `/autenditud`.

Veebisirvija salvestab saadud küpsise ja täidab korralduse, tehes järgmise pöördumise:

***PÄRING 6***

```
HTTP GET https://samategev.herokuapp.com/autenditud
```

Selles ja kõigis järgnevates päringutes paneb veebisirvija kaasa serverilt saadud küpsise (`GHtoend`). Tõend on kinnitus, et kasutaja GitHub-i identiteet on tuvastatud.

```
Cookie: GHtoend	{"token":{"access_token":"9f9e2aa0cf0697a14a14e6d5e72f277af7d5004d","token_type":"bearer","scope":"public_repo,user","expires_at":null}}
```

Vastuseks tagastab server HTML-lehe, kus märgib, et kasutaja on autenditud ja kuvab ka kasutaja nime.

***VASTUS 6***

```
200 OK

<autenditud oleku leht>
```

Autenditud kasutaja nimi kuvatakse autenditud oleku lehel. Kust server kasutaja nime teada saab? Server pärib autenditu kasutaja nime GitHub-i API-st, kasutades selleks pääsuvolitust (_access token_-it):

***PÄRING 7***

```
HTTP GET https://api.github.com/user

User-Agent: Samategev
Authorization: token 4e18c6770d4dedc317501faaf2963ef8009dcb6f
```

`/user` tähendab kasutaja profiiliandmete pärimist. GitHub nõuab, et päringu päisena teatab server ka andmeid küsiva rakenduse nim (`Samategev`).

GitHub-i API tagastab juurdepääsutõendile vastava GitHub-i kasutaja profiiliandmed (nime jm).

Server lisab saadud nime kasutajale päringu 5 vastuseks tagastatavasse HTML-teksti:

Kuvapildistus 3
{: .joonis}

---
<img src='img/P3.PNG' width='450px' style='border: 1px solid Gray;'>

---

Sellega on kasutaja autentimine (sisselogimine) lõppenud.

## Salvestamine GitHub-i

Autenditud kasutaja saab nüüd sisestada failinime ja teksti.

Kuvapildistus 4
{: .joonis}

---
<img src='img/P4.PNG' width='300px' style='border: 1px solid Gray;'>

---

Kasutaja vajutab nupule `Salvesta`. Tehniliselt on nupp HTML-vormi `Submit`-element. Veebisirvija saadab selle peale serverile HTTP POST päringu.

***PÄRING 8***

```
HTTP POST https://samategev.herokuapp.com/salvesta

Content-Type: application/x-www-form-urlencoded
Cookie: GHtoend	{"token":{"access_token":"9f9e2aa0cf0697a14a14e6d5e72f277af7d5004d","token_type":"bearer","scope":"public_repo,user","expires_at":null}}

<Form data>
failinimi	"MinuFail.md"
salvestatavtekst	"++++See+on+sisu++++++++++"
```

Päringu parameetritena (`Form data`) saadetakse kasutaja sisestatud failinimi ja tekst. Veebisirvija paneb päringule kaasa ka küpsisesse salvestatud juurdepääsutõendi)

Server saadab `HTTP PUT` päringu GitHub-i API-le:

***PÄRING 9***

```
HTTP PUT https://api.github.com/repos/PriitParmakson/Samategev/contents/MinuFail.md
```

lisades päringupäised (_Headers_):

`User-Agent: Samategev,
Authorization: token 4e18c6770d4dedc317501faaf2963ef8009dcb6f` 

Faili sisu saadetakse päringu kehas (`body`).

GitHub-i API salvestab faili.

Kuvapildistus 5
{: .joonis}

---
<img src='img/P5.PNG' width='400px' style='border: 1px solid Gray;'>

---

Kui midagi läheb untsu, siis annab programm intelligentselt veateate. Näiteks, kui proovime luua faili, mis on juba olemas (ülekirjutamiseks on teine käsk):

Kuvapildistus 6
{: .joonis}

---
<img src='img/P7.PNG' width='300px' style='border: 1px solid Gray;'>

---

## Ohud

OAuth on selles mõttes hea protokoll, et turvariskide kohta on kohe omaette dokument: [OAuth 2.0 Threat Model and Security Considerations](https://tools.ietf.org/html/rfc6819). Kahjuks ei piisa dokumendi läbilugemisest - ja ega esimese lugemisega palju aru saagi. Turvameetmeid tuleb rakendada mitmes kohas. See vajab mõtlemist ja tähelepanu, sest võimalusi "ämbrisse astumiseks" on palju. GitHub teeb OAuth autentimisteenuse pakkujana head tööd. Neil on jooksmas algoritmid, mis jälgivad muuhulgas ka seda, et keegi turvavõtmeid ja -tõendeid GitHub-i avalikesse repodesse üles ei laadiks. Mina tegin selle vea ja sain kohe hoiatuskirja:

---
Kuvapildistus 7
{: .joonis}

<img src='img/P6.PNG' width='500px' style='border: 1px solid Gray;'>

---

## Marsruutimisskeem (URL-de järjekord)

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

Teabeallikad: [StackOverflow](https://stackoverflow.com/).
