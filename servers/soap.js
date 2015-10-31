var soap = require("soap");
var uuid = require("uuid");
var fs   = require("fs");

var initialize = function(api, options, next){

  //////////
  // INIT //
  //////////

  var type = "soap";
  var attributes = {
    canChat: false,
    logConnections: false,
    logExits: false,
    sendWelcomeMessage: false,
    verbs: [],
  };

  var server = new api.genericServer(type, options, attributes);

  //////////////////////
  // REQUIRED METHODS //
  //////////////////////

  server.start = function(next){
    var self = this;
    var webserver = api.servers.servers.web;
    var soapService = {};

    server.releventActionNames = [];
    for(var actionName in api.actions.actions){
      // TODO: Support multiple versions of each action

      var latestAction;
      for(var version in api.actions.actions[actionName]){
        latestAction = api.actions.actions[actionName][version];
      }

      if(!latestAction.blockedConnectionTypes || latestAction.blockedConnectionTypes.indexOf('soap') < 0 ){
        server.releventActionNames.push(actionName);
      }
    }

    var wsdl = server.buildWsdl();

    soapService[api.config.servers.soap.serviceName + 'Service'] = {};
    soapService[api.config.servers.soap.serviceName + 'Service'][api.config.servers.soap.portName] = {};    

    server.releventActionNames.forEach(function(actionName){
      soapService[api.config.servers.soap.serviceName + 'Service'][api.config.servers.soap.portName][actionName] = function(args, next, headers, req){
        server.buildConnection({
          rawConnection  : {
            args: args, 
            headers: headers, 
            actionName: actionName,
            next: next,
          },
          remoteAddress  : req.connection.remoteAddress,
          remotePort     : req.connection.remotePort,
          id             : uuid.v4(),
        });
      };
    });

    soap.listen(webserver.server, api.config.servers.soap.path, soapService, wsdl);
    next();
  };

  server.stop = function(next){
    next();
  };

  server.goodbye = function(connection, reason){
    //
  };

  server.sendMessage = function(connection, message, actionStatus){
    
    if(message.error){ 
      var faultcode = '';
      if(!actionStatus){ actionStatus = 'unknown_error'; }

      if(actionStatus === 'server_error'){ faultcode = 'soap:Server.' + actionStatus; }
      else{ faultcode = 'soap:Client.' + actionStatus; }

      var e = {
        // This is a hack due to bad error parsing: https://github.com/vpulim/node-soap/pull/752
        Fault: {
          faultcode: {'$value': faultcode, attributes: {"value":faultcode} },
          faultstring: {'$value': String(message.error), attributes: {"value": String(message.error)} }
        }
      };

      connection.rawConnection.next(e);
    }else{
      connection.rawConnection.next(null, message);
    }

    connection.destroy();
  };

  server.buildWsdl = function(){
    var wsdl = '';
    var actionName;

    wsdl += '\r\n<?xml version="1.0"?>';
    wsdl += '\r\n<wsdl:definitions name="' + api.config.servers.soap.serviceName + '" targetNamespace="' + api.config.servers.soap.publicHost + api.config.servers.soap.path + '.wsdl" xmlns:tns="' + api.config.servers.soap.publicHost + api.config.servers.soap.path + '.wsdl" xmlns:xsd1="' + api.config.servers.soap.publicHost + api.config.servers.soap.path + '.xsd" xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/">';
  

    // types
    wsdl += '\r\n';

    wsdl += '\r\n  <wsdl:types>';
    wsdl += '\r\n    <xsd:schema targetNamespace="' + api.config.servers.soap.publicHost + api.config.servers.soap.path + '.xsd" xmlns:xsd="http://www.w3.org/2000/10/XMLSchema">';

    server.releventActionNames.forEach(function(actionName){
      var latestAction;

      for(var version in api.actions.actions[actionName]){
        latestAction = api.actions.actions[actionName][version];
      }

      if( api.utils.hashLength(latestAction.inputs) > 0 ){
        wsdl += '\r\n      <xsd:element name="' + latestAction.name + '">';
        wsdl += '\r\n        <xsd:complexType>';
        wsdl += '\r\n            <xsd:all>';
        // Note: All params at this level will be strings; the action should validate types
        for(var key in latestAction.inputs){
          wsdl += '\r\n                <xsd:element name="' + key + '" type="string"/>';
        }
        wsdl += '\r\n            </xsd:all>';
        wsdl += '\r\n        </xsd:complexType>';
        wsdl += '\r\n      </xsd:element>';
      }
    });

    wsdl += '\r\n    </xsd:schema>';
    wsdl += '\r\n  </wsdl:types>';

    // messages
    wsdl += '\r\n';

    server.releventActionNames.forEach(function(actionName){
      wsdl += '\r\n  <wsdl:message name="' + actionName + 'Input">';
      wsdl += '\r\n     <wsdl:part name="body" element="xsd1:' + actionName + '"/>';
      wsdl += '\r\n  </wsdl:message>';
      wsdl += '\r\n  <wsdl:message name="' + actionName + 'Output">';
      // Note: all responses have the single payload "output"
      wsdl += '\r\n     <wsdl:part name="body" element="xsd1:output"/>';
      wsdl += '\r\n  </wsdl:message>';
    });

    // operations
    wsdl += '\r\n';

    wsdl += '\r\n  <wsdl:portType name="' + api.config.servers.soap.serviceName + 'PortType">';
    server.releventActionNames.forEach(function(actionName){
      wsdl += '\r\n    <wsdl:operation name="' + actionName + '">';
      wsdl += '\r\n      <wsdl:input  message="tns:' + actionName + 'Input"/>';
      wsdl += '\r\n      <wsdl:output message="tns:' + actionName + 'Output"/>';
      wsdl += '\r\n    </wsdl:operation>';
    });
    wsdl += '\r\n  </wsdl:portType>';

    // binding
    wsdl += '\r\n';

    wsdl += '\r\n  <wsdl:binding name="' + api.config.servers.soap.serviceName + 'SoapBinding" type="tns:' + api.config.servers.soap.serviceName + 'PortType">';
    wsdl += '\r\n    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>';

    server.releventActionNames.forEach(function(actionName){
      wsdl += '\r\n    <wsdl:operation name="' + actionName + '">';
      wsdl += '\r\n      <soap:operation soapAction="' + api.config.servers.soap.publicHost + '/' + actionName + '"/>';
      wsdl += '\r\n      <wsdl:input> <soap:body use="literal"/></wsdl:input> ';
      wsdl += '\r\n      <wsdl:output><soap:body use="literal"/></wsdl:output>';
      wsdl += '\r\n    </wsdl:operation>';
    });

    wsdl += '\r\n  </wsdl:binding>';

    // service
    wsdl += '\r\n';

    wsdl += '\r\n  <wsdl:service name="' + api.config.servers.soap.serviceName + 'Service">';
    wsdl += '\r\n    <wsdl:port name="' + api.config.servers.soap.portName + '" binding="tns:' + api.config.servers.soap.serviceName + 'SoapBinding">';
    wsdl += '\r\n      <soap:address location="http://' + api.config.servers.web.bindIP + ':' + api.config.servers.web.port + api.config.servers.soap.path + '"/>';
    wsdl += '\r\n    </wsdl:port>';
    wsdl += '\r\n  </wsdl:service>';

    wsdl += '\r\n</wsdl:definitions>';

    api.log(wsdl, 'debug');

    if(api.config.servers.soap.wsdlFile){
      fs.writeFileSync(api.config.servers.soap.wsdlFile, wsdl);
    }

    return wsdl;
  };

  ////////////
  // EVENTS //
  ////////////

  server.on("connection", function(connection){
    connection.params = connection.rawConnection.args;
    connection.params.action = connection.rawConnection.actionName;
    server.processAction(connection);
  });

  server.on('actionComplete', function(data){
    if(data.toRender === true){
      data.response.context = 'response';
      server.sendMessage(data.connection, data.response, data.actionStatus);
    }
  });

  /////////////
  // HELPERS //
  /////////////

  next(server);
};

/////////////////////////////////////////////////////////////////////
// exports
exports.initialize = initialize;
