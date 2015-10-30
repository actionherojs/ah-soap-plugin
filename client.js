var soap = require('soap');
var url = 'http://localhost:8080/soap?wsdl';

soap.createClient(url, function(err, client){
  client.cacheTest({key:'a', value:'b'}, function(error, result, body){
    if(error){
      console.log( error.toString() );
    }else{
      console.log(result);
    }
  });
});