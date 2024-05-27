import { createNodeMiddleware, createProbot } from 'probot';

// This will be created after building the app
import { probotApp } from '../../../lib/app.js';

const requestListener = createNodeMiddleware(probotApp, {
  probot: createProbot(),
  webhooksPath: '/api/github/webhooks',
});

export default requestListener;
