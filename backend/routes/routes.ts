import express from 'express';
import { libraryRouter } from './Library';
import { authRouter } from './Auth';
import { nextRouter } from './Next';

export const routes = express.Router();

routes.use('/', authRouter);

routes.use('/', libraryRouter);

routes.use('/', nextRouter);

export default routes;