<template>
    <div>
    </div>
</template>

<script>
import joint from 'jointjs'

export default {
    props: [
        'graph',
        'node',
        'id'
    ],
    data() {
        return {
            shape: null,
            definition: null
        }
    },
    watch: {
        node: {
            handler() {
                this.updateShape();
            },
            deep: true
        }
    },
    methods: {
        updateShape() {

        }
    },
    mounted() {
        // Now, let's add a rounded rect to the graph
        this.shape = new joint.shapes.standard.Link({
            router: { name: 'manhattan' },
            connector: { name: 'rounded' },
        });
        this.shape.source(this.$parent.nodes[this.node.definition.sourceRef.id].component.getShape());
        this.shape.target(this.$parent.nodes[this.node.definition.targetRef.id].component.getShape());

        this.shape.addTo(this.graph);

        this.$parent.nodes[this.id].component = this;
    }
}
</script>

<style lang="scss" scoped>

</style>

