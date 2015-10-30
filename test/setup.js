exports.setup = {
  serverPrototype: require("../node_modules/actionhero/actionhero.js").actionheroPrototype,
  serverConfigChanges: {
    general: {
      id: "test-server-1",
      workers: 1,
      developmentMode: false,
      plugins: [
        'ah-soap-plugin'
      ],
      paths: {
        plugin: [
          process.cwd() + '/../',
        ]
      }
    },
    logger: { transports: null, },
    // logger: {
    //   transports: [ 
    //     function(api, winston){
    //       return new (winston.transports.Console)({
    //         colorize: true,
    //         level: 'info',
    //         timestamp: api.utils.sqlDateTime
    //       });
    //     }
    //   ]
    // },
    servers: {
      web: { enabled: true, port: 9000 },
      websocket: { enabled: false },
      socket: { enabled: false},
    }
  },

  startServer: function(callback){
    var self = this;

    if(!self.server){
      process.env.ACTIONHERO_CONFIG = __dirname + '/../node_modules/actionhero/config/';
      process.env.PROJECT_ROOT      = __dirname + '/../node_modules/actionhero';

      self.server = new self.serverPrototype();
      self.server.start({configChanges: self.serverConfigChanges}, function(err, api){
        self.api = api;
        callback(err, self.api);
      });
    }else{
      process.nextTick(function(){
        callback();
      });
    }
  },

  stopServer: function(callback){
    var self = this;

    self.server.stop(function(){
      callback();
    });
  },
};