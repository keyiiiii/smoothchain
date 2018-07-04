// tslint:disable:no-magic-numbers
enum MESSAGE_TYPE {
  QUERY_LATEST,
  QUERY_ALL,
  RESPONSE_BLOCKCHAIN,
}

const CONVERSIONS = {
  sec: 1000,
};

const NATIVE_TOKEN = {
  ID: '18f6708186322cad57b5cf28a015e25d2bfa932f6379e01002e9b3f9608ab48f',
  NAME: 'nativeToken',
  DESCRIPTION: 'native token',
  DECIMALS: 0,
  TOTAL: 10000,
};

const STATUS_CODE = {
  UNAUTHORIZED: 401,
};

// tslint:enable:no-magic-numbers

export { MESSAGE_TYPE, CONVERSIONS, NATIVE_TOKEN, STATUS_CODE };
