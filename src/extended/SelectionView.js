/*! Rappid v2.1.0 - HTML5 Diagramming Framework - TRIAL VERSION

Copyright (c) 2015 client IO

 2017-09-21 


This Source Code Form is subject to the terms of the Rappid Trial License
, v. 2.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_v2.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/

(joint.ui.Selection = joint.mvc.View.extend(
  {
    options: {
      paper: void 0,
      graph: void 0,
      boxContent: function (a) {
        return joint.util.template("<%= length %> elements selected.")({
          length: this.model.length,
        });
      },
      handles: [
        {
          name: "remove",
          position: "nw",
          events: { pointerdown: "removeElements" },
        },
        {
          name: "rotate",
          position: "sw",
          events: {
            pointerdown: "startRotating",
            pointermove: "doRotate",
            pointerup: "stopBatch",
          },
        },
        {
          name: "resize",
          position: "se",
          events: {
            pointerdown: "startResizing",
            pointermove: "doResize",
            pointerup: "stopBatch",
          },
        },
      ],
      useModelGeometry: !1,
      strictSelection: !1,
      rotateAngleGrid: 15,
      allowTranslate: !0,
    },
    className: "selection",
    events: {
      "mousedown .selection-box": "onSelectionBoxPointerDown",
      "touchstart .selection-box": "onSelectionBoxPointerDown",
      "mousedown .handle": "onHandlePointerDown",
      "touchstart .handle": "onHandlePointerDown",
    },
    init: function () {
      this.options.model && (this.options.collection = this.options.model);
      var a = (this.collection =
        this.options.collection ||
        this.collection ||
        new Backbone.Collection());
      if (
        (a.comparator ||
          ((a.comparator = this.constructor.depthComparator), a.sort()),
        (this.model = a),
        !this.options.paper)
      )
        throw new Error("Selection: paper required");
      _.defaults(this.options, { graph: this.options.paper.model }),
        _.bindAll(
          this,
          "startSelecting",
          "stopSelecting",
          "adjustSelection",
          "pointerup"
        ),
        $(document.body).on(
          "mousemove.selection touchmove.selection",
          this.adjustSelection
        ),
        $(document).on("mouseup.selection touchend.selection", this.pointerup);
      var b = this.options.paper,
        c = this.options.graph;
      this.listenTo(c, "reset", this.cancelSelection),
        this.listenTo(b, "scale translate", this.updateSelectionBoxes),
        this.listenTo(c, "remove change", function (a, b) {
          b.selection !== this.cid && this.updateSelectionBoxes();
        }),
        this.listenTo(a, "remove", this.onRemoveElement),
        this.listenTo(a, "reset", this.onResetElements),
        this.listenTo(a, "add", this.onAddElement),
        b.$el.append(this.$el),
        (this._boxCount = 0),
        (this.$selectionWrapper = this.createSelectionWrapper()),
        (this.handles = []),
        _.each(this.options.handles, this.addHandle, this);
    },
    cancelSelection: function () {
      this.model.reset([], { ui: !0 });
    },
    addHandle: function (a) {
      this.handles.push(a);
      var b = $("<div/>", {
        class: "handle " + (a.position || "") + " " + (a.name || ""),
        "data-action": a.name,
      });
      return (
        a.icon && b.css("background-image", "url(" + a.icon + ")"),
        b.html(a.content || ""),
        joint.util.setAttributesBySelector(b, a.attrs),
        this.$selectionWrapper.append(b),
        _.each(
          a.events,
          function (b, c) {
            _.isString(b)
              ? this.on("action:" + a.name + ":" + c, this[b], this)
              : this.on("action:" + a.name + ":" + c, b);
          },
          this
        ),
        this
      );
    },
    stopSelecting: function (a) {
      switch (this._action) {
        case "selecting":
          var b = this.$el.offset(),
            c = this.$el.width(),
            d = this.$el.height(),
            e = this.options.paper,
            f = V(e.viewport).toLocalPoint(b.left, b.top);
          (f.x -= window.pageXOffset), (f.y -= window.pageYOffset);
          var h = e.scale();
          (c /= h.sx), (d /= h.sy);
          var i = g.rect(f.x, f.y, c, d),
            j = this.getElementsInSelectedArea(i),
            k = this.options.filter;
          _.isArray(k)
            ? (j = _.reject(j, function (a) {
                return (
                  _.contains(k, a.model) || _.contains(k, a.model.get("type"))
                );
              }))
            : _.isFunction(k) &&
              (j = _.reject(j, function (a) {
                return k(a.model);
              })),
            this.model.reset(_.pluck(j, "model"), { ui: !0 });
          break;
        case "translating":
          this.options.graph.stopBatch("selection-translate"),
            this.notify("selection-box:pointerup", a);
          break;
        default:
          this._action || this.cancelSelection();
      }
      this._action = null;
    },
    removeHandle: function (a) {
      var b = _.findIndex(this.handles, { name: a }),
        c = this.handles[b];
      return (
        c &&
          (_.each(
            c.events,
            function (b, c) {
              this.off("action:" + a + ":" + c);
            },
            this
          ),
          this.$(".handle." + a).remove(),
          this.handles.splice(b, 1)),
        this
      );
    },
    startSelecting: function (a) {
      (a = joint.util.normalizeEvent(a)), this.cancelSelection();
      var b,
        c,
        d = this.options.paper.el;
      if (null != a.offsetX && null != a.offsetY && $.contains(d, a.target))
        (b = a.offsetX), (c = a.offsetY);
      else {
        var e = $(d).offset(),
          f = d.scrollLeft,
          g = d.scrollTop;
        (b = a.clientX - e.left + window.pageXOffset + f),
          (c = a.clientY - e.top + window.pageYOffset + g);
      }
      this.$el.css({ width: 1, height: 1, left: b, top: c }),
        this.showLasso(),
        (this._action = "selecting"),
        (this._clientX = a.clientX),
        (this._clientY = a.clientY),
        (this._offsetX = b),
        (this._offsetY = c);
    },
    changeHandle: function (a, b) {
      var c = _.findWhere(this.handles, { name: a });
      return (
        c && (this.removeHandle(a), this.addHandle(_.merge({ name: a }, c, b))),
        this
      );
    },
    onSelectionBoxPointerDown: function (a) {
      a.stopPropagation(),
        (a = joint.util.normalizeEvent(a)),
        this.options.allowTranslate && this.startTranslatingSelection(a),
        (this._activeElementView = this.getCellView(a.target)),
        this.notify("selection-box:pointerdown", a);
    },
    startTranslatingSelection: function (a) {
      (this._action = "translating"),
        this.options.graph.startBatch("selection-translate");
      var b = this.options.paper.snapToGrid({ x: a.clientX, y: a.clientY });
      (this._snappedClientX = b.x), (this._snappedClientY = b.y);
    },
    adjustSelection: function (a) {
      a = joint.util.normalizeEvent(a);
      var b, c;
      switch (this._action) {
        case "selecting":
          (b = a.clientX - this._clientX), (c = a.clientY - this._clientY);
          var d = parseInt(this.$el.css("left"), 10),
            e = parseInt(this.$el.css("top"), 10);
          this.$el.css({
            left: b < 0 ? this._offsetX + b : d,
            top: c < 0 ? this._offsetY + c : e,
            width: Math.abs(b),
            height: Math.abs(c),
          });
          break;
        case "translating":
          var f = this.options.paper.snapToGrid({ x: a.clientX, y: a.clientY }),
            g = f.x,
            h = f.y;
          if (
            ((b = g - this._snappedClientX),
            (c = h - this._snappedClientY),
            b || c)
          ) {
            if ((this.translateSelectedElements(b, c), this.boxesUpdated))
              this.model.length > 1 && this.updateSelectionBoxes();
            else {
              var i = this.options.paper.scale();
              this.$el
                .children(".selection-box")
                .add(this.$selectionWrapper)
                .css({ left: "+=" + b * i.sx, top: "+=" + c * i.sy });
            }
            (this._snappedClientX = g), (this._snappedClientY = h);
          }
          this.notify("selection-box:pointermove", a);
          break;
        default:
          this._action && this.pointermove(a);
      }
      this.boxesUpdated = !1;
    },
    translateSelectedElements: function (a, b) {
      var c = {};
      this.model.each(function (d) {
        if (!c[d.id]) {
          var e = { selection: this.cid };
          d.translate(a, b, e),
            _.each(d.getEmbeddedCells({ deep: !0 }), function (a) {
              c[a.id] = !0;
            });
          var f = this.options.graph.getConnectedLinks(d);
          _.each(f, function (d) {
            c[d.id] || (d.translate(a, b, e), (c[d.id] = !0));
          });
        }
      }, this);
    },
    notify: function (a, b) {
      var c = Array.prototype.slice.call(arguments, 1);
      this.trigger.apply(this, [a, this._activeElementView].concat(c));
    },
    getElementsInSelectedArea: function (a) {
      var b = this.options.paper,
        c = { strict: this.options.strictSelection };
      if (this.options.useModelGeometry) {
        var d = b.model.findModelsInArea(a, c);
        return _.filter(_.map(d, b.findViewByModel, b));
      }
      return b.findViewsInArea(a, c);
    },
    pointerup: function (a) {
      this._action &&
        (this.triggerAction(this._action, "pointerup", a),
        this.stopSelecting(a),
        (this._activeElementView = null),
        (this._action = null));
    },
    destroySelectionBox: function (a) {
      this.$('[data-model="' + a.get("id") + '"]').remove(),
        0 === this.$el.children(".selection-box").length && this.hide(),
        (this._boxCount = Math.max(0, this._boxCount - 1));
    },
    hide: function () {
      this.$el.removeClass("lasso selected");
    },
    showSelected: function () {
      this.$el.addClass("selected");
    },
    showLasso: function () {
      this.$el.addClass("lasso");
    },
    destroyAllSelectionBoxes: function () {
      this.hide(),
        this.$el.children(".selection-box").remove(),
        (this._boxCount = 0);
    },
    createSelectionBox: function (a) {
      var b = a.findView(this.options.paper);
      if (b) {
        var c = b.getBBox({ useModelGeometry: this.options.useModelGeometry });
        $("<div/>")
          .addClass("selection-box")
          .attr("data-model", a.get("id"))
          .css({ left: c.x, top: c.y, width: c.width, height: c.height })
          .appendTo(this.el),
          this.showSelected(),
          this._boxCount++;
      }
    },
    createSelectionWrapper: function () {
      var a = $("<div/>", { class: "selection-wrapper" }),
        b = $("<div/>", { class: "box" });
      return (
        a.append(b),
        a.attr("data-selection-length", this.model.length),
        this.$el.prepend(a),
        a
      );
    },
    updateSelectionWrapper: function () {
      var a = { x: 1 / 0, y: 1 / 0 },
        b = { x: 0, y: 0 };
      if (
        (this.model.each(function (c) {
          var d = this.options.paper.findViewByModel(c);
          if (d) {
            var e = d.getBBox({
              useModelGeometry: this.options.useModelGeometry,
            });
            (a.x = Math.min(a.x, e.x)),
              (a.y = Math.min(a.y, e.y)),
              (b.x = Math.max(b.x, e.x + e.width)),
              (b.y = Math.max(b.y, e.y + e.height));
          }
        }, this),
        this.$selectionWrapper
          .css({ left: a.x, top: a.y, width: b.x - a.x, height: b.y - a.y })
          .attr("data-selection-length", this.model.length),
        _.isFunction(this.options.boxContent))
      ) {
        var c = this.$(".box"),
          d = this.options.boxContent.call(this, c[0]);
        d && c.html(d);
      }
    },
    updateSelectionBoxes: function () {
      this._boxCount &&
        (this.hide(),
        _.each(
          this.$el.children(".selection-box"),
          function (a) {
            var b = $(a).remove().attr("data-model"),
              c = this.model.get(b);
            c && this.createSelectionBox(c);
          },
          this
        ),
        this.updateSelectionWrapper(),
        (this.boxesUpdated = !0));
    },
    onRemove: function () {
      $(document.body).off(".selection", this.adjustSelection),
        $(document).off(".selection", this.pointerup);
    },
    onHandlePointerDown: function (a) {
      (this._action = $(a.target).closest(".handle").attr("data-action")),
        this._action &&
          (a.preventDefault(),
          a.stopPropagation(),
          (a = joint.util.normalizeEvent(a)),
          (this._clientX = a.clientX),
          (this._clientY = a.clientY),
          (this._startClientX = this._clientX),
          (this._startClientY = this._clientY),
          this.triggerAction(this._action, "pointerdown", a));
    },
    getCellView: function (a) {
      var b = this.model.get(a.getAttribute("data-model"));
      return b && b.findView(this.options.paper);
    },
    pointermove: function (a) {
      if (this._action) {
        var b = this.options.paper.snapToGrid({ x: a.clientX, y: a.clientY }),
          c = this.options.paper.snapToGrid({
            x: this._clientX,
            y: this._clientY,
          }),
          d = b.x - c.x,
          e = b.y - c.y;
        this.triggerAction(
          this._action,
          "pointermove",
          a,
          d,
          e,
          a.clientX - this._startClientX,
          a.clientY - this._startClientY
        ),
          (this._clientX = a.clientX),
          (this._clientY = a.clientY);
      }
    },
    triggerAction: function (a, b, c) {
      var d = Array.prototype.slice.call(arguments, 2);
      d.unshift("action:" + a + ":" + b), this.trigger.apply(this, d);
    },
    onRemoveElement: function (a) {
      this.destroySelectionBox(a), this.updateSelectionWrapper();
    },
    onResetElements: function (a) {
      this.destroyAllSelectionBoxes(),
        a.each(this.createSelectionBox, this),
        this.updateSelectionWrapper();
    },
    onAddElement: function (a) {
      this.createSelectionBox(a), this.updateSelectionWrapper();
    },
    removeElements: function (a) {
      var b = this.collection.toArray();
      this.cancelSelection(),
        this.options.graph.removeCells(b, { selection: this.cid });
    },
    startRotating: function (a) {
      this.options.graph.trigger("batch:start");
      var b = this.options.graph.getBBox(this.model.models).center(),
        c = this.options.paper.snapToGrid({ x: a.clientX, y: a.clientY }),
        d = _.transform(this.model.toArray(), function (a, b) {
          a[b.id] = g.normalizeAngle(b.get("angle") || 0);
        });
      this._rotation = {
        center: b,
        clientAngle: g.point(c).theta(b),
        initialAngles: d,
      };
    },
    startResizing: function (a) {
      var b = this.options.paper,
        c = this.options.graph,
        d = b.options.gridSize,
        e = this.model.toArray(),
        f = c.getBBox(e),
        g = _.invoke(e, "getBBox"),
        h = _.min(g, "width").width,
        i = _.min(g, "height").height;
      (this._resize = {
        cells: c.getSubgraph(e),
        bbox: f,
        minWidth: (d * f.width) / h,
        minHeight: (d * f.height) / i,
      }),
        c.trigger("batch:start");
    },
    doResize: function (a, b, c) {
      var d = this._resize,
        e = d.bbox,
        f = e.width,
        g = e.height,
        h = Math.max(f + b, d.minWidth),
        i = Math.max(g + c, d.minHeight);
      (Math.abs(f - h) > 0.001 || Math.abs(g - i) > 0.001) &&
        (this.options.graph.resizeCells(h, i, d.cells, { selection: this.cid }),
        (e.width = h),
        (e.height = i),
        this.updateSelectionBoxes());
    },
    doRotate: function (a) {
      var b = this._rotation,
        c = this.options.rotateAngleGrid,
        d = this.options.paper.snapToGrid({ x: a.clientX, y: a.clientY }),
        e = b.clientAngle - g.point(d).theta(b.center);
      Math.abs(e) > 0.001 &&
        (this.model.each(function (a) {
          var d = g.snapToGrid(b.initialAngles[a.id] + e, c);
          a.rotate(d, !0, b.center, { selection: this.cid });
        }, this),
        this.updateSelectionBoxes());
    },
    stopBatch: function () {
      this.options.graph.trigger("batch:stop");
    },
    getAction: function () {
      return this._action;
    },
  },
  {
    depthComparator: function (a) {
      return a.getAncestors().length;
    },
  }
)),
  (joint.ui.SelectionView = joint.ui.Selection);
