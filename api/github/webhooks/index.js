import { createNodeMiddleware, createProbot } from 'probot';
import { probotApp } from '../../../lib/app.js';

export default createNodeMiddleware(probotApp, {
  probot: createProbot(),
  webhooksPath: '/api/github/webhooks',
});
