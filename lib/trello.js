'use strict';

const client = require('superagent');
const auth = {
  key: process.env.TRELLO_API_KEY,
  token: process.env.TRELLO_API_TOKEN,
};
const mealsBoardId = '5af2142f7e804647c0a4543e';
const webhookUrl = 'https://16c10159.ngrok.io/webhook';

function getUrl(endpoint) {
  const baseUri = process.env.TRELLO_API_BASEURI;
  return `${baseUri}/${endpoint}`;
}

/**
 * @param {String} endpoint
 * @return {Promise}
 */
function executeGet(endpoint) {
  const url = getUrl(endpoint);
  console.log('trello.executeGet', { url, auth });
  return client.get(endpoint).query(auth);
}

/**
 * @param {String} endpoint
 * @return {Promise}
 */
function executePost(endpoint, data) {
  const url = getUrl(endpoint);
  console.log('trello.executePost', { url, auth, data });
  return client.post(endpoint).query(auth).send(data)
    .then(res => Promise.resolve(res))
    .catch(err => Promise.reject(err));
}


function fetchBoards() {
  return executeGet('members/me/boards');
}

function createCommentForCardIdAndText(cardId, text) {
  const url = getUrl(`cards/${cardId}/actions/comments`);
  const query = Object.assign(auth, { text });
  return client.post(url).query(query);
}

function createWebhook() {
  const url = getUrl(`tokens/${auth.token}/webhooks`);
  const data = {
    description: `Webhook for ${mealsBoardId} updates`,
    callbackURL: webhookUrl,
    idModel: mealsBoardId,
  };
  return executePost(url, data);
}

/**
 * @param {Object} data
 */
function handleWebhookRequest(payload) {
  const createCardActionType = 'createCard';
  const updateCustomFieldActionType = 'updateCustomFieldItem';
  const actionType = payload.action.type;

  if (actionType !== createCardActionType && actionType !== updateCustomFieldActionType) {
    console.log('ignoring actionType', actionType);
  }

  const actionData = payload.action.data;
  console.log('actionData', actionData);
  const cardId = actionData.card.id;
  if (!actionData.customFieldItem) {
    return;
  }
  const lastHadDate = actionData.customFieldItem.value.date;
  const commentText = `Last had on ${lastHadDate}`;
  return createCommentForCardIdAndText(cardId, commentText)
    .then(res => console.log(res))
    .catch(err => console.log(err));
}

module.exports = {
  createWebhook,
  executeGet,
  fetchBoards,
  handleWebhookRequest,
};
