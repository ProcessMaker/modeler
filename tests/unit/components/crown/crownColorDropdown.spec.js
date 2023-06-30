import { createLocalVue, shallowMount } from '@vue/test-utils';
import crownColorDropdown from '@/components/crown/crownButtons/crownColorDropdown';
import BootstrapVue from 'bootstrap-vue';
import { baseNodeColors } from '@/components/nodeColors';

jest.mock('../../../../src/store.js', () => {
  return { commit: jest.fn() };
});

describe('crownColorDropdown.vue', () => {
  let wrapper;
  let store;
  let node;
  const localVue = createLocalVue();

  localVue.use(BootstrapVue);

  beforeEach(async() => {
    store = jest.requireMock('../../../../src/store.js');
    node = { definition: { get(){} } };
    wrapper = shallowMount(crownColorDropdown, {
      localVue,
      propsData: {
        dropdownOpen: true,
        node,
      },
      mocks: {
        $t(){},
      },
    });
  });

  it('it sets the color in the vuex store', async() => {
    const colorToSelect = baseNodeColors[0];
    const colorButton = wrapper.find(`[data-test="${colorToSelect}"]`);

    expect(node.definition).not.toHaveProperty('color');
    expect(store.commit).toHaveBeenCalledTimes(0);

    await colorButton.trigger('click');

    expect(store.commit).toHaveBeenCalledTimes(1);
    expect(store.commit).toHaveBeenNthCalledWith(1, 'updateNodeProp', { node, key: 'color', value: colorToSelect });
    expect(node.definition).toHaveProperty('color', colorToSelect);
  });
});
