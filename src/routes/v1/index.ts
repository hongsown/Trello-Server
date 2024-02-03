import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { boardRoute } from './boardRoute';
const Router = express.Router();

Router.get('/status', (req, res) => {
    res.status(StatusCodes.OK).json({ status: 'OK', code: StatusCodes.OK });
});
// Board APIs
Router.use('/board', boardRoute);
export const API_V1 = Router;