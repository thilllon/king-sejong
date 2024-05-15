import { createNodeMiddleware, createProbot } from 'probot';
import { probotApp } from './app.js';

export default createNodeMiddleware(probotApp, {
  probot: createProbot(),
  webhooksPath: '/lib/github',
});
