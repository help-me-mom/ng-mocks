import { mapEntries } from '../../common/core.helpers';

export default (source: Map<any, any>, destination: Map<any, any>): void => {
  for (const [key, value] of mapEntries(source)) {
    destination.set(key, value);
  }
};
