/// <reference path="types/node-0.10.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var dgram = require('dgram');
var Controller = (function () {
    function Controller(opts) {
        this.host = '10.10.10.100';
        this.port = 8899;
        this.socket = dgram.createSocket('udp4');
        this._send = function (group, hex, cb) {
            if (!group)
                group = 0;
            if (typeof hex == 'string')
                hex = this.commands[hex];
            if (hex instanceof Array)
                hex = hex[group];
            if (!cb)
                cb = function (err, res) {
                    if (err)
                        throw err;
                };
            var buffer = new Buffer([hex].concat([0x00, 0x55]), 'hex');
            this.socket.send(buffer, 0, buffer.length, this.port, this.host, cb);
        };
        this.on = function (group, cb) { this._send(group, 'on', cb); };
        this.off = function (group, cb) { this._send(group, 'off', cb); };
        this.allOn = function (cb) { this.on(0, cb); };
        this.allOff = function (cb) { this.off(0, cb); };
        this.brightnessUp = function (group, cb) {
            if (typeof group == 'undefined')
                this._send(null, 'brightnessUp', cb);
            else
                this.on(group, function (err, resp) {
                    if (err)
                        throw err;
                    this._send(null, 'brightnessUp', cb);
                }.bind(this));
        };
        this.brightnessDown = function (group, cb) {
            if (typeof group == 'undefined')
                this._send(null, 'brightnessDown', cb);
            else
                this.on(group, function (err, resp) {
                    if (err)
                        throw err;
                    this._send(null, 'brightnessDown', cb);
                }.bind(this));
        };
        this.nightlight = function (group, cb) {
            this.off(group, function (err, resp) {
                if (err)
                    throw err;
                setTimeout(function () {
                    this._send(group, 'nightlight', cb);
                }.bind(this), 100);
            });
        };
        if (opts.host)
            this.host = opts.host;
        if (opts.port)
            this.port = opts.port;
    }
    return Controller;
})();
var WhiteController = (function (_super) {
    __extends(WhiteController, _super);
    function WhiteController() {
        _super.apply(this, arguments);
        this.commands = {
            on: [0x35, 0x38, 0x3d, 0x37, 0x32],
            off: [0x39, 0x3b, 0x33, 0x3a, 0x36],
            brightnessUp: 0x3c,
            brightnessDown: 0x34,
            warmer: 0x3e,
            cooler: 0x3f,
            onFull: [0xb5, 0xb8, 0xbd, 0xb7, 0xb2],
            nightlight: [0xb9, 0xbb, 0xb3, 0xba, 0xb6]
        };
        this.warmer = function (group, cb) {
            if (typeof group == 'undefined')
                this._send(null, 'warmer', cb);
            else
                this.on(group, function (err, resp) {
                    if (err)
                        throw err;
                    this._send(null, 'warmer', cb);
                }.bind(this));
        };
        this.cooler = function (group, cb) {
            if (typeof group == 'undefined')
                this._send(null, 'cooler', cb);
            else
                this.on(group, function (err, resp) {
                    if (err)
                        throw err;
                    this._send(null, 'cooler', cb);
                }.bind(this));
        };
    }
    return WhiteController;
})(Controller);
module.exports = function (opts) {
    return {
        WhiteController: new WhiteController(opts)
    };
};
