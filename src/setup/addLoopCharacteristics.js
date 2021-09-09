import loopCharacteristicsInspector from '@/components/inspectors/LoopCharacteristics';
import {
    loopCharacteristicsHandler,
    loopCharacteristicsData
} from '@/components/inspectors/LoopCharacteristics';;

export default (node) => {
    if (!node.loopInspectorIndex) {
        return;
    }

    // Insert the loop config inspector at the specified index
    node.inspectorConfig[0].items.splice(node.loopInspectorIndex, 0, loopCharacteristicsInspector);

    // Get any original handlers defined by the node
    const originalInspectorHandler = node.inspectorHandler ?? function () {};
    const originalInspectorData = node.inspectorData ?? null;

    // Override the inspector handler to add loop props
    node.inspectorHandler = (value, node, setNodeProp, moddle, definitions, defaultInspectorHandler) => {
        originalInspectorHandler(value, node, setNodeProp, moddle, definitions, defaultInspectorHandler);
        value = loopCharacteristicsHandler(value, node, setNodeProp, moddle, definitions);
        defaultInspectorHandler(value);
    };

    // Override the data handler to load loop config into the inspector
    node.inspectorData = (node, defaultDataTransform, inspector) => {
        const inspectorData = originalInspectorData ? 
            originalInspectorData(node, defaultDataTransform, inspector) : 
            defaultDataTransform(node);

        loopCharacteristicsData(inspectorData, node, defaultDataTransform, inspector);
        return inspectorData;
    };
}