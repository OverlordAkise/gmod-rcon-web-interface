var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var Tail = require("tail").Tail;
var Rcon = require("rcon");
const {spawn} = require("child_process");

// config start
const port = 3001;
const path_to_logfile = "/home/gmodserver/log/console/gmodserver-console.log";
const rcon_server_ip = "127.0.0.1";
const rcon_port = 27015;
const rcon_password = "MyOwnRconPassword";
// config end


// Code below, don't touch if you don't know what you are doing

app.get("/", function(req, res){
  res.sendFile(__dirname + "/index.html");
});

tail = new Tail(path_to_logfile);

var conn = null;

function reloadRcon(){
  conn = new Rcon(rcon_server_ip,rcon_port,rcon_password);
  conn.on("auth", function() {
    console.log("RCON Authenticated successfully!");
  }).on("error", function(err) {
    console.log("RCON error: " + err);
  });
  conn.connect();
}

reloadRcon();

io.on("connection", function(socket){
  console.log("A user successfully connected!");
  
  io.emit("log","[LUCTUS-LIVELOG] User successfully connected to log broadcast!");
  
  socket.emit("logBuffer",logBuffer);
  
  socket.on("cmd", function(msg){
    console.log("Executing cmd: "+msg);
    conn.send(msg);
  });
  
  socket.on("reloadRcon",function(msg){
    console.log("Reloading Rcon...");
    reloadRcon();
  });
  
  socket.on("restart",function(msg){
    io.emit("log","[LUCTUS-LIVELOG] Restarting server...")
    var r = spawn("/home/ud/gmodserver", ["restart"]);
    console.log("Restarting server...");
    r.stdout.on("data", data => {
      io.emit("log",data);
    });
    r.stderr.on("data", data => {
      io.emit("log",data);
    });
    r.on('error', (error) => {
      io.emit("log",error.message);
    });
    io.emit("log","[LUCTUS-LIVELOG] Successfully restarted server!");
  });
  
});


tail.on("line", function(data) {
  io.emit("log",data);
  bufferLine(data);
});


var logBuffer = [];
function bufferLine(line) {
  logBuffer.unshift(line);
  if(logBuffer.length > 500){
    logBuffer.pop()
  };
}


http.listen(port, function(){
  console.log("Server started! Listening on *:" + port);
});

