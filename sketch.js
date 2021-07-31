// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Code for: https://youtu.be/ZjVyKXp9hec

let list = document.getElementById("dashboard");

const userName = prompt('Ваш ник');
// Keep track of our socket connection
var socket;
var NumPlayer;
var blob;
var Players = [];
var blobs = []

var zoom = 1;
var StandartRadiusBlob = 15;

function drawshow(Players) {
  
  fill(Players.color);
  ellipse(Players.x, Players.y, Players.r * 2, Players.r * 2);

  fill(255);
  textAlign(CENTER);
  textSize(20);
  text(Players.name, Players.x, Players.y+10);
};

function setup() {
  createCanvas(1300, 800);
  // Start a socket connection to the server
  // Some day we would run this server somewhere else
  // socket = io.connect('http://localhost:3000');
  socket = io();
  for ( var i=0; i<4000;i++){
    var x = random(-5*width,width*5)
    var y = random(-5*height,height*5)
    blobs[i] = new Blob(x,y,10);
}
  blob = new Blob(random(width), random(height), StandartRadiusBlob);
  // Make a little object with  and y
  var data = {
    x: blob.pos.x,
    y: blob.pos.y,
    r: blob.r,
    name: userName,
    mass: blob.mass,
    color: blob.color
  };
  socket.emit('start', data);

  socket.on('heartbeat', function(data) {
    //console.log(data);
    Players = data;
  });
}



function draw() {
  background(160,160,160);
  // console.log(blob.pos.x, blob.pos.y);

  translate(width / 2, height / 2);
  var newzoom = StandartRadiusBlob / blob.r;
  zoom = lerp(zoom, newzoom, 0.1);
  // scale(zoom);
  translate(-blob.pos.x, -blob.pos.y);

  Players.sort((a, b) => a.r <= b.r ? 1 : -1);
  var inner = `<div class="leader_title">Leaders</div>`;
  for (var i = Players.length - 1; i >= 0; i--) {
    var id = Players[i].id;
    if (id.substring(2, id.length) !== socket.id) {
      inner +=`<div class="leader_people">${Players[i].name} - ${Players[i].mass}</div>`;
      
      drawshow(Players[i])
    }
    
    
  }
  list.innerHTML = inner;


  for ( var i=blobs.length-1; i>=0;i--){
    if ( blob.eats(blobs[i]) ){
        blobs.splice(i,1);
        blobs.push(new Blob(random(-width,width*2),random(-height,height*2),10)) // Спавн новой еды
    }
    if ( blobs[i] != undefined ) // Иногда появлсяется ошибка
    blobs[i].show();
  } 

  for ( var i=Players.length-1; i>=0;i--){
    if (socket.id == Players[i].id) NumPlayer = i
  }

  for ( var i=Players.length-1; i>=0;i--){
    if (socket.id != Players[i].id){
      if ( blob.eats_enemy(Players[i]) ){
        console.log(blob.r, Players[i].r, blob.r >= Players[i].r)
        if (blob.r >= Players[i].r) {
          blob.mass += Players[i].mass;
          Players[i].r = 11;
          data = {
            mass:0,
            r: 11,
            index : i
          }
          socket.emit("killed",data);
        } else {
          blob.mass = 0;
          blob.r = 11;

          
        }
      }
    }
  }

  blob.update();
  blob.constrain();

  var data = {
    x: blob.pos.x,
    y: blob.pos.y,
    r: blob.r,
    mass: blob.mass
  };
  socket.emit('update', data);
}


