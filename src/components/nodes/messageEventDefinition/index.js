import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import MessageSelect from '@/components/inspectors/MessageSelect';

export function messageSelector(helper) {
  return {
    component: MessageSelect,
    config: {
      label: 'Message',
      name: 'messageRef',
      helper,
    },
  };
}

export default {
  inspectorData(node) {
    const data = Object.entries(node.definition).reduce((data, [key, value]) => {
      if (key === 'eventDefinitions') {
        const message = value[0].get('messageRef');
        data.messageRef = message ? message.id : '';
      } else {
        data[key] = value;
      }
      if (key === 'dataInputs') {
        data.dataInputs = this.getDataInputs(node);
      }
      return data;
    }, {});
    if (!data.dataInputs) {
      data.dataInputs = [];
    }
    return data;
  },
  inspectorHandler(value, node, setNodeProp, moddle, definitions) {
    for (const key in omit(value, ['$type', 'eventDefinitions', 'messageRef', 'dataInputs'])) {
      if (node.definition[key] === value[key]) {
        continue;
      }
      window.ProcessMaker.EventBus.$emit('multiplayer-updateInspectorProperty', {
        id: node.definition.id , key, value: value[key],
      });
      setNodeProp(node, key, value[key]);
    }

    let message = definitions.rootElements.find(element => element.id === value.messageRef);

    if (!message && value.messageRef) {
      message = moddle.create('bpmn:Message', {
        id: value.messageRef,
        name: value.messageRef,
      });
      definitions.rootElements.push(message);
    }
    node.definition.get('eventDefinitions')[0].messageRef = message;

    if (value.dataInputs) {
      this.setDataInputs(value, node, moddle);
    }

    window.ProcessMaker.EventBus.$emit('multiplayer-updateInspectorProperty', {
      id: node.definition.id,
      key: 'messageRef',
      value: value.messageRef,
      extras: {
        messageName: message?.name,
        allowedUsers: node.definition.get('allowedUsers'),
        allowedGroups: node.definition.get('allowedGroups'),
      },
    });
  },
  getDataInputs(node) {
    // Combines dataInputs and dataInputAssociations
    return (node.definition.get('dataInputAssociations') || []).map((association) => {
      return {
        id: association.get('targetRef')?.get('id'),
        name: association.get('targetRef')?.get('name'),
        assignments: association.get('assignment')?.map(assignment => {
          return {
            from: assignment.get('from').get('body'),
            to: assignment.get('to').get('body'),
          };
        }) || [],
      };
    });
  },
  setDataInputs(value, node, moddle) {
    const currentDataInputs = this.getDataInputs(node);
    const changed = !isEqual(currentDataInputs, value.dataInputs);
    if (!changed) {
      return;
    }

    const diAssociations = node.definition.get('dataInputAssociations') || [];
    const dataInputs = value.dataInputs.map((newProperties) => {
      const targetRef = newProperties.id;
      const targetName = newProperties.name;
      const assignments = newProperties.assignments;
      let dataInputAssociation = diAssociations.find((association) => association.get('targetRef')?.get('id') === targetRef);
      let dataInput = dataInputAssociation?.get('targetRef');
      if (!dataInput) {
        const newDataInput = moddle.create('bpmn:DataInput', {
          id: targetRef,
          name: targetName,
        });
        // Initialize dataInputs array if it doesn't exist
        if (!node.definition.get('dataInputs')) {
          node.definition.set('dataInputs', []);
        }
        node.definition.get('dataInputs').push(newDataInput);
        dataInput = newDataInput;
      }
      if (!dataInputAssociation) {
        // create new data input association
        dataInputAssociation = moddle.create('bpmn:DataInputAssociation');
        dataInputAssociation.set('targetRef', dataInput);
        diAssociations.push(dataInputAssociation);
      }
      // update data input name
      dataInput.set('name', targetName);
      // update data input assignments
      dataInputAssociation.set('assignment', assignments.map((assignment) => {
        return moddle.create('bpmn:Assignment', {
          from: moddle.create('bpmn:Expression', { body: assignment.from }),
          to: moddle.create('bpmn:Expression', { body: assignment.to }),
        });
      }));
      return dataInput;
    });
    node.definition.set('dataInputAssociations', diAssociations);
    node.definition.set('dataInputs', dataInputs);
    const inputSet = node.definition.get('inputSet') || moddle.create('bpmn:InputSet');
    inputSet.set('dataInputRefs', dataInputs);
    node.definition.set('inputSet', inputSet);
  },
};
