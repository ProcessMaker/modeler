import { shallowMount, createLocalVue } from '@vue/test-utils';
import explorerRail from '@/components/rails/explorer-rail/explorer';
import BootstrapVue from 'bootstrap-vue';

const nodeTypes = [
  {
    id: 'processmaker-modeler-process',
    bpmnType: 'bpmn:Process',
    label: 'Process',
  },
];

const localVue = createLocalVue();

localVue.use(BootstrapVue);

describe('Explorer Rail', () => {
  let wrapper;
  beforeAll(() => {
    wrapper = shallowMount(explorerRail, {
      propsData: {
        nodeTypes,
      },
      mocks: {
        $t() {},
      },
      localVue,
    });
  });
  it('should render the component', () => {
    expect(wrapper.vm).toBeTruthy();
    expect(wrapper.vm.$el).toMatchSnapshot();
  });
  it('should check for vdata defaults', () => {
    expect(wrapper.vm.expanded).toBeFalsy();
  });
});
