'use strict';

import Promise from 'bluebird';
import fs from 'fs';
import crypto from 'crypto';

import config from '../../config';

export default class EncryptFile {
  constructor(fileName, fileUrl) {
    this.fileName = fileName;
    this.fileUrl = fileUrl;
  }
  on() {
    return new Promise ( (resolve, reject) => {
      const fileName = this.fileName;
      const fileUrl = this.fileUrl;
      fs.stat(fileUrl, (err, stats) => {
        if(err == null) {
          let cipher = crypto.createCipher('aes-256-cbc', config.key);
          let input = fs.createReadStream(fileUrl);
          let output = fs.createWriteStream(`${fileUrl}${config.specialExtencion}`);

          input.pipe(cipher).pipe(output);
          output.on('finish', function() {
            fs.unlink(fileUrl, (err) => {
              if(err) {
                reject({
                  success: false,
                  message: err
                });
              } else {
                resolve({
                  success: true,
                  id: fileName,
                  message: 'Encrypted file written to disk!'
                });
              }
            });
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
};
