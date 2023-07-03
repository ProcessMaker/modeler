import taskConfig from '../task';

export default {
  ...taskConfig,
  component: () => import('./userTask.vue'),
};
