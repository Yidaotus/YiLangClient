import { setupServer } from 'msw/node';
import routes from './testRoutes';

const server = setupServer(...routes);

export default server;
