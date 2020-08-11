const PLOT_SIZE = 32;

class Map
{
  constructor(config)
  {
    this.colourScheme = config.colourScheme
    this.socket = config.socket;
    this.boundingBox = config.boundingBox;
    this.toolbar = config.toolbar;

    this.isDraggingMap = false;
    this.isDragPlacing = false;

    this.currentLocation = {x: 0, y: 0};
    this.datumPoint = config.datumPoint;
    this.mapMapping = {};
    this.lastPos = null;
    this.boundRenderLoop = this.renderLoop.bind(this);
    this.buildSocketListners(config.socket);

    this.internalCanvas = this.buildCanvas(0, true);
    this.textCanvas = this.buildCanvas(1, false);

    this.defaultCursorStyle = this.colourScheme.defaultCursorStyle;
    this.errorCursorStyle = this.colourScheme.errorCursorStyle;
    this.cursorStyle = this.defaultCursorStyle;
    this.cursorResetTimer = 0;

    this.ctx = this.internalCanvas.getContext('2d');
    this.ctx.translate(0, this.internalCanvas.height); //match coord systems
    this.ctx.scale(1, -1);

    this.textCtx = this.textCanvas.getContext('2d')

    this.renderTick(0, true);
  }
  
  buildCanvas(zindex, doPointerEvents)
  {
    let tempCanvas = document.createElement("canvas");
    tempCanvas.setAttribute("oncontextmenu", "return false");
    tempCanvas.width = window.innerWidth;
    tempCanvas.height = window.innerHeight;
    let styleString = `position: absolute; left: 0px; top: 0px; height: 100%; width 100%; z-index: ${zindex}; cursor: none; `
    if (!doPointerEvents)
      styleString += "pointer-events: none;"

    tempCanvas.style = styleString
    document.body.appendChild(tempCanvas);
    return tempCanvas
  }

  start(result)
  {
    this.internalCanvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.internalCanvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.internalCanvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.internalCanvas.addEventListener('mouseleave', this.finishDrag.bind(this));

    this.ethereumAddress = result.addr;
    this.isAdmin = result.isAdmin;

    this.boundRenderLoop();
  }

  bound(currentPosition)
  {
    if(currentPosition.x < this.boundingBox.xMin*PLOT_SIZE)
      currentPosition.x = this.boundingBox.xMin*PLOT_SIZE;
    if(currentPosition.x > this.boundingBox.xMax*PLOT_SIZE)
      currentPosition.x = this.boundingBox.xMax*PLOT_SIZE;

    if(currentPosition.y < this.boundingBox.yMin*PLOT_SIZE)
      currentPosition.y = this.boundingBox.yMin*PLOT_SIZE;
    if(currentPosition.y > this.boundingBox.yMax*PLOT_SIZE)
      currentPosition.y = this.boundingBox.yMax*PLOT_SIZE;

    return currentPosition;
  }

  buildSocketListners(socket)
  {
    socket.on('mapUpdate', ((data) => {
      switch(data.type)
      {
        case "dump":
          this.mapMapping = data.plots;
          break;
        case "addition":
          this.mapMapping[JSON.stringify(data.location)] = data.plot;
          break;
        case "removal":
          delete this.mapMapping[JSON.stringify(data.location)];
          break;
      }
    }).bind(this));
  }
  
  drawGrid()
  {
      let step = PLOT_SIZE;
      let w = this.internalCanvas.width;
      let h = this.internalCanvas.height;

      let offsets = this.calculateOffset(this.currentLocation.x, this.currentLocation.y);
      let xOffset = offsets.x;
      let yOffset = offsets.y;

      this.ctx.beginPath(); 
      for (var x=0;x<=w;x+=step) {
        this.ctx.moveTo(x+xOffset, 0);
        this.ctx.lineTo(x+xOffset, h);
      }

      this.ctx.strokeStyle = this.colourScheme.gridLines;
      this.ctx.lineWidth = 1;
      this.ctx.stroke(); 
      this.ctx.beginPath(); 
      for (var y=0;y<=h;y+=step) {
        this.ctx.moveTo(0, y+yOffset);
        this.ctx.lineTo(w, y+yOffset);
      }
      this.ctx.stroke(); 
  }

