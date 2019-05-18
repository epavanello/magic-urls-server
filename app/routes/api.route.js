import { Router } from 'express';

import MetaController from '../controllers/meta.controller';
import AuthController from '../controllers/auth.controller';
import UsersController from '../controllers/users.controller';
import UrlsController from '../controllers/urls.controller';

import authenticate from '../middleware/authenticate';
import accessControl from '../middleware/access-control';
import errorHandler from '../middleware/error-handler';

const routes = new Router();

routes.get('/', MetaController.index);

// Authentication
routes.post('/auth/login', AuthController.login);
routes.post('/auth/signup', AuthController.signup);

// Users
routes.get('/users', UsersController.search);
routes.post('/users', UsersController.create);
routes.get('/users/me', authenticate, UsersController.fetch);
routes.put('/users/me', authenticate, UsersController.update);
routes.delete('/users/me', authenticate, UsersController.delete);
routes.get('/users/:username', UsersController._populate, UsersController.fetch);

// Url
routes.get('/urls', authenticate, UrlsController.search);
routes.post('/urls', authenticate, UrlsController.create);
routes.get('/urls/:id', UrlsController._populate, UrlsController.fetch);
routes.delete('/urls/:id', authenticate, UrlsController._populate, UrlsController.delete);
routes.delete('/urls', authenticate, UrlsController.deleteAll);

// Admin
routes.get('/admin', accessControl('admin'), MetaController.index);

routes.use(errorHandler);

export default routes;
