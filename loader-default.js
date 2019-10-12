au.PLATFORM.Loader = (function() {
  var DefaultLoader = au.PLATFORM.Loader;
  var _aureliaPal = au;

  function TextTemplateLoader() {}

  TextTemplateLoader.prototype.loadTemplate = function loadTemplate(loader, entry) {
    return loader.loadText(entry.address).then(function (text) {
      entry.template = _aureliaPal.DOM.createTemplateFromMarkup(text);
    });
  };

  function ensureOriginOnExports(executed, name) {
    var target = executed;
    var key = void 0;
    var exportedValue = void 0;

    if (target.__useDefault) {
      target = target['default'];
    }

    au.Origin.set(target, new au.Origin(name, 'default'));

    for (key in target) {
      exportedValue = target[key];

      if (typeof exportedValue === 'function') {
        au.Origin.set(exportedValue, new au.Origin(name, key));
      }
    }

    return executed;
  }

  function InlineScriptDefaultLoader() {
    var _this = this;
    this.templateRegistry = {};
    _this.textPluginName = 'text';
    
    
    _this.moduleRegistry = Object.create(null);
    _this.useTemplateLoader(new TextTemplateLoader());

    _this.addPlugin('template-registry-entry', {
      'fetch': function fetch(address) {
        var entry = _this.getOrCreateTemplateRegistryEntry(address);
        return entry.templateIsLoaded ? entry : _this.templateLoader.loadTemplate(_this, entry).then(function (x) {
          return entry;
        });
      }
    });
    return _this;
  }

  InlineScriptDefaultLoader.prototype.useTemplateLoader = function useTemplateLoader(templateLoader) {
    this.templateLoader = templateLoader;
  };

  InlineScriptDefaultLoader.prototype.loadAllModules = function loadAllModules(ids) {
    var loads = [];

    for (var i = 0, ii = ids.length; i < ii; ++i) {
      loads.push(this.loadModule(ids[i]));
    }

    return Promise.all(loads);
  };

  InlineScriptDefaultLoader.prototype.loadTemplate = function loadTemplate(url) {
    return this._import(this.applyPluginToUrl(url, 'template-registry-entry'));
  };

  InlineScriptDefaultLoader.prototype.loadText = function loadText(url) {
    return this._import(this.applyPluginToUrl(url, this.textPluginName)).then(function (textOrModule) {
      if (typeof textOrModule === 'string') {
        return textOrModule;
      }

      return textOrModule['default'];
    });
  };

  var getDefined = void 0;
  if (typeof _aureliaPal.PLATFORM.global.requirejs.s === 'object') {
    getDefined = function getDefined() {
      return _aureliaPal.PLATFORM.global.requirejs.s.contexts._.defined;
    };
  } else if (typeof _aureliaPal.PLATFORM.global.requirejs.contexts === 'object') {
    getDefined = function getDefined() {
      return _aureliaPal.PLATFORM.global.requirejs.contexts._.defined;
    };
  } else if (typeof _aureliaPal.PLATFORM.global.requirejs.definedValues === 'function') {
    getDefined = function getDefined() {
      return _aureliaPal.PLATFORM.global.requirejs.definedValues();
    };
  } else {
    getDefined = function getDefined() {
      return {};
    };
  }
  _aureliaPal.PLATFORM.eachModule = function (callback) {
    var defined = getDefined();
    for (var key in defined) {
      try {
        if (callback(key, defined[key])) return;
      } catch (e) {}
    }
  };

  InlineScriptDefaultLoader.prototype._import = function (moduleId) {
    return new Promise(function (resolve, reject) {
      _aureliaPal.PLATFORM.global.require([moduleId], resolve, reject);
    });
  };

  InlineScriptDefaultLoader.prototype.loadModule = function (id) {
    var _this = this;

    var existing = this.moduleRegistry[id];
    if (existing !== undefined) {
      return Promise.resolve(existing);
    }

    return new Promise(function (resolve, reject) {
      _aureliaPal.PLATFORM.global.require([id], function (m) {
        _this.moduleRegistry[id] = m;
        resolve(ensureOriginOnExports(m, id));
      }, reject);
    });
  };

  InlineScriptDefaultLoader.prototype.map = function (id, source) {};

  InlineScriptDefaultLoader.prototype.normalize = function (moduleId, relativeTo) {
    return Promise.resolve(moduleId);
  };

  InlineScriptDefaultLoader.prototype.normalizeSync = function (moduleId, relativeTo) {
    return moduleId;
  };

  InlineScriptDefaultLoader.prototype.applyPluginToUrl = function (url, pluginName) {
    return pluginName + '!' + url;
  };

  InlineScriptDefaultLoader.prototype.addPlugin = function (pluginName, implementation) {
    var nonAnonDefine = define;
    nonAnonDefine(pluginName, [], {
      'load': function load(name, req, onload) {
        var result = implementation.fetch(name);
        Promise.resolve(result).then(onload);
      }
    });
  };

  
  /**
  * Gets or creates a TemplateRegistryEntry for the provided address.
  * @param address The address of the template.
  * @return The located or created TemplateRegistryEntry.
  */
 InlineScriptDefaultLoader.prototype.getOrCreateTemplateRegistryEntry = function(address) {
    return this.templateRegistry[address] || (this.templateRegistry[address] = new au.TemplateRegistryEntry(address));
  };

  return InlineScriptDefaultLoader;
})();
