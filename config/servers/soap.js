exports.default = {
  servers: {
    soap: function(api){
      return {
        enabled: true,
        path: '/soap',
        serviceName: 'actionHero', // do not add 'Service' to the end
        portName: 'actionHeroPort',
        publicHost: 'http://example.com',
      };
    }
  }
};
