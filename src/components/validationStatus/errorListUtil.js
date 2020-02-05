import uniqueId from 'lodash/uniqueId';

export default function errorList(validationErrors) {
  return Object.entries(validationErrors).flatMap(([errorKey, errors]) => {
    return errors.flatMap(error => {
      return {
        ...error,
        errorKey,
        ...{ 'errorId': `${ uniqueId('id') }_${ error.id }` },
      };
    });
  });
}
