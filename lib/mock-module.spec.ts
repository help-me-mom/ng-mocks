import { ParentModule } from './test-fixtures';
import { MockModule } from './mock-module';

describe('MockModule', () => {
  it('should do stuff', () => {
    MockModule(ParentModule);
  });
});
