// tslint:disable:no-magic-numbers
import {
  queryAllMsg,
  queryChainLengthMsg,
  responseChainMsg,
  responseLatestMsg,
} from './network';

describe('network', () => {
  describe('responseChainMsg', () => {
    it('正しい値が取得できるか', () => {
      const blockchain = [
        {
          data: {},
          difficulty: 10,
          hash:
            '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7',
          index: 1,
          nonce: 1,
          previousHash: '0',
          timestamp: 1465154705,
        },
        {
          data: {},
          difficulty: 10,
          hash:
            '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7',
          index: 2,
          nonce: 2,
          previousHash: '0',
          timestamp: 1465154705,
        },
      ];
      const result = {
        accounts:
          '{"18f6708186322cad57b5cf28a015e25d2bfa932f6379e01002e9b3f9608ab48f":[{"address":"d10a95cf20878d34941ab7e49f2f502d886b721fb192c43106b64a7890d46306","value":10000}]}',
        assets:
          '[{"id":"18f6708186322cad57b5cf28a015e25d2bfa932f6379e01002e9b3f9608ab48f","name":"native token","description":"native token","total":10000,"decimals":0,"from":"","optional":{"transferable":true},"children":[]}]',
        data:
          '[{"data":{},"difficulty":10,"hash":"816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7","index":1,"nonce":1,"previousHash":"0","timestamp":1465154705},{"data":{},"difficulty":10,"hash":"816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7","index":2,"nonce":2,"previousHash":"0","timestamp":1465154705}]',
        escrow: '[]',
        type: 2,
      };
      expect(responseChainMsg(blockchain)).toEqual(result);
    });
  });

  describe('responseLatestMsg', () => {
    it('正しい値が取得できるか', () => {
      const blockchain = [
        {
          data: {},
          difficulty: 10,
          hash:
            '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7',
          index: 1,
          nonce: 1,
          previousHash: '0',
          timestamp: 1465154705,
        },
        {
          data: {},
          difficulty: 10,
          hash:
            '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7',
          index: 2,
          nonce: 2,
          previousHash: '0',
          timestamp: 1465154705,
        },
      ];
      const result = {
        accounts:
          '{"18f6708186322cad57b5cf28a015e25d2bfa932f6379e01002e9b3f9608ab48f":[{"address":"d10a95cf20878d34941ab7e49f2f502d886b721fb192c43106b64a7890d46306","value":10000}]}',
        assets:
          '[{"id":"18f6708186322cad57b5cf28a015e25d2bfa932f6379e01002e9b3f9608ab48f","name":"native token","description":"native token","total":10000,"decimals":0,"from":"","optional":{"transferable":true},"children":[]}]',
        data:
          '[{"data":{},"difficulty":10,"hash":"816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7","index":2,"nonce":2,"previousHash":"0","timestamp":1465154705}]',
        escrow: '[]',
        type: 2,
      };
      expect(responseLatestMsg(blockchain)).toEqual(result);
    });
  });

  describe('queryAllMsg', () => {
    it('正しい値が取得できるか', () => {
      const result = {
        accounts: '',
        assets: '',
        data: '',
        escrow: '',
        type: 1,
      };
      expect(queryAllMsg()).toEqual(result);
    });
  });

  describe('queryChainLengthMsg', () => {
    it('正しい値が取得できるか', () => {
      const result = {
        accounts: '',
        assets: '',
        data: '',
        escrow: '',
        type: 0,
      };
      expect(queryChainLengthMsg()).toEqual(result);
    });
  });
});
// tslint:enable:no-magic-numbers
