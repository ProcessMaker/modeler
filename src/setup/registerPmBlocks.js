// import bpmnExtension from '@processmaker/processmaker-bpmn-moddle/resources/processmaker';

// const nodeTypes = window.ProcessMaker.pmBlockNodes;

// export default function registerPmBlocks({ registerPmBlock, registerBpmnExtension }) {
//   customEventNodes.forEach(([nodeType, primaryIdentifier, secondaryIdentifier]) => {
//     registerNode(nodeType, customParserFactory(nodeType, primaryIdentifier, secondaryIdentifier));
//   });
  
//   nodeTypes.forEach(config => registerPmBlock(config));

//   registerBpmnExtension('pm', bpmnExtension);
// }


import bpmnExtension from '@processmaker/processmaker-bpmn-moddle/resources/processmaker';

export default async function registerPmBlocks(registerPmBlock) {
  console.log("REGISTER PM BLOCKS JS");
  const customEventNodes = []; // Define customEventNodes as needed
  
  // Fetch PM Blocks using an API call
  try {
    const response = await window.ProcessMaker.apiClient.get('/pm-blocks?status=active&per_page=100');
    console.log("RESPONSE", response);
    if (response.status === 200) {
      const pmBlocks = response.data.data;
      
      // Register custom event nodes
      customEventNodes.forEach(([nodeType, primaryIdentifier, secondaryIdentifier]) => {
        registerNode(nodeType, customParserFactory(nodeType, primaryIdentifier, secondaryIdentifier));
      });

      // Register PM Blocks as nodeTypes
      pmBlocks.forEach(config => registerPmBlock(config));
    } else {
      // Handle API error
      console.error('Failed to fetch PM Blocks:', response.status, response.statusText);
    }
  } catch (error) {
    // Handle fetch or other errors
    console.error('Error fetching PM Blocks:', error);
  }

  // Register BPMN extension
  registerBpmnExtension('pm', bpmnExtension);
}
