// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Code for: https://youtu.be/ZjVyKXp9hec

// Based off of Shawn Van Every's Live Web
// http://itp.nyu.edu/~sve204/liveweb_fall2013/week3.html

var Players = [];



function Blob(id,name, x, y, r, mass,color) {
  this.id = id;
  this.name = name;
  this.x = x;
  this.y = y;
  this.r = r;
  this.mass = mass;
  this.color = color      ;
}

// Using express: http://expressjs.com/
var express = require('express');
// Create the app
var app = express();

// Set up the server
// process.env.PORT is related to deploying on heroku
var server = app.listen(process.env.PORT || 5000, listen);

// This call back just tells us that the server has started
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static('public'));

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io')(server);


setInterval(heartbeat, 33);

function heartbeat() {
  io.sockets.emit('heartbeat', Players);
}

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on(
  'connection',
  // We are given a websocket object in our function
  function(socket) {
    console.log('We have a new client: ' + socket.id);

    socket.on('start', function(data) {
      // console.log(data.name + ' ' + data.x + ' ' + data.y + ' ' + data.r);
      var blob = new Blob(socket.id, data.name, data.x, data.y, data.r, data.mass, data.color);
      console.log(data.mass)
      Players.push(blob);
      // console.log(data)
    });

    socket.on('update', function(data) {
      // console.log(socket.id + " " + data.x + " " + data.y + " " + data.r);
      var blob;
      for (var i = 0; i < Players.length; i++) {
        if (socket.id == Players[i].id) {
          // console.log(Players[i])
          blob = Players[i];

        }
      }
      blob.x = data.x;
      blob.y = data.y;
      blob.r = data.r;
      blob.mass = data.mass;
      
    });

    socket.on("killed", function(data) {
      Players[data.index].r = data.r;
      Players[data.index].mass = data.mass;
    })


    socket.on('disconnect', function() {
      for (var i = 0; i < Players.length; i++) {
        if (socket.id == Players[i].id) {
          Players.splice(i, 1);
        }
      }
      console.log('Client has disconnected');
      console.log(Players);
    });
  }
);
