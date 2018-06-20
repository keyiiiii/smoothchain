// tslint:disable:no-magic-numbers
const httpPort = process.env.HTTP_PORT || 3000;
const p2pPort = process.env.P2P_PORT || 6001;
const initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];

export { httpPort, p2pPort, initialPeers };
// tslint:enable:no-magic-numbers
