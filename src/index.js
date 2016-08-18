/**
 * blear.ui.img-preview
 * @author ydr.me
 * @create 2016年06月04日14:09:36
 */

'use strict';


var compatible = require('blear.utils.compatible');
var object = require('blear.utils.object');
var loader = require('blear.utils.loader');
var fun = require('blear.utils.function');
var selector = require('blear.core.selector');
var modification = require('blear.core.modification');
var UI = require('blear.ui');

var w = window;
var URL = w[compatible.js('URL', w)];
var reImage = /^image\//;
var defaults = {
    /**
     * 预览容器元素
     */
    el: null,

    /**
     * 预览的宽度
     * @type String|Number
     */
    width: 'auto',

    /**
     * 预览的高度
     * @type String|Number
     */
    height: 'auto',

    /**
     * 预览的最小宽度
     * @type String|Number
     */
    minWidth: 800,

    /**
     * 预览的最小高度
     * @type String|Number
     */
    minHeight: 'auto',

    /**
     * 预览的最大宽度
     * @type String|Number
     */
    maxWidth: 1100,

    /**
     * 预览的最大高度
     * @type String|Number
     */
    maxHeight: 800,

    /**
     * 打开动画
     * @type Function|Undefined
     */
    openAnimation: undefined,

    /**
     * 尺寸变化动画
     * @type Function|Undefined
     */
    resizeAnimation: undefined,

    /**
     * 关闭动画
     * @type Function|Undefined
     */
    closeAnimation: undefined,

    /**
     * 上传回调
     * @type Function
     */
    onUpload: function (fileInputEl, done) {
        done(null, 'url');
    }
};

var ImgPreview = UI.extend({
    className: 'ImgPreview',
    constructor: function (options) {
        var the = this;

        options = the[_options] = object.assign({}, defaults, options);
        the[_parentEl] = selector.query(options.el)[0];
        ImgPreview.parent(the);
    },


    preview: function (fileInputEl, callback) {
        var the = this;
        var options = the[_options];
        callback = fun.noop(callback);

        if (!URL) {
            the.emit('beforeLoading');
            the.emit('beforeUpload');
            options.onUpload(fileInputEl, function (err, url) {
                the.emit('afterUpload');

                if (err) {
                    the.emit('afterLoading');
                    return callback(err);
                }

                the[_preview](url, callback);
            });
            return the;
        }

        if (!fileInputEl.files) {
            err = new Error('文件不存在');
            err.type = 'empty';
            callback(err);
            return the;
        }

        var file = fileInputEl.files[0];
        var err;

        if (!file) {
            err = new Error('文件为空');
            err.type = 'empty';
            callback(err);
            return the;
        }

        if (!reImage.test(file.type)) {
            err = new Error('文件类型不是图片');
            err.type = 'type';
            callback(err);
            return the;
        }

        the.emit('beforeLoading');
        the[_preview](URL.createObjectURL(file), callback);
        return the;
    }
});
var _options = ImgPreview.sole();
var _parentEl = ImgPreview.sole();
var _imgEl = ImgPreview.sole();
var _preview = ImgPreview.sole();
var pro = ImgPreview.prototype;

pro[_preview] = function (url, callback) {
    var the = this;
    var options = the[_options];

    loader.img(url, function (err, img) {
        if (err) {
            the.emit('afterLoading');
            return callback(err);
        }

        if (!the[_imgEl]) {
            the[_imgEl] = modification.create('img', {
                style: {
                    width: options.width,
                    height: options.height,
                    minWidth: options.minWidth,
                    minHeight: options.minHeight,
                    maxWidth: options.maxWidth,
                    maxHeight: options.maxHeight
                }
            });
            modification.insert(the[_imgEl], the[_parentEl]);
        }

        the[_imgEl].src = img.src;
        callback(null, the[_imgEl]);
        the.emit('afterLoading');
    });
};


ImgPreview.defaults = defaults;
module.exports = ImgPreview;
