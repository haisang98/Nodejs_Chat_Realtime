var express = require("express");
var bodyParser = require('body-parser');
var mysql = require('mysql');
var app = express();
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.set("views", "./views");
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(5000, () => console.log("Server running on port 5000..."));

//SOCKET
//create array users online
var array_user_online = [];
var notification = 0;
io.on("connection", function(socket) {
    console.log("Co nguoi ket noi Id la : " + socket.id);
    socket.on("Client-Send-Username", function(data) {
        //Handle Trung Lap
        var count = array_user_online.length;
        var check = 0;
        for (var i = 0; i < count; i++) {
            if (array_user_online[i].username == data[0]) {
                check = 1;
            }
        }
        //
        if (check == 0) {
            socket.username = data[0];
            socket.avatar = data[1];
            var obj = { username: data[0], avatar: data[1], socketid: socket.id };
            array_user_online.push(obj);
        }
        io.sockets.emit("Server-Send-ArrayUserOnline", array_user_online)
    });

    socket.on("Client-Send-Logout", function() {
        console.log(array_user_online);
        //Handle Remove Item
        var count = array_user_online.length;
        var index = 0;
        for (var i = 0; i < count; i++) {
            if (array_user_online[i].username == socket.username) {
                index = i;
            }
        }
        //
        array_user_online.splice(index, 1);
        socket.broadcast.emit("Server-Send-ArrayUserOnline", array_user_online);
    });

    socket.on("Client-Send-Data", function(data) {
        console.log(data);
        notification++;
        // if (notification != 0) {
        //     io.to(data.socketid).emit("Server-Send-Message-Of-Sender", { msg: data.msg, socketid: socket.id, count: notification });
        // }
        io.to(data.socketid).emit("Server-Send-Message-Of-Sender", { msg: data.msg, socketid: socket.id, count: notification, socketusername: socket.username });
    });

    socket.on("Client-Send-Seen", function() {
        notification = 0;
    });
});

//API
app.get("/", function(req, res) {
    res.render("index");
});

app.post('/', urlencodedParser, function(req, res) {
    var taikhoan = req.body.taikhoan;
    var matkhau = req.body.matkhau;
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'chat'
    });

    connection.connect();

    var sql = 'SELECT * FROM users WHERE username_user="' + taikhoan + '" AND password_user="' + matkhau + '";';
    // console.log(sql);

    connection.query(sql, function(error, results, fields) {
        if (error) {
            throw error;
            connection.end();
        }

        res.render('index-chat', { results: results });

    });
});

app.get('/chat', function(req, res) {
    res.render("index-chat");
});