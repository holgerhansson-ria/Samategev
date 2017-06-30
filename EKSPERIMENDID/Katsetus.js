function alusta() {
  /*
    - Sündmusekäsitleja lisamine Two-elemendile: https://stackoverflow.com/questions/29812960/how-to-capture-a-click-event-on-a-shape-or-group-in-two-js 
    - Two dokumentatsioon: https://two.js.org/#documentation 
  */


  var jl = 640; // Joonistusala laius
  var jk = 480; // Joonistusala kõrgus
  var vs = 40; // Võrgustiku samm

  var joonistusala = document.getElementById('joonistusala');
  var two = new Two({ width: jl, height: jk }).appendTo(joonistusala);

  /*
   Võrk
  */
  var r = Math.floor(jl / vs); // Võrgu ridu
  var v = Math.floor(jl / vs); // Võrgu veerge
  for (var i = 0; i <= r; i++) {
    for (var j = 0; j <= r; j++) {
      var dot = two.makeCircle(i * vs, j * vs, 1);
    }
  } 

  var sirvija = two.makeRectangle(160, 120, 80, 80);

  two.update();

  var handler = function() {
    alert('!');
  }

  sirvija._renderer.elem.addEventListener('click', handler, false);

}
