import mockHelperCrawl from './crawl/mock-helper.crawl';
import mockHelperReveal from './crawl/mock-helper.reveal';
import mockHelperRevealAll from './crawl/mock-helper.reveal-all';
import mockHelperChange from './cva/mock-helper.change';
import mockHelperTouch from './cva/mock-helper.touch';
import mockHelperAutoSpy from './mock-helper.auto-spy';
import mockHelperDefaultMock from './mock-helper.default-mock';
import mockHelperFaster from './mock-helper.faster';
import mockHelperFind from './mock-helper.find';
import mockHelperFindAll from './mock-helper.find-all';
import mockHelperFindInstance from './mock-helper.find-instance';
import mockHelperFindInstances from './mock-helper.find-instances';
import mockHelperFlushTestBed from './mock-helper.flush-test-bed';
import mockHelperFormatHtml from './mock-helper.format-html';
import mockHelperGet from './mock-helper.get';
import mockHelperGlobalExclude from './mock-helper.global-exclude';
import mockHelperGlobalKeep from './mock-helper.global-keep';
import mockHelperGlobalMock from './mock-helper.global-mock';
import mockHelperGlobalReplace from './mock-helper.global-replace';
import mockHelperGlobalWipe from './mock-helper.global-wipe';
import mockHelperGuts from './mock-helper.guts';
import mockHelperInput from './mock-helper.input';
import mockHelperOutput from './mock-helper.output';
import mockHelperReset from './mock-helper.reset';
import mockHelperStub from './mock-helper.stub';
import mockHelperStubMember from './mock-helper.stub-member';
import mockHelperThrowOnConsole from './mock-helper.throw-on-console';
import mockHelperHide from './render/mock-helper.hide';
import mockHelperRender from './render/mock-helper.render';
import mockHelperFindTemplateRef from './template-ref/mock-helper.find-template-ref';
import mockHelperFindTemplateRefs from './template-ref/mock-helper.find-template-refs';

export default {
  autoSpy: mockHelperAutoSpy,
  change: mockHelperChange,
  crawl: mockHelperCrawl,
  defaultMock: mockHelperDefaultMock,
  faster: mockHelperFaster,
  find: mockHelperFind,
  findAll: mockHelperFindAll,
  findInstance: mockHelperFindInstance,
  findInstances: mockHelperFindInstances,
  findTemplateRef: mockHelperFindTemplateRef,
  findTemplateRefs: mockHelperFindTemplateRefs,
  flushTestBed: mockHelperFlushTestBed,
  formatHtml: mockHelperFormatHtml,
  get: mockHelperGet,
  globalExclude: mockHelperGlobalExclude,
  globalKeep: mockHelperGlobalKeep,
  globalMock: mockHelperGlobalMock,
  globalReplace: mockHelperGlobalReplace,
  globalWipe: mockHelperGlobalWipe,
  guts: mockHelperGuts,
  hide: mockHelperHide,
  input: mockHelperInput,
  output: mockHelperOutput,
  render: mockHelperRender,
  reset: mockHelperReset,
  reveal: mockHelperReveal,
  revealAll: mockHelperRevealAll,
  stub: mockHelperStub,
  stubMember: mockHelperStubMember,
  throwOnConsole: mockHelperThrowOnConsole,
  touch: mockHelperTouch,
};
