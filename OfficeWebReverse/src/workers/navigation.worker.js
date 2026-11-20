import { resolveNavigationRequest } from './navigationRoutes.js';

self.onmessage = ({ data }) => {
  self.postMessage(resolveNavigationRequest(data));
};
