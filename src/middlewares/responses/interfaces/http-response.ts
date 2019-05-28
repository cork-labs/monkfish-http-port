
type dataMethod = (data: any) => void;
type dataMethods = 'ok' | 'created' | 'accepted' | 'nonAuthoritativeInformation';
type dataMethodType = { [dataKey in dataMethods]: dataMethod };

type noContentMethod = () => void;
type noContentMethods = 'noContent' | 'resetContent';
type noContentMethodType = { [dataKey in noContentMethods]: noContentMethod };

type errorMethod = (code: string, details?: any) => void;
type errorMethods = 'badRequest' |
  'unauthorized' |
  'paymentRequired' |
  'forbidden' |
  'notFound' |
  'methodNotAllowed' |
  'notAcceptable' |
  'proxyAuthenticationRequired' |
  'requestTimeout' |
  'conflict' |
  'gone' |
  'lengthRequired' |
  'preconditionFailed' |
  'payloadTooLarge' |
  'uriTooLong' |
  'unsupportedMediaType' |
  'rangeNotSatisfiable' |
  'expectationFailed' |
  'imATeapot' |
  'misdirectedRequest' |
  'unprocessableEntity' |
  'locked' |
  'failedDependency' |
  'unorderedCollection' |
  'upgradeRequired' |
  'preconditionRequired' |
  'tooManyRequests' |
  'requestHeaderFieldsTooLarge' |
  'unavailableForLegalReasons' |
  'internalServerError' |
  'notImplemented' |
  'badGateway' |
  'serviceUnavailable' |
  'gatewayTimeout' |
  'hTTPVersionNotSupported' |
  'variantAlsoNegotiates' |
  'insufficientStorage' |
  'loopDetected' |
  'bandwidthLimitExceeded' |
  'notExtended' |
  'networkAuthenticationRequired';

type errortMethodType = { [dataKey in errorMethods]: errorMethod };

export interface IHttpResponse extends dataMethodType, errortMethodType, noContentMethodType {

}
