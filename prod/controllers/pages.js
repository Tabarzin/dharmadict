const elasticClient = require('../db/client');
const validator = require('./validators/pages.js');
const ApiError = require('./../helper').ApiError;
const logger = require('../log/logger');
const config = require('../config');

const findAll = () => new Promise((resolve, reject) => {
  elasticClient.search({
    index: config.db.index,
    type: 'pages'
  }).then(result => {
    let pages = result.hits.hits;
    if (!pages.length) {
      reject(new ApiError(`No pages found`, 404))
    } else {
      pages = pages.map(page => ({
        url: page._id,
        title: page._source.title
      }));
      resolve(pages)
    }
  }, error => {
    logger.error(error.message);
    reject(new ApiError('Database error'))
  });
});

const findByUrl = pageUrl => new Promise((resolve, reject) => {
  logger.info(`Find page by url ${pageUrl}`);
  if (!pageUrl || typeof pageUrl !== 'string') {
    return reject(new ApiError('Invalid url'))
  }
  elasticClient.search({
    index: config.db.index,
    type: 'pages',
    body: {
      query: {
        ids: {
          values: [pageUrl]
        }
      }
    }
  }).then(response => {
    let result = response.hits.hits[0];
    if (!result || !result._source) {
      reject(new ApiError('No page found', 404))
    } else {
      result._source.url = result._id;
      resolve(result._source)
    }
  },
  error => {
    logger.error(error);
    reject(new ApiError('Database error'))
  })
});

const create = (payload) => validator.create(payload)
  .then(page => {
    page.url = page.url.replace(/ /g, '_');
    logger.info(`Page adding: url "${page.url}"`);
    return page
  })
  .then(page =>
    findByUrl(page.url).then(() => {
      throw new ApiError('Already exists')
    }, error => {
      if (error.code === 404) {
        return page
      }
      throw error
    })
  )
  .then(page => {
    const url = page.url;
    delete page.url;
    return elasticClient.index({
      index: config.db.index,
      type: 'pages',
      id: url,
      body: payload,
      refresh: true
    }).then(() => {
      logger.info(`Page "${page.url}" was successfully created`);
      return url
    }, error => {
      logger.error(error.message);
      throw new ApiError('Database error')
    })
  })
  .then(pageUrl => findByUrl(pageUrl));

const update = (pageUrl, payload) => validator.update(pageUrl, payload)
  .then(() => findByUrl(pageUrl))
  .then(page => {
    let result = Object.assign({}, page, payload);
    delete result.url;
    return result
  })
  .then(body =>
    elasticClient.index({
      index: config.db.index,
      type: 'pages',
      id: pageUrl,
      body,
      refresh: true
    }).then(() => {
      logger.info('Page was successfully updated');
      return pageUrl
    }, error => {
      logger.error(error.message);
      throw new ApiError('DB error')
    })
  )
  .then(findByUrl);

const removeByUrl = pageUrl => findByUrl(pageUrl)
  .then(page =>
    elasticClient.delete({
      index: config.db.index,
      type: 'pages',
      id: page.url,
      refresh: true
    }).then(() =>
      logger.info(`Page "${page.url}" was successfully deleted`)
    , error => {
      logger.error(error.message);
      throw new ApiError('DB error')
    })
  );

module.exports = {
  removeByUrl,
  findByUrl,
  findAll,
  create,
  update
};
