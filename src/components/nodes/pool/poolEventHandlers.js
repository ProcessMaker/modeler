import { id as laneId } from '@/components/nodes/poolLane/config';
import { id as poolId } from '@/components/nodes/pool/config';
import { defaultNodeColor, invalidNodeColor, poolColor } from '@/components/nodeColors';
import store from '@/store';

export default class PoolEventHandlers {
  constructor(graph, paper, paperManager, shape, component) {
    this.graph = graph;
    this.paper = paper;
    this.paperManager = paperManager;
    this.shape = shape;
    this.component = component;

    this.previousValidPosition = null;
    this.draggingElement = null;
    this.newPool = null;
    this.invalidPool = null;
  }

  isNotPoolChild(model) {
    return !(model.component && model.component !== this.component &&
      model.component.node.type !== laneId &&
      model.getParentCell() && model.getParentCell().component === this.component);
  }

  onPointerDown(cellView) {
    if (this.isNotPoolChild(cellView.model)) {
      this.component.$emit('select-pool');
      return;
    }

    if (
      (!this.draggingElement || this.draggingElement !== cellView.model) &&
      cellView.model.component && ![poolId, laneId].includes(cellView.model.component.node.type)
    ) {
      this.draggingElement = cellView.model;
    }
  }

  onPointerUp(cellView) {
    if (this.isNotPoolChild(cellView.model)) {
      return;
    }

    if (!this.draggingElement || this.draggingElement !== cellView.model) {
      return;
    }

    if (this.previousValidPosition) {
      this.draggingElement.position(this.previousValidPosition.x, this.previousValidPosition.y, { deep: true });
      store.commit('updateNodeBounds', {
        node: this.draggingElement.component.node,
        bounds: this.previousValidPosition,
      });
    }

    if (this.invalidPool) {
      this.invalidPool.attr('body/fill', poolColor);
      this.invalidPool = null;
    }

    if (this.newPool) {
      /* Remove the shape from its current pool */
      this.component.moveElement(this.draggingElement, this.newPool);
      this.newPool = null;
    } else {
      this.component.expandToFitElement(this.draggingElement, this.shape);
      this.component.laneSet && this.component.updateLaneChildren();
    }

    this.paper.drawBackground({ color: defaultNodeColor });
    this.draggingElement = null;
  }

  onChangePosition(element, newPosition) {
    // Do nothing if the element we're dragging is not part of this pool
    if (this.isNotPoolChild(element) || !this.draggingElement) {
      return;
    }

    /* If the element we are dragging is not over a pool or lane, prevent dropping it.
       * Also prevent moving the element to another pool if it has a sequence flow, as
       * sequence flows between pools are not valid. */

    const { x, y, width, height } = element.getBBox();
    const area = { x, y, width, height };

    const elementsUnderArea = this.graph.findModelsInArea(area);
    const pool = elementsUnderArea.find(model => {
      return model.component && model.component.node.type === poolId;
    });

    if (!pool) {
      if (!this.previousValidPosition) {
        this.previousValidPosition = newPosition;
      }

      if (this.invalidPool) {
        this.invalidPool.attr('body/fill', poolColor);
        this.invalidPool = null;
      }

      store.commit('preventSavingElementPosition');
      this.paperManager.setStateInvalid();
    } else if (pool.component !== this.component && this.graph.getConnectedLinks(element).length > 0) {
      if (!this.previousValidPosition) {
        this.previousValidPosition = newPosition;
      }

      this.invalidPool = pool.component.shape;
      this.invalidPool.attr('body/fill', invalidNodeColor);

      store.commit('preventSavingElementPosition');
      this.paperManager.setStateValid();
    } else {
      this.paper.drawBackground({ color: defaultNodeColor });
      this.previousValidPosition = null;

      if (this.invalidPool) {
        this.invalidPool.attr('body/fill', poolColor);
        this.invalidPool = null;
      }

      this.newPool = pool !== this.shape
        ? pool
        : null;

      store.commit('allowSavingElementPosition');
      this.paperManager.setStateValid();
    }
  }
}
