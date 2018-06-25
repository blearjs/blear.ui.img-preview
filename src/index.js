/**
 * blear.ui.img-preview
 * @author ydr.me
 * @create 2016年06月04日14:09:36
 * @update 2018年06月21日16:47:27
 */

'use strict';


var compatible = require('blear.utils.compatible');
var object = require('blear.utils.object');
var loader = require('blear.utils.loader');
var fun = require('blear.utils.function');
var selector = require('blear.core.selector');
var modification = require('blear.core.modification');
var attribute = require('blear.core.attribute');
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
     * 图片扩展名，使用英文逗号分隔开
     * @type String
     */
    extension: '.png,.jpg,.jpeg,.gif,.bmp',

    /**
     * 预览的最大宽度
     * @type Number
     */
    maxWidth: 1100,

    /**
     * 预览的最大高度
     * @type Number
     */
    maxHeight: 800
};

var ImgPreview = UI.extend({
    className: 'ImgPreview',
    constructor: function (options) {
        var the = this;

        options = the[_options] = object.assign({}, defaults, options);
        the[_reExtension] = new RegExp('\\.(' + options.extension.replace(/,/g, '|').replace(/\./g, '') + ')$', 'i');
        the[_parentEl] = selector.query(options.el)[0];
        ImgPreview.parent(the);
        the[_rotation] = 0;
        the[_scale] = 1;
        the[_initNode]();
    },

    /**
     * 获取 img 节点
     * @returns {*}
     */
    getImageEl: function () {
        return this[_imgEl];
    },

    /**
     * 旋转角度
     * @param rotation {Number} 角度
     * @returns {ImgPreview}
     */
    rotate: function (rotation) {
        var the = this;
        the[_rotation] += rotation;
        the[_transform]();
        return the;
    },

    /**
     * 获取选择角度
     * @returns {Number}
     */
    getRotation: function () {
        return this[_rotation];
    },

    /**
     * 缩放倍数
     * @param scale {Number} 比例
     * @returns {ImgPreview}
     */
    scale: function (scale) {
        var the = this;
        the[_scale] *= scale;
        the[_transform]();
        return the;
    },

    /**
     * 获取缩放比例
     * @returns {Number}
     */
    getScale: function () {
        return this[_scale];
    },

    /**
     * 预览
     * @param fileInputEl {Object} 文件上传输入框
     * @param [callback] {Function} 预览完毕回调
     * @returns {ImgPreview}
     */
    preview: function (fileInputEl, callback) {
        var the = this;
        var options = the[_options];
        var value = fileInputEl.value;

        the[_rotation] = 0;
        the[_scale] = 1;
        the[_transform]();
        callback = fun.ensure(callback);

        if (!value) {
            err = new Error('文件不存在');
            err.type = 'empty';
            the.emit('error', err);
            callback(err);
            return the;
        }

        if (!the[_reExtension].test(value)) {
            err = new Error('文件类型不是图片');
            err.type = 'type';
            the.emit('error', err);
            callback(err);
            return the;
        }

        if (!fileInputEl.files) {
            err = new Error('文件不存在');
            err.type = 'empty';
            the.emit('error', err);
            callback(err);
            return the;
        }

        var file = fileInputEl.files[0];
        var err;

        if (!file) {
            err = new Error('文件为空');
            err.type = 'empty';
            the.emit('error', err);
            callback(err);
            return the;
        }

        if (!reImage.test(file.type)) {
            err = new Error('文件类型不是图片');
            err.type = 'type';
            the.emit('error', err);
            callback(err);
            return the;
        }

        the.emit('beforeLoading');
        the[_preview](URL.createObjectURL(file), callback);
        return the;
    },

    /**
     * 重置为初始状态
     * @returns {ImgPreview}
     */
    reset: function () {
        var the = this;
        the[_imgEl].src = '';
        return the;
    }
});
var sole = ImgPreview.sole;
var _options = sole();
var _parentEl = sole();
var _imgEl = sole();
var _preview = sole();
var _initNode = sole();
var _reExtension = sole();
var _rotation = sole();
var _scale = sole();
var _transform = sole();
var _imageOriginalWidth = sole();
var _imageOriginalHeight = sole();
var _adapteSize = sole();
var proto = ImgPreview.prototype;


// 初始化节点
proto[_initNode] = function () {
    var the = this;
    var options = the[_options];

    the[_imgEl] = modification.create('img', {
        style: {
            display: 'none',
            minWidth: 'auto',
            minHeight: 'auto',
            maxWidth: 'none',
            maxHeight: 'none',
            border: 0,
            boxShadow: 'none',
            background: '#fff'
        }
    });
    modification.insert(the[_imgEl], the[_parentEl]);
};

// 预览
proto[_preview] = function (url, callback) {
    var the = this;

    loader.img(url, function (err, imgEl) {
        if (err) {
            the.emit('afterLoading');
            the.emit('error', err);
            return callback(err);
        }

        the[_imageOriginalWidth] = imgEl.width;
        the[_imageOriginalHeight] = imgEl.height;
        the[_adapteSize]();
        the[_imgEl].src = imgEl.src;
        the.emit('afterLoading');
        callback(null, the[_imgEl]);
        the.emit('success', the[_imgEl]);
    });
};

proto[_adapteSize] = function () {
    var the = this;
    var options = the[_options];
    var imgWidth = the[_imageOriginalWidth];
    var imgHeight = the[_imageOriginalHeight];
    var maxWidth = options.maxWidth;
    var maxHeight = options.maxHeight;
    var maxRatio = maxWidth / maxHeight;
    var realRatio = imgWidth / imgHeight;

    if (maxRatio > realRatio) {
        imgHeight = maxHeight;
        imgWidth = imgHeight * realRatio;
    } else {
        imgWidth = maxWidth;
        imgHeight = imgWidth / realRatio;
    }

    the[_imgEl].width = imgWidth;
    the[_imgEl].height = imgHeight;
    attribute.style(the[_imgEl], {
        display: 'inline-block',
        width: imgWidth,
        height: imgHeight
    });
};

// 变换
proto[_transform] = function () {
    var the = this;

    the[_rotation] = the[_rotation] % 360;
    attribute.style(the[_imgEl], 'transform', {
        rotate: the[_rotation],
        scale: the[_scale]
    })
};


ImgPreview.defaults = defaults;
module.exports = ImgPreview;
