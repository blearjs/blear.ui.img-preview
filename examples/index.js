/**
 * 文件描述
 * @author ydr.me
 * @create 2016-06-27 17:34
 */


'use strict';

var ImgPreview = require('../src/index');


var ip = window.ip = new ImgPreview({
    el: '#demo',
    maxWidth: 500,
    maxHeight: 400,
    onUpload: function (fileInputEl, done) {
        setTimeout(function () {
            done(null, 'http://image.tianjimedia.com/uploadImages/2015/083/30/VVJ04M7P71W2.jpg');
        }, 1000);
    }
});
var fileInputEl = document.querySelector('#file');
var statusEl = document.querySelector('#status');

fileInputEl.onchange = function () {
    ip.preview(fileInputEl);
};

ip.on('error', function (err) {
    statusEl.innerHTML = err.message;
});

ip.on('beforeLoading', function () {
    statusEl.innerHTML = '加载中...';
});

ip.on('afterLoading', function () {
    statusEl.innerHTML = '加载完毕';
});

document.querySelector('#rotate').onclick = function () {
    ip.rotate(90);
};

document.querySelector('#scale1').onclick = function () {
    ip.scale(1.1);
};

document.querySelector('#scale2').onclick = function () {
    ip.scale(0.9);
};


