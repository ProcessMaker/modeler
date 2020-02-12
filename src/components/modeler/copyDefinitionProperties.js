const propertiesToNotCopy = ['id', '$type'];

export default function copyDefinitionProperties(target, source) {
  Object.keys(source)
    .filter(key => !propertiesToNotCopy.includes(key))
    .forEach(key => {
      target.set(key, source.get(key));
    });
}
