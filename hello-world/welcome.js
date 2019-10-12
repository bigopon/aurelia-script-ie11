define(function(require, exports) {
  'use strict';
  
  function Welcome(el) {
    this.el = el;
    this.message = '';
  }

  Welcome.$view = au.DOM.createTemplateFromMarkup([
    '<template style="display: block; border: 2px solid blue; margin: 4px;">',
      'Welcome ${message}',
    '</template>'
  ].join(''));

  Welcome.$resource = {
    bindables: ['message']
  };

  Welcome.inject = [Element];

  return {
    WelCome: Welcome
  }
});
