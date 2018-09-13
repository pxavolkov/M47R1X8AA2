import io from 'socket.io-client';

const client = io('/', {path: '/api/socket.io', autoConnect: false});

export default client;

export function connect(token: string) {
  client.io.opts.query = `token=${token}`;
  client.open();
}

export function disconnect() {
  client.close();
}
