export default function errorList(validationErrors) {
  return Object.entries(validationErrors).flatMap(([errorKey, errors]) => {
    return errors.flatMap(error => {
      return {
        ...error,
        errorKey,
        ...{ 'errorId': `${error.id}_${error.message.split(' ').join('_')}` },
      };
    });
  });
}
