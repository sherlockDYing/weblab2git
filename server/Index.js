var app = require('express')();
app.engine('html',require('express-art-template'));
app.set('view engine','html');
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/',function (req,res) {
    res.render('html/index',{});
});

io.on('connection', function (socket) {
    console.log('client '+ socket.id + ' connected');
    socket.on('player', function (data) {
        data.socketid = socket.id;
        socket.broadcast.emit('player', data);
    });
    socket.on('disconnect', function () {
        console.log('client ' + socket.id + ' disconnected');
        socket.broadcast.emit('offline', {socketid: socket.id});
    })
});

http.listen(3000,function () {
    console.log('listening on *:3000');
});
