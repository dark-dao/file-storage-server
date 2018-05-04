'use strict';
import Promise from 'bluebird';
import fs from 'fs';
import diskspace from 'diskspace';

import config from '../../config';

export default class Stats {
  constructor() {

  }
  getByteToGb(byte) {
    return Math.floor(byte / Math.pow(1024, 3));
  }
  getNumbersOfFiles() {
    return new Promise ( (resolve, reject) => {
      const { storagePath } = config;
      fs.readdir(storagePath, (err, files) => {
        if(err == null) {
          resolve({
            success: true,
            numbersOfFiles: files.length
          });
        } else {
          reject({
            success: false,
            message: 'Error check numbers of files',
            error: err
          });
        }
      });
    });
  }
  getDiskSpace() {
    return new Promise ( (resolve, reject) => {
      diskspace.check(config.diskName, (err, result) => {
        if(err) {
          reject({
            success: false,
            message: 'Error check disk space!',
            error: err
          });
        } else {
          const { free, total, used } = result;

          const freeSpaceGb = this.getByteToGb(free);
          const totalSpaceGb = this.getByteToGb(total);
          const usedSpaceGb = this.getByteToGb(used);

          const minDiffGb = 3;
          const diffGb = freeSpaceGb - config.minFreeSpaceGb;

          if(diffGb < minDiffGb) {
            resolve({
              success: true,
              freeSpaceGb,
              totalSpaceGb,
              usedSpaceGb,
              message: 'Free space ends!'
            });
          }
          if(freeSpaceGb > config.minFreeSpaceGb) {
            resolve({
              success: true,
              freeSpaceGb,
              totalSpaceGb,
              usedSpaceGb
            });
          } else {
            resolve({
              success: false,
              freeSpaceGb,
              totalSpaceGb,
              usedSpaceGb,
              message: 'Not enough disk space!'
            });
          }
        }
      });
    });
  }
  getStats() {
    return new Promise ( (resolve, reject) => {
      this.getDiskSpace().then((freeSpace) => {
        const { freeSpaceGb, totalSpaceGb, usedSpaceGb } = freeSpace;
        this.getNumbersOfFiles().then((numbers) => {
          const { numbersOfFiles } = numbers;
          resolve({
            success: true,
            freeSpaceGb,
            totalSpaceGb,
            usedSpaceGb,
            numbersOfFiles
          });
        }, (error) => {
          reject(error);
        });
      }, (error) => {
        reject(error);
      });
    });
  }
};
