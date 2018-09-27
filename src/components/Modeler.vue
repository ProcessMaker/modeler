<template>
<div class="modeler">
    <toolpanel ref="toolpanel" />
    <div class="paper-container">
        <drop @drop="test">
        <div class="paper">
        </div>
        </drop>
    </div>
    <div class="definitions-container" v-if="definitions">
        <component :is="node.type" :key="id" v-for="(node, id) in nodes" :graph="graph" :node="node" :id="id"></component>
    </div>
</div>
</template>

<script>
import toolpanel from './ToolPanel'
import BpmnModdle from 'bpmn-moddle';

// Our nodes
import task from './nodes/task'
import startEvent from './nodes/startEvent'
import endEvent from './nodes/endEvent'
import sequenceFlow from './nodes/sequenceFlow'

let version = "1.0";

if(!window.joint) {
    window.joint = require('jointjs')
}

export default {
    components: {
        toolpanel,
        task,
        startEvent,
        endEvent,
        sequenceFlow
    },
    data() {
        return {
            // Our jointjs data graph model
            graph: null,
            // Our jointjs paper
            paper: null,
            // Our BPM definitions
            definitions: null,
            // This is our id based lookup model
            nodes: {

            }
        }
    },
    methods: {
        // Parses our definitions and graphs and stores them in our id based lookup model
        parse() {
            // get the top level process objects
            // All root elements are bpmn:process types
            let processes = this.definitions.get('rootElements');
            if(processes) {
                for(var process of processes) {
                    // Now iterate through all the elements in processes
                    for(var element of process.flowElements) {
                        if(element.$type == 'bpmn:StartEvent') {
                            this.$set(this.nodes, element.id, {
                                type: 'startEvent',
                                definition: element,
                            });
                        }
                        if(element.$type == 'bpmn:EndEvent') {
                            this.$set(this.nodes, element.id, {
                                type: 'endEvent',
                                definition: element,
                            })
                        }
                        if(element.$type == 'bpmn:Task') {
                            this.$set(this.nodes, element.id, {
                                type: 'task',
                                definition: element,
                            })
                        }
                        if(element.$type == 'bpmn:SequenceFlow') {
                            this.$set(this.nodes, element.id, {
                                type: 'sequenceFlow',
                                definition: element,
                            })
                        }

                    }
                }
            }
            // Okay, now let's get the diagrams
            let diagrams = this.definitions.diagrams;
            if(diagrams) {
                for(var diagram of diagrams) {
                    var plane = diagram.plane;
                    var elements = plane.planeElement;
                    for(var diagramElement of elements) {
                        if(this.nodes[diagramElement.bpmnElement.id]) {
                            this.$set(this.nodes[diagramElement.bpmnElement.id], 'diagram',  diagramElement);
                        }
                    }
                }
            }

        },
        loadXML(xml) {
            let moddle = new BpmnModdle();
            moddle.fromXML(xml, (err, definitions) => {
                if(!err) {
                    // Update definitions export to our own information
                    definitions.exporter = "ProcessMaker Modeler";
                    definitions.exporterVersion = version;
                    this.definitions = definitions;
                    this.parse();
                }
            });
        },
        toXML(cb) {
            let moddle = new BpmnModdle();
            moddle.toXML(this.definitions, cb);
        },
        test(transferData, event) {
            // Do nothing
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
        this.paper.on('element:pointerdblclick', function(cellView) {
            console.log(cellView.model);
            if(cellView.model.component) {
                cellView.model.component.handleShapeDoubleClick();
            }

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


