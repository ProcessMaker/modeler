import { createLocalVue, shallowMount } from '@vue/test-utils';
import Toolbar from '@/components/toolbar/ToolBar';
import BootstrapVue from 'bootstrap-vue';

describe('Toolbar.vue', () => {
  const localVue = createLocalVue();
  localVue.use(BootstrapVue);

  let wrapper;
  const mocks = {
    $t(label) { return label; },
  };
  const stubs = ['b-row', 'b-modal', 'b-btn', 'b-tooltip'];
  const propsData = {
    canvasDragPosition: {}, // add the expected value or mock data
    cursor: {},             // add the expected value or mock data
    paperManager: {},       // add the expected value or mock data
    isRendering: {},        // add the expected value or mock data
    breadcrumbData: [],     // add the expected value or mock data
    panelsCompressed: {},   // add the expected value or mock data
    validationErrors: {},   // add the expected value or mock data
    warnings: [],           // add the expected value or mock data
    xmlManager: {},         // add the expected value or mock data
    validationBar: {},      // add the expected value or mock data
  };


  describe('combinedMenuActions computed property', () => {
    it('should combine ellipsisMenuActions and extraActions when extraActions are provided', () => {
      const extraActions = [
        {
          value: 'mock-action',
          content: 'Mock Action',
          icon: '',
        },
      ];
      wrapper = shallowMount(Toolbar, {
        localVue,
        propsData: {
          ...propsData,
          extraActions,
        },
        mocks,
        stubs,
      });

      expect(wrapper.vm.combinedMenuActions).toEqual([...wrapper.vm.ellipsisMenuActions, ...extraActions]);
    });

    it('should only return ellipsisMenuActions when no extraActions are provided', () => {
      wrapper = shallowMount(Toolbar, {
        localVue,
        propsData,
        mocks,
        stubs,
      });

      expect(wrapper.vm.combinedMenuActions).toEqual(wrapper.vm.ellipsisMenuActions);
    });
  });
});
