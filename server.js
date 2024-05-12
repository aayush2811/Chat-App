const express = require("express");
const app = express();
const path = require("path");
const http = require("http").Server(app);
const mongoose = require("mongoose");
const userroute = require("./router/userRoute");
const bodyParser = require("body-parser");
const session = require("express-session");
const io = require("socket.io")(http);
const userModel = require("./models/userModel");
const chatModel = require("./models/chatModel");

var userio = io.of("/user-namespace");

userio.on("connection", async function (socket) {
  console.log("A user connected");
  var userId = socket.handshake.auth.token;
  //   console.log(socket.handshake.auth.token);
  await userModel.findByIdAndUpdate(
    { _id: userId },
    { $set: { is_online: "1" } }
  );
  socket.broadcast.emit('useronline', { user_id: userId })
  socket.on("disconnect", async function () {
    var userId = socket.handshake.auth.token;
    // console.log(socket.handshake.auth.token);
    await userModel.findByIdAndUpdate(
      { _id: userId },
      { $set: { is_online: "0" } }
    );
    socket.broadcast.emit('useroffline', { user_id: userId })

    console.log("A user disconnected");
  });

  socket.on('newChat', function (data) {
    socket.broadcast.emit('loadnewChat', data)
  })
  socket.on('existsChat', async function (data) {
    var chats = await chatModel.find({
      $or: [
        { sender_id: data.sender_id, receiver_id: data.receiver_id },
        { sender_id: data.receiver_id, receiver_id: data.sender_id }

      ]
    });
    socket.emit('loadChats', { chats: chats });
  });

  socket.on('chatDeleted', function (id) {
    socket.broadcast.emit('chatMessageDeleted', id)
  });

  socket.on('chatUpdated', function (data) {
    socket.broadcast.emit('chatMessageUpdated', data)
  })

});

app.use(
  session({
    secret: "abshvbhsbc",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongoose
  .connect("mongodb://localhost:27017/chat")
  .then(() => {
    console.log("Database Connected");
  })
  .catch(() => {
    console.log("Error in connecting Database");
  });

app.use("/", userroute);
http.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
