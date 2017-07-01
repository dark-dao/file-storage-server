'use strict';

import Promise from 'bluebird';
import fs from 'fs';
import crypto from 'crypto';
import uuidV4 from 'uuid/v4';
import fileType from 'file-type';

import config from '../../config';

export default class DecryptFile {
  constructor(fileUrl) {
    this.fileUrl = fileUrl;
  }
  checkFIleType(fileUrl) {
    return new Promise ( (resolve, reject) => {
      fs.readFile(fileUrl, (err, result) => {
        if(err == null) {
          let fileInfo = fileType(result);
          this.setExtOnDecryptedFile(fileUrl, fileInfo.ext).then((fileRename) => {
            resolve({ success: true, ext: fileInfo.ext, mime: fileInfo.mime });
          }, (error) => {
            reject(error);
          });
        } else {
          reject({ success: false, message: err });
        }
      });
    });
  }
  setExtOnDecryptedFile(fileUrl, ext) {
    return new Promise ( (resolve, reject) => {
      fs.rename(fileUrl, `${fileUrl}.${ext}`, function (err) {
        if (err == null) {
          resolve({
            success: true,
            message: 'File renamed'
          })
        } else {
          reject({
            success: false,
            message: err
          })
        }
      });
    });
  }
  on() {
    return new Promise ( (resolve, reject) => {
      fs.readFile(this.fileUrl, (err, result) => {
        if(err) {
          reject({
            success: false,
            message: err
          });
        } else {
          let cipher = crypto.createDecipher('aes-256-cbc', config.key);
          let input = fs.createReadStream(this.fileUrl);
          const cashFileName = uuidV4();
          let output = fs.createWriteStream(`${__dirname}/${cashFileName}`);

          input.pipe(cipher).pipe(output);

          output.on('finish', () => {
            this.checkFIleType(`${__dirname}/${cashFileName}`).then((fileInfo) => {
                const {ext, mime} = fileInfo;

                fs.readFile(`${__dirname}/${cashFileName}.${ext}`, (err, content) => {
                  if(err == null) {
                    fs.unlink(`${__dirname}/${cashFileName}.${ext}`, (error) => {
                      if(error == null) {
                        resolve({
                          success: true,
                          file: content,
                          ext: ext,
                          mime: mime
                        });
                      } else {
                        reject({
                          success: false,
                          message: error
                        });
                      }
                    });
                  } else {
                    reject({
                      success: false,
                      message: err
                    });
                  }
                });

            }, (error) => {
              reject(error);
            });
          });
        }
      });
    });
  }
};
