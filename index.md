---
title: Samategev
---

# Samategev

Rakendus võimaldab:

- autentida rakenduse poole pöörduv kasutaja GitHub-i konto abil OAuth protokolli kohaselt
- salvestada kasutaja sisestatud tekst GitHub-i reposse, eraldi failina.

## Sündmuste käik

- Avalehel (`index.ejs`) esitatakse lühike teave rakenduse kohta ka ettepanek `Logi sisse GitHub-ga`.
- Kasutaja vajutab lingile `Logi sisse GitHub-ga`.
- Serverisse läheb HTTP GET päring URL-ga `https://samategev.herokuapp.com/auth`):

PÄRING 1

`GET https://samategev.herokuapp.com/auth`

- Server saadab päringule vastuseks ümbersuunamiskorralduse (_Redirect_) GitHub-i OAuth autentimisteenusesse. HTTP vastuse staatusekood on `302`. Ümbersuunamiskorralduses saadab server OAuth protokolli kohase URL-i, millele kasutaja veebisirvija siis suundubki:

PÄRING 2

`GET https://github.com/login/oauth/authorize?redirect_uri=https://samategev.herokuapp.com/OAuthCallback&scope=user public_repo&state=OFfVLKu0kNbJ2EZk&response_type=code&client_id=ab5b4f1671a58e7ba35a`

Ümbersuunamis-URL-is on 6 OAuth autentimiseks vajalikku teabeelementi:

- GitHub-i autentimisteenuse URL (`https://github.com/login/oauth/authorize`) veel;
- tagasipöördumis-URL (`https://samategev.herokuapp.com/OAuthCallback`);
- õigused, mida rakendus kasutajalt küsib (`scope` - `user` (kasutaja profiiliandmed) ja `public_repo` (kirjutusõigus kasutaja repodesse));
- autentimise unikaalne identifikaator (server genereeris selle juhuslikult) `state`;
- autentimise tulemuse serverile edastamise viis - `code`;
- rakenduse identifikaator (`client_id`).

Rakenduse identifikaator on juhuslikult moodustatud sõne `ab5b4f1671a58e7ba35a`, mis moodustatakse rakenduse registreerimisel GitHub-is OAuth-i rakendusena.

Rakenduse registreerib GitHub-is rakenduse autor, oma konto all, valides `Settings` > `Developer Settings` > `OAuth Applications`. Otselink: 
![https://github.com/settings/developers](https://github.com/settings/developers).

![](img/P1.PNG)

Samas saab näha ka mitu kasutajat on rakendusel.

- GitHub-i autentimisteenus kuvab kasutajale õiguste andmise dialoogi.

![](img/P2.PNG)

- Kui kasutaja nõustub, siis palub GitHub-i autentimisteenus kinnituseks sisestada kasutaja GitHub-i konto parooli.

Seejärel saadab GitHub-i autentimisteenus kasutaja veebisirvijale ümbersuunamiskorralduse, millega veebisirvija suunatakse tagasi rakendusse:

PÄRING 3

`GET https://samategev.herokuapp.com/OAuthCallback?code=71ed5797c3d957817d31&state=OFfVLKu0kNbJ2EZk`


Ümbersuunamis-URL-is paneb GitHub-i autentimisteenus kaasa turvakoodi (`code=71ed5797c3d957817d31`) ja rakenduse saadetud unikaalse identifikaatori (`state=OFfVLKu0kNbJ2EZk`). Turvakood on ühekordne "lubatäht" OAuth juurdepääsutõendi (_access token_) saamiseks. Unikaalne identifikaator (`state`) aitab tagada, et erinevate kasutajate autentimised sassi ei lähe.

Server, saades selle päringu, teeb omakorda otsepäringu GitHub-i autentimisteenusesse, aadressile 'https://github.com/login/oauth/access_token'.

PÄRING 4

'GET https://github.com/login/oauth/access_token?code=71ed5797c3d957817d31&client_secret=<...>'

Päringule paneb server kaasa kaks asja: ülalnimetatud turvakoodi (`71ed5797c3d957817d31`) ja rakenduse nn salakoodi (`client_secret`). Rakenduse salakood genereeritakse rakenduse registreerimisel GitHub-is. Erinevalt rakenduse identifikaatorist (`client_id`) on salakood salajane. Salakood võimaldab GitHub-il veenduda, et turvakoodi saadab ikka õige rakendus.

GitHub-i autentimisteenus saadab turvakoodi vastu juurdepääsutõendi (_access token_).

`{ "token" : {
   "access_token" : "4e18c6770d4dedc317501faaf2963ef8009dcb6f",
   "token_type" : "bearer",
   "scope" : "public_repo,user",
   "expires_at":null }
  }`

Server koostab nüüd vastuse päringule 3. Vastuses saadab server küpsise (_cookie_) veebisirvijasse asetamiseks. Küpsisesse paneb server GitHub-i autentimisteenusest saadud juurdepääsutõendi:

`GHtoend={"token":{"access_token":"4e18c6770d4dedc317501faaf2963ef8009dcb6f","token_type":"bearer","scope":"public_repo,user","expires_at":null}}; Path=/`

Vastus sisaldab ka ümbersuunamiskorraldust rakenduse lehele `/autenditud`.

Veebisirvija salvestab saadud küpsise ja täidab korralduse, tehes järgmise pöördumise:

PÄRING 5

`GET https://samategev.herokuapp.com/autenditud`

Selles ja kõigis järgnevates päringutes paneb veebisirvija kaasa serverilt saadud küpsise (`GHtoend`). Tõend on kinnitus, et kasutaja GitHub-i identiteet on tuvastatud.

Päringu 5 vastuseks tagastab server HTML-lehe, kus märgib, et kasutaja on autenditud ja kuvab ka kasutaja nime. Kust server kasutaja nime saab? Selleks teeb server päringu GitHub-i API-sse:

PÄRING 6

'GET https://api.github.com/user'

lisades päised (_HTTP Request Headers_):

'User-Agent': 'Samategev',
'Authorization': 'token 4e18c6770d4dedc317501faaf2963ef8009dcb6f'

'/user' tähendab kasutaja profiiliandmete pärimist. GitHub-i API tagastab juurdepääsutõendile vastava GitHub-i kasutaja profiiliandmed (nime jm). Server lisab saadud nime kasutajale päringu 5 vastuseks tagastatavasse HTML-teksti:

![](img/P3.PNG)



