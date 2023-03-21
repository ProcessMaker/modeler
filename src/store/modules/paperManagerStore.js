const state = () => ({
  paperManager: null,
});

const mutations = {
  setPaperManager(state, paperManager) {
    state.paperManager = paperManager;
  },
  changeScale(state, newScale) {
    return (state.paperManager.scale = newScale);
  },
};
export default {
  namespaced: true,
  state,
  mutations,
};
