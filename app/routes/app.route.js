import { Router } from 'express';
import UrlsController from '../controllers/urls.controller';

const routes = new Router();

routes.get('/go/:alias', UrlsController.go);

export default routes;
