// tslint:disable:no-magic-numbers
enum MESSAGE_TYPE {
  QUERY_LATEST,
  QUERY_ALL,
  RESPONSE_BLOCKCHAIN,
}

const CONVERSIONS = {
  sec: 1000,
};

const TOTAL_SUPPLY = 10000;
// tslint:enable:no-magic-numbers

export { MESSAGE_TYPE, CONVERSIONS, TOTAL_SUPPLY };
