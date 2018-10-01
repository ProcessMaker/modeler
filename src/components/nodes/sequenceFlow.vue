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

        /*
        // @todo Instead of pointing to a shape directly, we're having it point to the x/y
        this.shape.source(this.$parent.nodes[this.node.definition.sourceRef.id].component.getShape());
        this.shape.target(this.$parent.nodes[this.node.definition.targetRef.id].component.getShape());
        */
        let waypoints = this.node.diagram.waypoint;
        console.log(waypoints);

        // Source is the first waypoint
        
        this.shape.source({
            x: waypoints[0].x,
            y: waypoints[0].y
        });

        // Target is the second
        this.shape.target({
            x: waypoints[1].x,
            y: waypoints[1].y
        });

        // Now, we want to listen for move events on the target and source components so that 
        // when THEY move, our points move relative to it
        this.$parent.nodes[this.node.definition.targetRef.id].component.$on('move', (position, element) => {
            // Determine the position change
            let xDiff = position.x - element.previousAttributes().position.x;
            let yDiff = position.y - element.previousAttributes().position.y;
            // Update our shape
            this.shape.target({
                x: this.shape.attributes.target.x + xDiff,
                y: this.shape.attributes.target.y + yDiff
            })
            // Update our diagram
            this.node.diagram.waypoint[1].x = this.shape.target.x;
            this.node.diagram.waypoint[1].y = this.shape.target.y;
        });

        this.$parent.nodes[this.node.definition.sourceRef.id].component.$on('move', (position, element) => {
            // Determine the position change
            let xDiff = position.x - element.previousAttributes().position.x;
            let yDiff = position.y - element.previousAttributes().position.y;
            // Update our shape
            this.shape.source({
                x: this.shape.attributes.source.x + xDiff,
                y: this.shape.attributes.source.y + yDiff
            })
            // Update our diagram
            this.node.diagram.waypoint[1].x = this.shape.source.x;
            this.node.diagram.waypoint[1].y = this.shape.source.y;
        });


        this.shape.addTo(this.graph);

        this.$parent.nodes[this.id].component = this;
    }
}
</script>

<style lang="scss" scoped>

</style>

