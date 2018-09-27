<template>
    <div>
    <b-modal ref="configuremodal" title="Task Configuration Test Modal">
        <p class="my-4">Hello from task configuration modal!</p>
    </b-modal>
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
        getShape() {
            return this.shape
        },
        updateShape() {
            let bounds = this.node.diagram.bounds;
            this.shape.position(bounds.get('x'), bounds.get('y'));
            this.shape.resize(bounds.get('width'), bounds.get('height'));
            this.shape.attr({
                body: {
                    fill: 'blue'
                },
                label: {
                    text: this.node.definition.get('name'),
                    fill: 'white'
                }
            });
        },
        handleShapeDoubleClick() {
            this.$refs.configuremodal.show();
        }
    },
    mounted() {
        // Now, let's add a rounded rect to the graph
        this.shape = new joint.shapes.standard.Rectangle();
        let bounds = this.node.diagram.bounds;
        this.shape.position(bounds.get('x'), bounds.get('y'));
        this.shape.resize(bounds.get('width'), bounds.get('height'));
        this.shape.attr({
            body: {
                fill: 'blue'
            },
            label: {
                text: this.node.definition.get('name'),
                fill: 'white'
            }
        });
        this.shape.addTo(this.graph)
        this.shape.component = this;
        this.$parent.nodes[this.id].component = this;
    }
}
</script>

<style lang="scss" scoped>

</style>

