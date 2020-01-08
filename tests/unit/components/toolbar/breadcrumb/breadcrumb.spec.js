import { mount } from '@vue/test-utils';
import Breadcrumb from '@/components/toolbar/breadcrumb/Breadcrumb';

describe('Breadcrumb', () => {
  it('does not render if no breadcrumbs prop is passed', function() {
    const breadcrumbs = mount(Breadcrumb);
    expect(breadcrumbs.html()).toBeFalsy();
  });

  it('does not render breadcrumbs data has zero length', function() {
    const breadcrumbs = mount(Breadcrumb, {
      propsData: {
        breadcrumbData: [],
      },
    });
    expect(breadcrumbs.html()).toBeFalsy();
  });

  it('can render breadcrumbs', function() {
    const links = [
      { text: 'link test text', url: 'some_url' },
      { text: 'another link', url: '' },
    ];
    const breadcrumbs = mount(Breadcrumb, {
      propsData: {
        breadcrumbData: [links],
      },
    });

    expect(breadcrumbs.findAll('ol.breadcrumb > li').length).toBe(links.length + 1);

    links.forEach((link, index) => {
      expect(breadcrumbs.findAll('ol.breadcrumb > li').at(index + 1).text()).toEqual(link.text);
    });

  });

  it('does not turn empty urls into anchors', function() {
    const links = [
      { text: 'another link', url: '' },
    ];
    const breadcrumbs = mount(Breadcrumb, {
      propsData: {
        breadcrumbData: [links],
      },
    });

    expect(breadcrumbs.findAll('ol.breadcrumb > li').length).toBe(2);
    expect(breadcrumbs.findAll('ol.breadcrumb > li').at(1).find('a').exists()).toBe(false);
  });
});
