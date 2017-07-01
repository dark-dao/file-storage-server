'use strict';
import Promise from 'bluebird';

import multer from 'multer';
import uuidV4 from 'uuid/v4';
import fs from 'fs';
import diskspace from 'diskspace';
import _ from 'lodash';

import EncryptFile from './file-encrypt';
import DecryptFile from './file-decrypt';

import config from '../../config';

export default class FileStorage {
  constructor() {

  }
  getByteToGb(gb) {
    return Math.pow(2, 9)
  }
  checkDiskSpace() {
    return new Promise ( (resolve, reject) => {
      diskspace.check(config.diskName, (err, result) => {
        if(err) {
          reject({
            success: false,
            message: err
          });
        } else {
          const space = result.free;
          if(space > this.getByteToGb(config.minFreeSpaceGb)) {
            resolve({
              success: true,
              freeSpace: result.free
            });
          } else {
            reject({
              success: false,
              message: 'Not enough disk space'
            });
          }
        }
      });
    });
  }
  checkFile(id) {
    return new Promise ( (resolve, reject) => {
      const { storagePath, specialExtencion } = config;
      fs.stat(`${storagePath}/${id}${specialExtencion}`, (err, stats) => {
        if(err == null) {
          resolve({
            success: true,
            info: stats
          });
        } else {
          reject({
            success: false,
            message: err
          });
        }
      });
    });
  }
  checkMimeType(type) {
    let isExist = false;
    _.map(config.mimeTypes, item => {
      if(item === type) {
        isExist = true;
      }
    });
    return isExist;
  }
  delete(id) {
    return new Promise ( (resolve, reject) => {
      this.checkFile(id).then((isExist) => {
        const { storagePath, specialExtencion } = config;
        fs.unlink(`${storagePath}/${id}${specialExtencion}`, (err) => {
          if(err) {
            reject({
              success: false,
              message: err
            });
          } else {
            resolve({
              id: id,
              success: true,
              message: 'File is deleted!'
            });
          }
        });
      }, (err) => {
        reject(err);
      });
    });
  }
  get(id) {
    return new Promise ( (resolve, reject) => {
      this.checkFile(id).then((isExist) => {
        const { storagePath, specialExtencion } = config;
        const fullFilePath = `${storagePath}/${id}${specialExtencion}`;
        const decryptFile = new DecryptFile(fullFilePath);
        decryptFile.on().then((result) => {
          resolve(result);
        }, (error) => {
          reject(error);
        });
      }, (err) => {
        reject(err);
      });
    });
  }
  upload(req, res) {
    return new Promise ( (resolve, reject) => {
      this.checkDiskSpace().then((freeSpace) => freeSpace, (err) => {
        reject(err);
      }).then((space) => {

        const fileName = uuidV4();
        const fullFilePath = `${config.storagePath}/${fileName}`;
        const ecryptFile = new EncryptFile(fileName, fullFilePath);

        let storage = multer.diskStorage({
          destination: function (req, file, cb) {
            cb(null, config.storagePath);
          },
          filename: function (req, file, cb) {
              cb(null, fileName);
          }
        });

        let fileFilter = (req, file, cb) => {
          const isAvailableType = this.checkMimeType(file.mimetype);
          if(isAvailableType) {
            cb(null, true);
          } else {
            reject({
              success: false,
              message: 'Mime type is not available'
            });
            cb(null, false);
          }
        };

        let uploadFile = multer({
          dest: config.storagePath,
          storage: storage,
          fileFilter: fileFilter
        }).single(config.requestFieldName);

        uploadFile(req, res, function (err) {
          if (err) {
            reject({
              success: false,
              message: err
            });
          } else {
            ecryptFile.on().then(success => resolve(success), error => reject(error));
          }
        });
      });
    });
  }
};
