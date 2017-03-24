var express = require('express');
var path = require('path');
var console = require("Console");
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var debug = require('debug')('express:server');
var http = require('http');
var _server = require("./server");

function myServer(port, host, staticDirectory, serverRoot) {
    let me = this;
    me.start(port, host, staticDirectory, serverRoot);
};
myServer.prototype.start = function(port, host, staticDirectory, serverRoot) {
    let me = this;
    port = port || 8080;
    host = host || 'localhost';
    staticDirectory = staticDirectory || "./static";
    serverRoot = serverRoot || "./server";
    port = me.normalizePort(port);
    let app = express();
    me.app = app;
    app.use(express.static(staticDirectory));
    myServer.handler(app, serverRoot);
    app.set('port', port);
    let server = http.createServer(app);
    me.server = server;
    server.listen(port);
    console.success(`已开启服务器,服务器监听端口是${port},请访问地址: http://127.0.0.1:${port}`);
    server.on('error', me.errorHandler);
    server.on('listening', me.listeningHander.bind(me));

    return app;
};
myServer.prototype.server;
myServer.prototype.app;
myServer.prototype.errorHandler = function(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ?
        'Pipe ' + port :
        'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
};
myServer.prototype.listeningHander = function() {
    let me = this;
    var addr = me.server.address();
    var bind = typeof addr === 'string' ?
        'pipe ' + addr :
        'port ' + addr.port;
    debug('Listening on ' + bind);
}
myServer.handler = function(app, serverRoot) {
    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    };
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    // _server(app, serverRoot);
    myServer.handleRestServer(app, serverRoot);
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
};
myServer.handleRestServer = function(app, serverRoot) {
    _server(app, serverRoot);
};
myServer.prototype.normalizePort = function(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
};
module.exports = myServer;