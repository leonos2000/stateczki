
//TODO:
// Przeciąganie statków na mapkę


// class rect {
//   constructor(x, y, h, w) {
//     this.x = x;
//     this.y = y;
//     this.h = w;
//     this.w = h;
//   }

//   contain(x, y) {
//     console.log(this.x, this.y, this.w, this.h);

//     if(x > this.x && x < (this.x + this.w) && y > this.y && y < (this.y + this.h) ) return true;
//     else return false;
//   }
// }

// var rawShipsPos = [];

class shipPos {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
  }
}

var shipsPos = [];

var ourMapPosX = 50;
var ourMapPosY = 50;

var oppMapPosX = 300;
var oppMapPosY = 50;

var shipsCounter = -1;

var pl1Ready = false, pl2Ready = false, game = false, turn = true;

var hits = 30;

function start() {
  // zerowanie wszystkich zmiennych w przeglądarce
  localStorage.setItem("player1Ready", "false");
  localStorage.setItem("hit", "-1");          
  localStorage.setItem("posX", "-1");           // Zastosowaliśmy dodatkowe pole z informacją zwrotną gdzie
  localStorage.setItem("posY", "-1");           // Było zrobione trafienie, dla uproszczenia kodu i przez to że każda zmiana powoduje event.
  localStorage.setItem("lastPosX", "-1");       // Da się to zrobić lepiej i naprawimy to w przyszłości 
  localStorage.setItem("lastPosY", "-1");     

  document.getElementById("startButton").style.display = "none";

  drawMap(ourMapPosX, ourMapPosY);
  drawRawShips(300, 20);
  document.getElementById("statki").getContext("2d").stroke();
  // assignShipsPos(300, 20);

  var canvas = document.getElementById("statki");

  canvas.addEventListener("click", function (evt) {
    var mousePos = getMousePos(canvas, evt);
    var message = mousePos.x + ", " + mousePos.y;

    for (i = 0; i < 10; i++) {
      for (j = 0; j < 10; j++) {
        if (!game) {
          if (contain(ourMapPosX + i * 20, ourMapPosY + j * 20, 20, 20, mousePos.x, mousePos.y)) {
            if (shipsCounter < 13) {
              shipsCounter++;

              var ship = 0;
              if (shipsCounter > 11) ship = 3;
              else if (shipsCounter > 8) ship = 2;
              else if (shipsCounter > 4) ship = 1;

              console.log(i, j);

              shipsPos.push(new shipPos(i, j, ship));

              if (shipsCounter == 13) {
                document.getElementById("info").innerHTML = "Oczekiwanie na drugiego gracza...";
                localStorage.setItem("player1Ready", "true");
                pl1Ready = true;
                if (pl1Ready && pl2Ready) {
                  writeMessage(canvas, message);
                  game = true;
                  document.getElementById("info").innerHTML = "Start! Twój ruch!";
                  drawShipsOnMap();
                }
              }
            }
          }
        } else {
          if (turn) {
            if (contain(oppMapPosX + i * 20, oppMapPosY + j * 20, 20, 20, mousePos.x, mousePos.y)) {
              localStorage.setItem("posY", "" + j);
              localStorage.setItem("posX", "" + i);
            }
          }
        }
      }
    }


    if (!game) {
      writeMessage(canvas, message);
      drawRawShips(300, 20);
      drawShipsOnMap();
    } else {
      drawMap(oppMapPosX, oppMapPosY);
    }

    drawMap(ourMapPosX, ourMapPosY);

    document.getElementById("statki").getContext("2d").stroke();
  }, false);

  window.addEventListener("storage", function (e) {
    if (e.newValue == "-1") return;

    var hit = false;

    console.log(e.newValue, e.key);
    if ((e.key == "player2Ready") && (e.newValue == "true")) {
      pl2Ready = true;
      if (pl2Ready && pl1Ready) {
        game = true;
        drawMap(oppMapPosX, oppMapPosY);
        document.getElementById("statki").getContext("2d").stroke();
        document.getElementById("info").innerHTML = "Start! Twój ruch!";
      } else {
        document.getElementById("info").innerHTML = "Gracz 2 jest gotowy!";
      }
    } else if (e.key == "posX") {
      for (i = 0; i < 14; i++) {
        for (j = 0; j < shipsPos[i].type + 1; j++) {
          if (e.newValue == shipsPos[i].x.toString()) {
            if (localStorage.getItem("posY") == (shipsPos[i].y + j).toString()) {
              drawImage("img/trafiony.png", ourMapPosX + e.newValue * 20, ourMapPosY + localStorage.getItem("posY") * 20, 20, 20);
              hit = true;

              document.getElementById("info").innerHTML = "Przeciwnik cie trafił... Nadal strzela...";

              hits--;
              if (hits == 0) alert("przegrałeś :!");

              localStorage.setItem("lastPosX", e.newValue);
              localStorage.setItem("lastPosY", localStorage.getItem("posY"));
              localStorage.setItem("hit", "1");
            }
          }
        }
      }
      if (!hit) {
        turn = true;
        document.getElementById("info").innerHTML = "Przeciwnik spudłował! Twój Ruch!";

        drawImage("img/pudlo.png", ourMapPosX + e.newValue * 20, ourMapPosY + localStorage.getItem("posY") * 20, 20, 20);

        localStorage.setItem("lastPosX", e.newValue);
        localStorage.setItem("lastPosY", localStorage.getItem("posY"));
        localStorage.setItem("hit", "0");
      }
      localStorage.setItem("posX", "-1");
      localStorage.setItem("posY", "-1");
    } else if (e.key == "hit") {
      console.log(localStorage.getItem("lastPosX"), localStorage.getItem("lastPosY"));
      if (e.newValue == "1") {
        drawImage("img/trafiony.png", oppMapPosX + localStorage.getItem("lastPosX") * 20, oppMapPosY + localStorage.getItem("lastPosY") * 20, 20, 20);
        turn = true;
        document.getElementById("info").innerHTML = "Trafiony! Nadal twój ruch!";
      } else {
        drawImage("img/pudlo.png", oppMapPosX + localStorage.getItem("lastPosX") * 20, oppMapPosY + localStorage.getItem("lastPosY") * 20, 20, 20);
        turn = false;
        document.getElementById("info").innerHTML = "Pudło... Ruch przeciwnika...";
      }
      localStorage.setItem("hit", "-1");
    }
  }, false);
}

