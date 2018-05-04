export default {
  port: 5007,
  key: '14189dc35ae35e75ff31d7502e245cd9bc7803838fbfd5c773cdcd79b8a28bbd',
  mimeTypes: [
    'image/jpeg',
    'image/png',
    'video/avi'
  ],
  modeOfWork: 'hidden', // 'hidden' || 'uncovered' - service operation mode
  requestFieldName: 'file', // multipart from data field name
  diskName: 'C', // disk name for inspection free space
  maxFileSize: 20, //Mb
  minFreeSpaceGb: 1,
  specialExtension: '.enc', // extension for encrypted files
  storagePath: `${__dirname}/modules/fileStorage/store` // path to be stored files
};
/*
 * Supported file types:
 *
 * jpg, png, gif, bmp, webp,
 * tif, cr2, jxr, psd, zip,
 * epub, xpi, tar, rar, gz,
 * bz2, 7z, dmg, mp4, m4v, midi,
 * mkv, webm, wmv, mpg, mov, avi,
 * mp3, m4a, opus, ogg, flac, wav,
 * amr, pdf, exe, swf, rtf, woff,
 * woff2, eot, ttf, otf, ico, ps,
 * flv, xz, sqlite, nes, crx, cab,
 * deb, rpm, Z, lz, msi, svg, flif, html
 *
 */