  drawPlots()
  {
    let step = PLOT_SIZE;
    let w = this.internalCanvas.width;
    let h = this.internalCanvas.height;

    let offsets = this.calculateOffset(this.currentLocation.x, this.currentLocation.y);
    let xOffset = offsets.x;
    let yOffset = offsets.y;

    for(let x=0; x <= w; x+=step)
    { //width
      for(let y=0;y<=h;y+=step)
      { //height
        let mapPos = {
          x: Math.floor((x + xOffset + this.currentLocation.x)/PLOT_SIZE)+this.datumPoint.x,
          y: Math.floor((y + yOffset + this.currentLocation.y)/PLOT_SIZE)+this.datumPoint.y
        }
        let stringifiedCords = JSON.stringify(mapPos)
        this.drawSinglePlot(x+xOffset, y+yOffset, this.mapMapping[stringifiedCords])
      }
    }
  }

  drawSinglePlot(x, y, plotData)
  {
    if(plotData == undefined)
      return;
    switch (plotData.p_type)
    {
      case "alloc":
        this.ctx.fillStyle = this.isOwnPlot(plotData) ? this.colourScheme.yourPlot : this.colourScheme.privatePlot;
        break;
      default:
        this.ctx.fillStyle = this.colourScheme[plotData.p_type];
    }
    this.ctx.fillRect(x, y, PLOT_SIZE, PLOT_SIZE)
  }

  drawBackground()
  {
    this.ctx.fillStyle = this.colourScheme.background;
    this.ctx.fillRect(0, 0, this.internalCanvas.width, this.internalCanvas.height);
    this.drawGrid();

    this.textCtx.clearRect(0, 0, this.internalCanvas.width, this.internalCanvas.width);
  }

  drawSelectionBox()
  {
    if(this.currentMousePos == undefined || this.isDraggingMap) {return;}

    if(this.isDragPlacing)
    {
      this.drawSelectionArea()
    }
    else
    {
      this.drawSelectionCursor()
    }
  }

  drawSelectionArea()
  {
    let offsets = this.calculateOffset(this.currentLocation.x, this.currentLocation.y);
    let xOffset = offsets.x;
    let yOffset = offsets.y;
    
    let dragPlaceStart = this.dragPlaceStart;
    let dragPlaceCurrent = this.getPlotCords({
      clientX: this.currentMousePos.x,
      clientY: this.internalCanvas.height -this.currentMousePos.y
    });
    console.log(dragPlaceCurrent, dragPlaceStart)
    let xDiff = dragPlaceCurrent.x-dragPlaceStart.x;
    let yDiff = dragPlaceCurrent.y-dragPlaceStart.y;
    let canvasPos = {
      x: (dragPlaceStart.x - this.currentLocation.x/PLOT_SIZE)*PLOT_SIZE,
      y: (dragPlaceStart.y - this.currentLocation.y/PLOT_SIZE)*PLOT_SIZE,
    };

    this.ctx.fillStyle = this.cursorStyle;
    this.ctx.fillRect(
      canvasPos.x,
      canvasPos.y,
      (xDiff+1)*PLOT_SIZE,
      (yDiff+1)*PLOT_SIZE
    )
  }

  drawSelectionCursor()
  {
    let offsets = this.calculateOffset(this.currentLocation.x, this.currentLocation.y);
    let xOffset = offsets.x;
    let yOffset = offsets.y;
    this.ctx.fillStyle = this.cursorStyle;
    let xPos = xOffset + Math.floor(this.currentMousePos.x/PLOT_SIZE)*PLOT_SIZE;
    let yPos = yOffset + Math.floor(this.currentMousePos.y/PLOT_SIZE)*PLOT_SIZE;
    this.ctx.fillRect(
      xPos,
      yPos,
      PLOT_SIZE,
      PLOT_SIZE
    );

    let plotCords = this.getPlotCords({
      clientX: this.currentMousePos.x,
      clientY: this.textCanvas.height -this.currentMousePos.y
    });

    this.textCtx.fillStyle = "rgba(255,255,255,.5)";
    this.textCtx.font = "15px Courier New"
    this.textCtx.fillText(`${plotCords.x}:${plotCords.y}`, xPos, this.textCanvas.height - yPos, PLOT_SIZE);
  }

  calculateOffset(x, y)
  {
    let modX = x % PLOT_SIZE;
    let modY = y % PLOT_SIZE;

    return {
      x: -modX,
      y: -modY
    }
  }
  
  renderTick(delta, isFirst)
  {
    this.drawBackground();
    this.drawPlots();
    this.drawSelectionBox();
  }

  renderLoop(delta)
  {
    this.renderTick(delta);
    requestAnimationFrame(this.boundRenderLoop) //allows calls to context data
  }
  
  getMouseXY(evt)
  {
    return {
      x: evt.clientX,
      y: this.internalCanvas.height - evt.clientY
    }
  }

