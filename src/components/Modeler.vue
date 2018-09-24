<template>
<div class="modeler">
    <toolpanel ref="toolpanel" />
    <div class="paper-container">
        <drop @drop="test">
        <div class="paper">
        </div>
        </drop>
    </div>
</div>
</template>

<script>
import toolpanel from './ToolPanel'
import BpmnModdle from 'bpmn-moddle';

let version = "1.0";

if(!window.joint) {
    window.joint = require('jointjs')
}

export default {
    components: {
        toolpanel,
    },
    data() {
        return {
            // Our jointjs data graph model
            graph: null,
            // Our jointjs paper
            paper: null,
            // Our BPM definitions
            definitions: null
        }
    },
    methods: {
        loadXML(xml) {
            let moddle = new BpmnModdle();
            moddle.fromXML(xml, (err, definitions) => {
                if(!err) {
                    // Update definitions export to our own information
                    definitions.exporter = "ProcessMaker Modeler";
                    definitions.exporterVersion = version;
                    this.definitions = definitions;
                }
            });
        },
        toXML(cb) {
            let moddle = new BpmnModdle();
            moddle.toXML(this.definitions, cb);
        },
        test(transferData, event) {
        },
        handleResize() {
            let parent = this.$el.parentElement;
            this.$el.style.width = parent.clientWidth + "px";
            this.$el.style.height = parent.clientHeight + "px";
        }
    },
    mounted() {
        // Handle window resize
        this.handleResize();
        window.addEventListener('resize', this.handleResize)

        let el = this.$el.getElementsByClassName('paper').item(0);
        this.graph = new window.joint.dia.Graph;
        this.paper = new window.joint.dia.Paper({
            el: el,
            model: this.graph,
            gridSize: 8,
            width: this.$el.clientWidth,
            height: this.$el.clientHeight,
            drawGrid: true
        });

    }
    
}
</script>

<style lang="scss" scoped>
@import '~jointjs/dist/joint.css';

.modeler {
    position: relative;
    width: inherit;
    max-width: inherit;
    height: inherit;
    max-height: inherit;
    overflow: hidden;

    .paper-container {
        width: 100%;
        height: 100%;
        min-width: 100%;
        max-height: 100%;
        overflow: auto;
    }
}
</style>


