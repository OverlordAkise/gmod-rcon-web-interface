var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var Tail = require("tail").Tail;
var Rcon = require("rcon");
const {spawn} = require("child_process");
var port = process.env.PORT || 3001;


app.get("/", function(req, res){
  res.sendFile(__dirname + "/index.html");
});

tail = new Tail("/home/gmodserver/log/console/gmodserver-console.log");

var conn = new Rcon("localhost",27015,"MyOwnRconPassword");

conn.on("auth", function() {
  console.log("RCON Authenticated successfully!");
}).on("error", function(err) {
  console.log("RCON error: " + err);
});

conn.connect();

function reloadRcon(){
  conn = new Rcon("localhost",27015,"MyOwnRconPassword");
  conn.on("auth", function() {
    console.log("RCON Authenticated successfully!");
  }).on("error", function(err) {
    console.log("RCON error: " + err);
  });
  conn.connect();
}

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
      io.emit("log",`stdout: ${data}`);
    });
    r.stderr.on("data", data => {
      io.emit("log",`stderr: ${data}`);
    });
    r.on('error', (error) => {
      io.emit("log",`error: ${error.message}`);
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

