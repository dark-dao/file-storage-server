'use strict';
import Promise from 'bluebird';
import multer from 'multer';
import uuidV4 from 'uuid/v4';
import fs from 'fs';
import diskspace from 'diskspace';
import { map } from 'lodash';

import config from '../../config';

import EncryptFile from './file-encrypt';
import DecryptFile from './file-decrypt';

export default class FileStorage {
  constructor(clientKey) {
    this.clientKey = clientKey;
    this.uploadFileName = '';
  }
  getByteToGb(byte) {
    return Math.floor(byte / Math.pow(1024, 3));
  }
  getMbToByte(Mb) {
    return Math.floor(Mb * Math.pow(1024, 2));
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
          const freeSpaceGb = this.getByteToGb(result.free);
          if(freeSpaceGb > config.minFreeSpaceGb) {
            resolve({
              success: true,
              freeSpaceGb: freeSpaceGb
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
      const { storagePath, specialExtension } = config;
      fs.stat(`${storagePath}/${id}${specialExtension}`, (err, stats) => {
        if(err == null) {
          resolve({
            success: true,
            info: stats
          });
        } else {
          reject({
            success: false,
            message: 'File not found',
            error: err
          });
        }
      });
    });
  }
  checkMimeType(type) {
    let isExist = false;
    map(config.mimeTypes, item => {
      if(item === type) {
        isExist = true;
      }
    });
    return isExist;
  }
  delete(id) {
    return new Promise ( (resolve, reject) => {
      this.checkFile(id).then((isExist) => {
        const { storagePath, specialExtension } = config;
        fs.unlink(`${storagePath}/${id}${specialExtension}`, (err) => {
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
        const { storagePath, specialExtension } = config;
        const fullFilePath = `${storagePath}/${id}${specialExtension}`;
        const decryptFile = new DecryptFile(fullFilePath, this.clientKey);

        return decryptFile.on().then((result) => {
          return resolve(result);
        }, (error) => {
          return reject(error);
        }).catch((error) => {
          return reject();
        });
      }, (error) => {
        return reject(error);
      }).catch((error) => {
        return reject({
          success: false,
          error: error
        });
      });
    });
  }
  upload(req, res) {
    return new Promise ( (resolve, reject) => {
      this.checkDiskSpace().then((freeSpace) => freeSpace, (err) => {
        reject(err);
      }).then((space) => {
        let filename = uuidV4();
        let self = this;

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

        let storage = multer.diskStorage({
          destination: function (req, file, cb) {
            cb(null, config.storagePath);
          },
          filename: function (req, file, cb) {
            cb(null, filename);
          }
        });

        let uploadFile = multer({
          dest: config.storagePath,
          storage: storage,
          fileFilter: fileFilter,
          limits: {
            fileSize: this.getMbToByte(config.maxFileSize) //Mb to bytes
          }
        }).single(config.requestFieldName);

        uploadFile(req, res, function (error) {
          if (error) {
            reject({
              success: false,
              message: 'Error upload file!',
              error: error
            });
          } else {
            const fullFilePath = `${config.storagePath}/${filename}`;
            const ecryptFile = new EncryptFile(filename, fullFilePath, self.clientKey);
            ecryptFile.on().then(success => resolve(success), error => reject(error));
          }
        });
      }).catch((error) => {
        reject({
          success: false,
          error: error
        });
      });
    });
  }
};
