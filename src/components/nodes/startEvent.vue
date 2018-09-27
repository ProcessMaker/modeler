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
    methods: {
        getShape() {
            return this.shape;
        }
    },
    mounted() {
        // Now, let's add a rounded rect to the graph
        this.shape = new joint.shapes.standard.Circle();
        let bounds = this.node.diagram.bounds;
        this.shape.position(bounds.get('x'), bounds.get('y'));
        this.shape.resize(bounds.get('width'), bounds.get('height'));
        this.shape.attr({
            body: {
                stroke: '#00bf9c',
                fill: '#EDFFFC'
            }
        });
        this.shape.addTo(this.graph)
        this.$parent.nodes[this.id].component = this;
    }
}
</script>

<style lang="scss" scoped>

</style>