function drawMap(x, y) {
  var ctx = document.getElementById("statki").getContext("2d");

  ctx.font = "10px Arial";

  for (i = 0; i < 11; i++) {
    if (i != 10) ctx.strokeText(String.fromCharCode(65 + i), x + i * 20 + 6, y - 6);
    ctx.moveTo(x + i * 20, y);
    ctx.lineTo(x + i * 20, y + 200);
  }
  for (i = 0; i < 11; i++) {
    if (i != 10) ctx.strokeText("" + i, x - 10, y + i * 20 + 14);
    ctx.moveTo(x, y + i * 20);
    ctx.lineTo(x + 200, y + i * 20);
  }
}

function drawRawShips(x, y) {
  var k = 0;
  for (i = 0; i < 4; i++) {
    for (j = 0; j < 5 - i; j++) {
      if (shipsCounter < k++) drawShip(x + j * 40, y + i * 60, i);
    }
  }
}

function drawShipsOnMap() {
  for (i = 0; i < shipsCounter + 1; i++) {
    drawShip(ourMapPosX + shipsPos[i].x * 20, ourMapPosY + shipsPos[i].y * 20, shipsPos[i].type);
    console.log(ourMapPosX + shipsPos[i].x * 20, ourMapPosY + shipsPos[i].y * 20, shipsPos[i].type);
  }
}

function contain(x, y, w, h, xx, yy) {
  if ((xx > x) && (xx < (x + w)) && (yy > y) && (yy < (y + h))) return true;
  else return false;
}

// function assignShipsPos(x, y) {
//   var k = 0;

//   for(i = 0; i < 4; i++) {
//     for(j = 0; j < 5 - i; j++) {
//       rawShipsPos.push(new rect);
//       rawShipsPos[k].x = x + j * 40;
//       rawShipsPos[k].y = y + i * 60;
//       rawShipsPos[k].w = 20;
//       rawShipsPos[k].h = 20 * (i + 1);
//       console.log(rawShipsPos[k].x, rawShipsPos[k].y, rawShipsPos[k].w, rawShipsPos[k].h);
//       k++;
//     }
//   }
// }

function drawShip(x, y, ship) {
  drawImage("img/" + (ship + 1) + ".png", x, y, 20, 20 * (ship + 1));
}

function drawImage(scr, x, y, w, h) {
  var ctx = document.getElementById("statki").getContext("2d");

  var image = new Image();
  image.onload = function () {
    ctx.drawImage(image, x, y, w, h);
  };
  image.src = scr;
}

function writeMessage(canvas, message) {
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  // context.font = '18pt Calibri';
  // context.fillStyle = 'black';
  // context.fillText(message, 10, 25);
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}