import { shallowMount } from '@vue/test-utils';
import explorerRail from '@/components/rails/explorer-rail/explorer';

describe('Explorer Rail', () => {
  let wrapper;
  beforeAll(() => {
    wrapper = shallowMount(explorerRail);
  });
  it('should render the component', () => {
    expect(wrapper.vm).toBeTruthy();
    expect(wrapper.vm.$el).toMatchSnapshot();
  });
  it('should check for vdata defaults', () => {
    expect(wrapper.vm.expanded).toBeFalsy();
  });
});
