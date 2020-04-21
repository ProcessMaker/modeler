<template>
  <div>
    <div class="form-group">
      <label class="d-block">{{ $t('Type') }}
        <select
          class="form-control"
          :value="assignmentGetter"
          @input="assignmentSetter"
        >
          <option value="">{{ $t('Select...') }}</option>
          <option value="user">{{ $t('User') }}</option>
          <option value="group">{{ $t('Group') }}</option>
        </select>
      </label>
      <small v-if="helper" class="form-text text-muted">{{ $t(helper) }}</small>
    </div>

    <div class="form-group" v-if="assignmentGetter">
      <label class="text-capitalize">{{ $t(assignmentGetter) }}</label>
      <multiselect
        v-model="content"
        track-by="id"
        label="name"
        :class="{'border border-danger':error}"
        :loading="loading"
        :placeholder="$t('type here to search')"
        :options="options"
        :multiple="false"
        :show-labels="false"
        :searchable="true"
        :internal-search="false"
        @open="load"
        @search-change="load"
      >
        <template slot="noResult">
          {{ $t('No elements found. Consider changing the search query.') }}
        </template>
        <template slot="noOptions">
          {{ $t('No Data Available') }}
        </template>
      </multiselect>
      <small v-if="error" class="text-danger">{{ error }}</small>
      <small v-if="helperText" class="form-text text-muted">{{ $t(helperText) }}</small>
    </div>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect';
import get from 'lodash/get';
import store from '@/store';

export default {
  components: { Multiselect },
  props: ['value', 'label', 'helper', 'userHelper', 'groupHelper', 'property'],
  data() {
    return {
      content: null,
      options: [],
      loading: false,
      error: '',
      type: '',
    };
  },
  watch: {
    content: {
      handler() {
        if (this.type === 'user' && this.content) {
          this.assignedUserSetter(this.content.id);
        } else if (this.type === 'group' && this.content) {
          this.assignedGroupSetter(this.content.id);
        }
      },
    },
    value: {
      immediate: true,
      handler() {
        this.loadAssigned();
      },
    },
    assignmentGetter(assignment) {
      this.type = assignment;
    },
  },
  computed: {
    highlightedNode() {
      return store.getters.highlightedNodes[0];
    },
    helperText() {
      return this.type === 'user' ? this.userHelper : this.groupHelper;
    },
    assignmentGetter() {
      return get(this.highlightedNode, 'assignment');
    },
  },
  methods: {
    load(filter) {
      this.options = [];
      if (this.type === 'user') {
        this.loadUsers(filter);
      } else if (this.type === 'group') {
        this.loadGroups(filter);
      }
    },
    loadUsers(filter) {
      this.loading = true;
      window.ProcessMaker.apiClient
        .get('users?order_direction=asc&status=active' + (typeof filter === 'string' ? '&filter=' + filter : ''))
        .then(response => {
          this.loading = false;
          this.options = response.data.data.map(item => {
            return {
              id: item.id,
              name: item.fullname,
            };
          });
        })
        .catch(() => {
          this.loading = false;
        });
    },
    loadGroups(filter) {
      this.loading = true;
      window.ProcessMaker.apiClient
        .get('groups?order_direction=asc&status=active' + (typeof filter === 'string' ? '&filter=' + filter : ''))
        .then(response => {
          this.loading = false;
          this.options = response.data.data.map(item => {
            return {
              id: item.id,
              name: item.name,
            };
          });
        })
        .catch(() => {
          this.loading = false;
        });
    },
    loadAssigned() {
      const node = this.highlightedNode;
      let value = get(node, 'assignment');
      this.type = value;
      this.content = null;
      if (this.type === 'user') {
        value = get(node, 'assignedUsers');
        if (!value) {
          return;
        }
        this.loading = true;
        window.ProcessMaker.apiClient
          .get('users/' + value)
          .then(response => {
            this.loading = false;
            this.content = {
              id: response.data.id,
              name: response.data.fullname,
            };
          })
          .catch(error => {
            this.loading = false;
            if (error.response.status === 404) {
              this.content = '';
              this.error = this.$t('Selected user not found');
            }
          });
      } else if (this.type === 'group') {
        value = get(node, 'assignedGroups');
        if (!value) {
          return;
        }
        this.loading = true;
        window.ProcessMaker.apiClient
          .get('groups/' + value)
          .then(response => {
            this.loading = false;
            this.content = {
              id: response.data.id,
              name: response.data.name,
            };
          })
          .catch(error => {
            this.loading = false;
            if (error.response.status === 404) {
              this.content = '';
              this.error = this.$t('Selected group not found');
            }
          });
      }
    },
    assignedUserSetter(id) {
      const node = this.highlightedNode;
      this.$set(node, 'assignedUsers', id);
      this.$set(node, 'assignedGroups', '');
    },
    assignedGroupSetter(id) {
      const node = this.highlightedNode;
      this.$set(node, 'assignedUsers', '');
      this.$set(node, 'assignedGroups', id);
    },
    assignmentSetter(event) {
      this.type = event.target.value;
      this.content = null;
      this.$set(this.highlightedNode, 'assignment', this.type);
      this.load();
    },
  },
  mounted() {
    this.loadAssigned();
  },
};
</script>

<style lang="scss" scoped>
  .form-group {
    padding: 0;
  }
</style>
