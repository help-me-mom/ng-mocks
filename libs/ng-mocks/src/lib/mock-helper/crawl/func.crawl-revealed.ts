import { DebugNode } from '@angular/core';

import detectCrawler from './detect-crawler';
import mockHelperCrawl from './mock-helper.crawl';

export default (
  root: DebugNode,
  selector: Parameters<typeof detectCrawler>[0],
  callback: (node: DebugNode) => boolean | void,
): void => {
  const detector = detectCrawler(selector);

  // crawl already excludes text nodes and stops when the callback returns true.
  mockHelperCrawl(root, node => {
    if (node !== root && detector(node)) {
      return callback(node);
    }

    return false;
  });
};
