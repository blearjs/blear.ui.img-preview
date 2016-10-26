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
    maxHeight: 800,

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
        the[_reExtension] = new RegExp('\\.(' + options.extension.replace(/,/g, '|').replace(/\./g, '') + ')$', 'i');
        the[_parentEl] = selector.query(options.el)[0];
        ImgPreview.parent(the);
        the[_initNode]();
    },


    /**
     * 获取 img 节点
     * @returns {*}
     */
    getImgEl: function () {
        return this[_imgEl];
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

        callback = fun.noop(callback);

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

        if (!URL || the.emit('localPreview', fileInputEl) === false) {
            the.emit('beforeLoading');
            the.emit('beforeUpload');
            options.onUpload(fileInputEl, function (err, url) {
                the.emit('afterUpload');

                if (err) {
                    the.emit('afterLoading');
                    the.emit('error', err);
                    return callback(err);
                }

                the[_preview](url, callback);
            });
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
var _options = ImgPreview.sole();
var _parentEl = ImgPreview.sole();
var _imgEl = ImgPreview.sole();
var _preview = ImgPreview.sole();
var _initNode = ImgPreview.sole();
var _reExtension = ImgPreview.sole();
var pro = ImgPreview.prototype;


// 初始化节点
pro[_initNode] = function () {
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
pro[_preview] = function (url, callback) {
    var the = this;
    var options = the[_options];

    loader.img(url, function (err, imgEl) {
        if (err) {
            the.emit('afterLoading');
            the.emit('error', err);
            return callback(err);
        }

        var imgWidth = imgEl.width;
        var imgHeight = imgEl.height;
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
        the[_imgEl].src = imgEl.src;
        callback(null, the[_imgEl]);
        the.emit('afterLoading');
        the.emit('success', the[_imgEl]);
    });
};


ImgPreview.defaults = defaults;
module.exports = ImgPreview;
