/**
 * 文件描述
 * @author ydr.me
 * @create 2016-06-27 17:34
 */


'use strict';

var ImgPreview = require('../src/index');


var ip = window.ip = new ImgPreview({
    el: '#demo',
    onUpload: function (fileInputEl, done) {
        done(null, 'http://image.tianjimedia.com/uploadImages/2015/083/30/VVJ04M7P71W2.jpg');
    }
});
var fileInputEl = document.querySelector('#file');

fileInputEl.onchange = function () {
    ip.preview(fileInputEl);
};


