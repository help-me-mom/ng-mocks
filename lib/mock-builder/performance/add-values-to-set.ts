import { mapValues } from '../../common/core.helpers';

export default (source: Set<any>, destination: Set<any>): void => {
  for (const value of mapValues(source)) {
    destination.add(value);
  }
};
