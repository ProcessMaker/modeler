async function generateDefaultNames() {
  const convertToDefaultNames = (strings) => {
    return strings.reduce((defaultNames, string) => {
      const nodeId = string;
      const nodeNameWithSpaces = nodeId
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/-/g, ' ');
  
      defaultNames[nodeId] = nodeNameWithSpaces;
      return defaultNames;
    }, {});
  }
  
  try {
    const response = await window.ProcessMaker.apiClient.get(`/modeler/pm-blocks`);
    const nodeIds = response.data;
  
    const defaultNames = convertToDefaultNames(nodeIds);
    console.log('pm block default names', defaultNames);
  
    return defaultNames;
  } catch (error) {
    console.error(error);
    return {};
  }
}

(async () => {
  const names = await generateDefaultNames();
  console.log('Returned default names:', names);
})();