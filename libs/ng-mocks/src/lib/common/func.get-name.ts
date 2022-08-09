const badCharacters = new RegExp('[^0-9a-z]+', 'mgi');

export default (value: any): string => {
  let result: string | undefined;

  if (typeof value === 'function' && value.name) {
    result = value.name;
  } else if (typeof value === 'function') {
    result = 'arrowFunction';
  } else if (typeof value === 'object' && value && value.ngMetadataName === 'InjectionToken') {
    result = value._desc;
  } else if (typeof value === 'object' && value && typeof value.constructor === 'function') {
    result = value.constructor.name;
  }

  result ||= 'unknown';

  return result.replace(badCharacters, '_');
};
