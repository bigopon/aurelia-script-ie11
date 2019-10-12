function startApp() {
  var aurelia = window.aurelia = new au.Aurelia();
  aurelia
    .use
    .standardConfiguration()
    .developmentLogging();

  return aurelia
    .start()
    .then(function() {
      return aurelia.setRoot('app', document.body);
    });
}

startApp();
