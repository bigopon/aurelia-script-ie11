define(function(require, exports) {
  'use strict';
  
  function HelloWorld(el) {
    this.el = el;
    this.message = '';
  }
  HelloWorld.inject = [Element];

  au.bindable({ name: 'message', defaultBindingMode: 'toView' })(HelloWorld);

  return {
    HelloWorld: HelloWorld
  }
});