import { createNodeMiddleware, createProbot } from 'probot';
import { probotApp } from '../../../lib/app.js';

const requestListener = createNodeMiddleware(probotApp, {
  probot: createProbot(),
  webhooksPath: '/api/github/webhooks',
});

export default requestListener;
