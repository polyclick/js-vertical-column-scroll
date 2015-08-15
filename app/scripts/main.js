'use strict';

var App = Class.extend({
  init: function($element) {
    this.$element = $element;

    // consts
    this.COLUMN_MIN_WIDTH = 280; // px
    this.COLUMN_MAX_WIDTH = 320; // px
    this.RESIZE_CONTENT_TIMEOUT = 250; // ms

    // elements
    this.$body = this.$element.find('body');
    this.$masterWrapper = this.$element.find('.master-wrapper');
    this.$contentWrapper = this.$element.find('.content-wrapper');

    this.currentWindowHeight = $(window).height();
    this.currentWindowWidth = $(window).width();

    this.resizingHeightTimeout = null;

    this.columns = 0;
    this.currentColumnWidth = 0;

    this.start();
  },

  start: function() {
    this.addListeners();
    this.resizeContent();
  },

  addListeners: function() {
    $(window).scroll(function(){
      this.scroll();
    }.bind(this));

    $(window).resize(function() {
      this.resize();
    }.bind(this));
  },

  // move body content to reflect scroll down position
  scroll: function() {
    var percentage = $(window).scrollTop() / ($(document).height() - $(window).height());
    var leftPos = -1 * (this.$masterWrapper.outerWidth(true) - $(window).width()) * percentage;
    this.$masterWrapper.css('left', leftPos);
  },

  resize: function() {

    // resizing width of window, only resize scrollbar, content height stays the same
    if($(window).width() !== this.currentWindowWidth) {
      this.currentWindowWidth = $(window).width();
      this.resizeScrollbar();
    }

    // resizing window height, make our content fit again
    if($(window).height() !== this.currentWindowHeight) {
      this.currentWindowHeight = $(window).height();

      // debounced resizing because this is cpu intensive
      clearTimeout(this.resizingHeightTimeout);
      this.resizingHeightTimeout = setTimeout(function(){
        this.resizeContent();
      }.bind(this), this.RESIZE_CONTENT_TIMEOUT);
    }
  },

  // set body height to reflect width of content vs window width
  resizeScrollbar: function() {
    var ratio = Math.max(1, this.$masterWrapper.outerWidth(true) / $(window).width());
    this.$body.height($(window).height() * ratio);
  },

  resizeContent: function() {
    this.columns = 1;
    this.currentColumnWidth = this.COLUMN_MIN_WIDTH;

    // set initial state to 1 column with minimum width
    this.$contentWrapper.css({
      'width': this.COLUMN_MIN_WIDTH + 'px',
      'column-count': 1,
      'visibility': 'hidden',
      'pointer-event': 'none'
    });

    // resize till content is fitting
    while(!this.isContentFittingHeight()) {

      // make column width bigger
      this.currentColumnWidth += 10;

      // reached maximum width for one column, add new column and shrink back to minimum
      if(this.currentColumnWidth > this.COLUMN_MAX_WIDTH) {

        this.columns++;
        this.currentColumnWidth = this.COLUMN_MIN_WIDTH;

        this.$contentWrapper.css({
          'width': (this.columns * this.currentColumnWidth) + 'px',
          'column-count': this.columns
        });
      } else {
        this.$contentWrapper.width(this.columns * this.currentColumnWidth);
      }
    }

    // resize complete, set finishing values
    this.$contentWrapper.css({
      'visibility': 'visible',
      'pointer-event': 'auto'
    });

    // recalculate scrollbar
    this.resizeScrollbar();
  },

  isContentFittingHeight: function() {
    return this.$contentWrapper.outerHeight(true) <= $(window).height();
  }
});



$(function() {
  var $html = $('html');
  $html.imagesLoaded(function(){
    var app = new App($html);
  });
});