'use strict';
import Promise from 'bluebird';
import cluster from 'cluster';

import config from '../../config';
import {
  FileStorage,
  Stats
} from '../';

export default (server) => {
  const generateUserKey = (req, res, next) => {
    // set secret key for encrypt files
    console.log(`Request on worker id: ${cluster.worker.id}`);
    req.clientKey = config.key;
    next();
  };

  server.get('/file/:id', generateUserKey, (req, res) => {
    const imgId = req.params.id;
    const getFile = new FileStorage(req.clientKey).get(imgId);
    getFile.then((result) => {
      res.writeHead(200,{'Content-type':result.mime});
      res.write(result.file);
      res.end(result.file);
    }, (err) => {
      res.status(500).json(err);
    }).catch((err) => {
      console.log(err);
      res.status(500);
    });
  });

  server.post('/file', generateUserKey, (req, res) => {
    const uploadFile = new FileStorage(req.clientKey).upload(req, res);
    uploadFile.then((success) => {
      res.status(200).json(success);
    }, (err) => {
      res.status(500).json(err);
    }).catch((err) => {
      console.log(err);
      res.status(500);
    });
  });

  server.delete('/file/:id', (req, res) => {
    const imgId = req.params.id;
    const deleteFile = new FileStorage(req.clientKey).delete(imgId);
    deleteFile.then((success) => {
      res.status(200).json(success);
    }, (err) => {
      res.status(500).json(err);
    }).catch((err) => {
      console.log(err);
      res.status(500);
    });
  });

  server.get('/stats', (req, res) => {
    const stats = new Stats();
    stats.getStats().then((stats) => {
      res.status(200).json(stats);
    }, (error) => {
      res.status(500).json(error);
    }).catch((err) => {
      console.log(err);
      res.status(500);
    });
  });
};
