const axios = require('axios');
const fs = require('fs-extra');
const logger = require('./logger');

const downloader = {
  downloadFile: async (url, dest) => {
    try {
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(dest);

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } catch (error) {
      logger.error(`Failed to download from ${url}: ${error.message}`);
      throw error;
    }
  }
};

module.exports = downloader;

