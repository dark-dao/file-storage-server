export default {
  port: 5007,
  key: '14189dc35ae35e75ff31d7502e245cd9bc7803838fbfd5c773cdcd79b8a28bbd',
  mimeTypes: [
    'image/jpeg',
    'image/png'
  ],
  requestFieldName: 'file', // multipart from data field name
  diskName: 'C', // disk name for inspection free space
  minFreeSpaceGb: 1,
  specialExtencion: '.enc', // extension for encrypted files
  storagePath: `${__dirname}/modules/fileStorage/store` // path to be stored files
};
