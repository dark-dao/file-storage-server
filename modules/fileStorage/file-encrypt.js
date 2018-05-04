'use strict';
import Promise from 'bluebird';
import zlib from 'zlib';
import fs from 'fs';
import crypto from 'crypto';

import config from '../../config';

export default class EncryptFile {
  constructor(fileName, fileUrl, clientKey) {
    this.fileName = fileName;
    this.fileUrl = fileUrl;
    this.clientKey = clientKey;
  }
  on() {
    return new Promise ( (resolve, reject) => {
      const fileName = this.fileName;
      const fileUrl = this.fileUrl;
      fs.stat(fileUrl, (err, stats) => {
        if(err == null) {
          let encrypt = crypto.createCipher('aes-256-cbc', this.clientKey);
          let input = fs.createReadStream(fileUrl);
          let output = fs.createWriteStream(`${fileUrl}${config.specialExtension}`);
          const gzip = zlib.createGzip();

          input.pipe(gzip).pipe(encrypt).pipe(output);

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
