# ah-soap-plugin

[![Build Status](https://travis-ci.org/evantahler/ah-soap-plugin.svg?branch=master)](https://travis-ci.org/evantahler/ah-soap-plugin)

- I rely on the built-in web server for actionhero.  Be sure that it is enabled.  You use the normal web servers' host/and port options for configuration
- you wsdl file will be saved and generated at boot to the file defined with `api.config.servers.soap.wsdlFile`

An example WSDL which is generated looks like:

```xml

<?xml version="1.0"?>
<wsdl:definitions name="actionHero" targetNamespace="http://example.com/soap.wsdl" xmlns:tns="http://example.com/soap.wsdl" xmlns:xsd1="http://example.com/soap.xsd" xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/">

  <wsdl:types>
    <xsd:schema targetNamespace="http://example.com/soap.xsd" xmlns:xsd="http://www.w3.org/2000/10/XMLSchema">
      <xsd:element name="cacheTest">
        <xsd:complexType>
            <xsd:all>
                <xsd:element name="key" type="string"/>
                <xsd:element name="value" type="string"/>
            </xsd:all>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="sleepTest">
        <xsd:complexType>
            <xsd:all>
                <xsd:element name="sleepDuration" type="string"/>
            </xsd:all>
        </xsd:complexType>
      </xsd:element>
    </xsd:schema>
  </wsdl:types>

  <wsdl:message name="cacheTestInput">
     <wsdl:part name="body" element="xsd1:cacheTest"/>
  </wsdl:message>
  <wsdl:message name="cacheTestOutput">
     <wsdl:part name="body" element="xsd1:output"/>
  </wsdl:message>
  <wsdl:message name="randomNumberInput">
     <wsdl:part name="body" element="xsd1:randomNumber"/>
  </wsdl:message>
  <wsdl:message name="randomNumberOutput">
     <wsdl:part name="body" element="xsd1:output"/>
  </wsdl:message>
  <wsdl:message name="showDocumentationInput">
     <wsdl:part name="body" element="xsd1:showDocumentation"/>
  </wsdl:message>
  <wsdl:message name="showDocumentationOutput">
     <wsdl:part name="body" element="xsd1:output"/>
  </wsdl:message>
  <wsdl:message name="sleepTestInput">
     <wsdl:part name="body" element="xsd1:sleepTest"/>
  </wsdl:message>
  <wsdl:message name="sleepTestOutput">
     <wsdl:part name="body" element="xsd1:output"/>
  </wsdl:message>
  <wsdl:message name="statusInput">
     <wsdl:part name="body" element="xsd1:status"/>
  </wsdl:message>
  <wsdl:message name="statusOutput">
     <wsdl:part name="body" element="xsd1:output"/>
  </wsdl:message>

  <wsdl:portType name="actionHeroPortType">
    <wsdl:operation name="cacheTest">
      <wsdl:input  message="tns:cacheTestInput"/>
      <wsdl:output message="tns:cacheTestOutput"/>
    </wsdl:operation>
    <wsdl:operation name="randomNumber">
      <wsdl:input  message="tns:randomNumberInput"/>
      <wsdl:output message="tns:randomNumberOutput"/>
    </wsdl:operation>
    <wsdl:operation name="showDocumentation">
      <wsdl:input  message="tns:showDocumentationInput"/>
      <wsdl:output message="tns:showDocumentationOutput"/>
    </wsdl:operation>
    <wsdl:operation name="sleepTest">
      <wsdl:input  message="tns:sleepTestInput"/>
      <wsdl:output message="tns:sleepTestOutput"/>
    </wsdl:operation>
    <wsdl:operation name="status">
      <wsdl:input  message="tns:statusInput"/>
      <wsdl:output message="tns:statusOutput"/>
    </wsdl:operation>
  </wsdl:portType>

  <wsdl:binding name="actionHeroSoapBinding" type="tns:actionHeroPortType">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    <wsdl:operation name="cacheTest">
      <soap:operation soapAction="http://example.com/cacheTest"/>
      <wsdl:input> <soap:body use="literal"/></wsdl:input> 
      <wsdl:output><soap:body use="literal"/></wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="randomNumber">
      <soap:operation soapAction="http://example.com/randomNumber"/>
      <wsdl:input> <soap:body use="literal"/></wsdl:input> 
      <wsdl:output><soap:body use="literal"/></wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="showDocumentation">
      <soap:operation soapAction="http://example.com/showDocumentation"/>
      <wsdl:input> <soap:body use="literal"/></wsdl:input> 
      <wsdl:output><soap:body use="literal"/></wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="sleepTest">
      <soap:operation soapAction="http://example.com/sleepTest"/>
      <wsdl:input> <soap:body use="literal"/></wsdl:input> 
      <wsdl:output><soap:body use="literal"/></wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="status">
      <soap:operation soapAction="http://example.com/status"/>
      <wsdl:input> <soap:body use="literal"/></wsdl:input> 
      <wsdl:output><soap:body use="literal"/></wsdl:output>
    </wsdl:operation>
  </wsdl:binding>

  <wsdl:service name="actionHeroService">
    <wsdl:port name="actionHeroPort" binding="tns:actionHeroSoapBinding">
      <soap:address location="http://0.0.0.0:9000/soap"/>
    </wsdl:port>
  </wsdl:service>
</wsdl:definitions>
```

# TODO
- This server does not yet work with more than one version of an action.  The latest version will always be used
