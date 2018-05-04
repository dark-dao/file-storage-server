'use strict';
import cluster from 'cluster';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import morgan from 'morgan';
import bodyParser from 'body-parser';

import config from './config';
import {
  Router
} from './modules';

export default () => {
  if (cluster.isMaster) {
    let timeout;
    for(let i = 0; i < 3; i++) {
      cluster.fork();
    }
    cluster.on('disconnect', (worker, code, signal) => {
      clearTimeout(timeout);
      console.log('Отключен воркер с id: ', worker.id);
      cluster.fork();
    });
    cluster.on('exit', (worker, code, signal) => {
      console.log('Сингнал выхода из процесса от воркера с id: ', worker.id);
      worker.disconnect();
      timeout = setTimeout(() => {
        worker.kill();
      }, 2000);
    });
  } else {
    process.on('uncaughtException', e => {
      console.log(e);
      process.exit();
    });
    let server = express();
    server.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, If-None-Match, X-Requested-With, Content-Type, Accept, X-Access-Token");
      next();
    });
    server.use(cors());
    server.use(bodyParser.urlencoded({extended: false}));
    server.use(bodyParser.json());
    server.use(morgan('dev'));

    Router(server);

    server.listen(config.port, (error) => {
      if(error) {
        console.log(`File server is not run! Error: `, error);
      } else {
        console.log(`File server is running on ${config.port} port. Worker id: ${cluster.worker.id}`);
      }
    });
  }
};
