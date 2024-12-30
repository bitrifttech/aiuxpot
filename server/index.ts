import { FileServer } from './fileServer';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const server = new FileServer();

server.listen(PORT);