  getPlotCords(evt)
  {
    let mousePos = this.getMouseXY(evt);
    let offset = this.calculateOffset(mousePos.x, mousePos.y);

    let mapPos = {
      x: Math.floor((mousePos.x + offset.x + this.currentLocation.x)/PLOT_SIZE)+this.datumPoint.x,
      y: Math.floor((mousePos.y + offset.y + this.currentLocation.y)/PLOT_SIZE)+this.datumPoint.y
    }

    return mapPos;
  }
  
  startDrag(evt)
  {
    this.lastPos = this.getMouseXY(evt);
    this.internalCanvas.style.cursor="grab"
    this.isDraggingMap = true;
    this.isDragPlacing = false;
  }
  
  startDragPlace(evt)
  {
    this.isDragPlacing = true;
    this.dragPlaceStart = this.getPlotCords(evt);
  }

  endDragPlace(evt)
  {
    this.isDragPlacing = false;

    let dragPlaceEnd = this.getPlotCords(evt);
    this.commitAreaSelection(this.dragPlaceStart, dragPlaceEnd, this.getPlacementAction());
  }

  commitAreaSelection(startPlot, endPlot, updateType)
  {
    this.socket.emit("bulkSet", {
      startPlot: startPlot,
      endPlot: endPlot,
      p_type: updateType
    });
  }

  changePlotSelection(evt)
  {
    let plotCords = this.getPlotCords(evt);
    let placementAction = this.getPlacementAction(plotCords);
    let plotData = this.mapMapping[JSON.stringify(plotCords)];

    this.updateCursorStyle(placementAction, plotData);
    this.socket.emit("setTile", {
      p_type: placementAction,
      cords: plotCords
    });
  }

  getPlacementAction(plotCords)
  {
    let stringifiedCords = JSON.stringify(plotCords);
    let plotData = this.mapMapping[stringifiedCords];
    console.log(this.toolbar.placementMode);
    switch (this.toolbar.placementMode)
    {
      case "alloc":
        if (plotData == undefined)
          return "alloc";
        if (this.isOwnPlot(plotData))
          return "unAlloc";
        break;
      default:
        return this.toolbar.placementMode;
    }
  }
  
  onMouseDown(evt)
  {
    switch (evt.which)
    {
      case 1:
        this.startDrag(evt);
        break;
      case 2:
        this.startDragPlace(evt);
        break;
      case 3:
        this.changePlotSelection(evt); //what was onced empty will be placed; what was onced placed will be unplaced;
        break;
    }
  }

  onMouseMove(evt)
  {
    this.currentMousePos = this.getMouseXY(evt);
    
    if(!this.isDraggingMap)
    {
      this.internalCanvas.style.cursor = "none";
      return;
    }
    this.diff = {
      x: this.currentMousePos.x - this.lastPos.x,
      y: this.currentMousePos.y - this.lastPos.y
    }
    this.updateLocation(this.diff);
    this.lastPos = this.currentMousePos; //update the mouse pos
  }

  finishDrag()
  {
    this.isDraggingMap = false;
    this.lastPos = null;
    this.internalCanvas.style.cursor = "none";
  }

  updateLocation(diff)
  {
    let x = diff.x, y = diff.y;
    //would be plus but we use a minus to keep it inline with the canvas cord system
    this.currentLocation.x -= x; 
    this.currentLocation.y -= y;
    this.currentLocation = this.bound(this.currentLocation);
  }
  
  onMouseUp(evt)
  {
    switch (evt.which)
    {
      case 2:
        this.endDragPlace(evt);
        break;
      default:
        this.finishDrag();
    }
  }

  isOwnPlot(plotData)
  {
    return plotData.addr == this.ethereumAddress;
  }

  canPlacePrivate (plotData)
  {
    return this.toolbar.landCount > 0 && this.plotData == undefined;
  }

  canRemovePrivate(plotData)
  {
    return this.isOwnPlot(plotData)
  }

  cursorErrorFlash()
  {
    this.cursorStyle = this.errorCursorStyle;
    this.cursorResetTimer = setTimeout((() => {
      this.cursorStyle = this.defaultCursorStyle;
    }).bind(this), 500);
  }

  updateCursorStyle(placementAction, plotData)
  {
    this.cursorStyle = this.defaultCursorStyle;
    clearTimeout(this.cursorResetTimer);
    if(placementAction == "alloc" && !this.canPlacePrivate(plotData))
      this.cursorErrorFlash()
    if (placementAction == "unAlloc" && !this.canRemovePrivate(plotData))
      this.cursorErrorFlash()
  }
}

export {Map};
