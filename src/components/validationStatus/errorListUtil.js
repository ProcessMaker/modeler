export default function errorList(validationErrors) {
  return Object.entries(validationErrors).flatMap(([errorKey, errors]) =>
    errors.flatMap((error) => ({
      ...error,
      errorKey,
      ...{ errorId: `${error.id}_${error.message.split(" ").join("_")}` },
    }))
  );
}
