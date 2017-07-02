'use strict';

import express from 'express';
import cors from 'cors';

let app = express();
let privateApp = express();

import morgan from 'morgan';
import bodyParser from 'body-parser';

import config from './config';
import {
  FileStorage,
  Stats
} from './modules';

export default () => {
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, If-None-Match, X-Requested-With, Content-Type, Accept, X-Access-Token");
    next();
  });
  app.use(cors());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());
  app.use(morgan('dev')); // log every request to the console
  app.listen(config.port, () => {
    console.log(`File server is running on ${config.port} port`);
  });
};

app.get('/file/:id', (req, res) => {
  const imgId = req.params.id;
  const getFile = new FileStorage().get(imgId);
  getFile.then((result) => {
    res.writeHead(200,{'Content-type':result.mime});
    res.end(result.file);
  }, (err) => {
    res.status(500).json(err);
  });
});

app.post('/file',  (req, res) => {
  const uploadFile = new FileStorage().upload(req, res);
  uploadFile.then((success) => {
    res.status(200).json(success);
  }, (err) => {
    res.status(500).json(err);
  });
});

app.delete('/file/:id', (req, res) => {
  const imgId = req.params.id;
  const deleteFile = new FileStorage().delete(imgId);
  deleteFile.then((success) => {
    res.status(200).json(success);
  }, (err) => {
    res.status(500).json(err);
  });
});

app.get('/stats', (req, res) => {
  const stats = new Stats();
  stats.getStats().then((stats) => {
    res.status(200).json(stats);
  }, (error) => {
    res.status(200).json(error);
  });
});
