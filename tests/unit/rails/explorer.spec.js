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
  beforeEach(() => {
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
    // TODO uncomment the code when the bottom rail has been merged
    // expect(wrapper.vm.expanded).toBe(false);
    expect(wrapper.vm.tabs).toHaveLength(2);
    expect(wrapper.vm.tabIndex).toBe(0);
  });
  it('should set the tab index', () => {
    wrapper.vm.setTabIndex(1);
    expect(wrapper.vm.tabIndex).toBe(1);
  });
  // TODO replace the xit with it when bottom rail has been merged
  xit('should toggle the rail', () => {
    expect(wrapper.vm.expanded).toBe(false);
    wrapper.vm.toggleRail();
    expect(wrapper.vm.expanded).toBe(true);
  });
  // TODO replace the xit with it when bottom rail has been merged
  xit('should close the rail', () => {
    // toggling the rail to be opened
    wrapper.vm.toggleRail();
    expect(wrapper.vm.expanded).toBe(true);
    wrapper.vm.closeRail();
    expect(wrapper.vm.expanded).toBe(false);
  });
});
