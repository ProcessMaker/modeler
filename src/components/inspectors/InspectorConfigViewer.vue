<template>
  <b-card
    no-body
    class="border-top mt-1 rounded-0 inspector-config-viewer__card"
  >
    <b-card-header
      v-b-toggle.inspector-config-viewer-body
      class="p-2 d-flex align-items-center inspector-config-viewer__header"
      role="button"
      tabindex="0"
      @keydown="onHeaderKeydown"
    >
      <span class="inspector-config-viewer__title">{{ $t('Configuration data') }}</span>
      <i class="ml-1 fas fa-chevron-down inspector-config-viewer__chevron" />
    </b-card-header>
    <b-collapse id="inspector-config-viewer-body" class="inspector-config-viewer__collapse">
      <b-card-body class="p-2 inspector-config-viewer__body">
        <div v-if="displayItems.length === 0" class="inspector-config-viewer__empty text-muted">
          {{ $t('No data') }}
        </div>
        <dl v-else class="inspector-config-viewer__list mb-0">
          <template v-for="(item, index) in displayItems">
            <dt :key="`key-${index}`" class="inspector-config-viewer__key">{{ item.key }}</dt>
            <dd :key="`val-${index}`" class="inspector-config-viewer__value">{{ item.value }}</dd>
          </template>
        </dl>
      </b-card-body>
    </b-collapse>
  </b-card>
</template>

<script>
export default {
  name: 'InspectorConfigViewer',
  props: {
    node: {
      type: Object,
      default: null,
    },
    formData: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    displayItems() {
      if (!this.formData || typeof this.formData !== 'object') {
        return [];
      }
      const entries = Object.entries(this.formData).filter(([key]) => !key.startsWith('$'));
      const meta = [];
      if (this.node) {
        if (this.node.type) meta.push({ key: '__type', value: this.node.type });
        if (this.node.id) meta.push({ key: '__id', value: this.node.id });
      }
      const rows = entries.map(([key, value]) => ({
        key,
        value: this.formatValue(value),
      }));
      return [...meta, ...rows];
    },
  },
  methods: {
    onHeaderKeydown(ev) {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        this.$root.$emit('bv::toggle::collapse', 'inspector-config-viewer-body');
      }
    },
    formatValue(value) {
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') {
        try {
          return JSON.stringify(value);
        } catch (_) {
          return Object.prototype.toString.call(value);
        }
      }
      return String(value);
    },
  },
};
</script>

<style lang="scss" scoped>
.inspector-config-viewer__card {
  font-size: 0.75rem;
  flex-shrink: 0;
}

.inspector-config-viewer__header {
  cursor: pointer;
  font-size: 0.8125rem;
  min-height: auto;
  line-height: 1.3;
  background: #f8f9fa;
}

.inspector-config-viewer__title {
  font-weight: 600;
}

.inspector-config-viewer__chevron {
  font-size: 0.65rem;
  transition: transform 0.2s;
}

.inspector-config-viewer__body {
  max-height: 12rem;
  overflow-y: auto;
  font-size: 0.75rem;
}

.inspector-config-viewer__list {
  display: grid;
  grid-template-columns: minmax(6rem, auto) 1fr;
  gap: 0.15rem 0.5rem;
}

.inspector-config-viewer__key {
  margin: 0;
  color: #6c757d;
  word-break: break-word;
}

.inspector-config-viewer__value {
  margin: 0;
  word-break: break-all;
}

.inspector-config-viewer__empty {
  font-size: 0.75rem;
}
</style>
