var should = require("should");
var setup  = require(__dirname + "/setup.js").setup;
var soap   = require("soap");
var client;


describe('integration', function(){  
  
  before(function(done){
    setup.startServer(function(){
      var wsdlUrl = 'http://localhost:' + setup.serverConfigChanges.servers.web.port + '/soap?wsdl';
      soap.createClient(wsdlUrl, function(err, c){
        should.not.exist(err);
        client = c;
        done();
      });
    });
  });

  after(function(done){
    setup.stopServer(done);
  });

  it("actionhero server should have booted and loaded the plugin", function(done){
    setup.api.should.be.an.instanceOf(Object);
    setup.api.id.should.equal('test-server-1');
    setup.api.config.servers.soap.enabled.should.equal(true);
    done();
  });

  it('will list all available actions in the WSDL', function(done){
    (typeof client.randomNumber).should.equal('function');
    (typeof client.cacheTest).should.equal('function');
    (typeof client.status).should.equal('function');

    done();
  });

  it('works with actions which require no inputs', function(done){
    client.randomNumber(function(error, response){
      should.not.exist(error);
      response.randomNumber.should.exist;
      response.context.should.equal('response');
      done();
    });
  });

  it('works with slow/async actions', function(done){
    client.sleepTest(function(error, response){
      should.not.exist(error);
      done();
    });
  });

  it('works with actions which require inputs', function(done){
    var params = {key: 'testKey', value: 'testValue'};
    client.cacheTest(params, function(error, response){
      should.not.exist(error);
      response.context.should.equal('response');
      response.cacheTestResults.saveResp.should.equal('true');
      response.cacheTestResults.deleteResp.should.equal('true');
      done();
    });
  });

  it('returns the proper error message when something goes wrong', function(done){
    var params = {key: 'a', value: 'b'};
    client.cacheTest(params, function(error){
      should.exist(error);
      String(error).should.equal('Error: soap:Client.validator_errors: Error: `value` should be at least 3 letters long');
      done();
    });
  });

  it('will not show actions in the WSDL that are not enabled for the SOAP server');

});
