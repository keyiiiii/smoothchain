const http_port = process.env.HTTP_PORT || 3000;
const p2p_port = process.env.P2P_PORT || 6001;
const initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];

export {
	http_port,
	p2p_port,
	initialPeers,
};