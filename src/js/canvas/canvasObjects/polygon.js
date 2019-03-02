import fabric from 'fabric';
import polygonProperties from './polygon/polygonProperties';
import { prepareLabelAndShapeGroup } from './objectGroups/labelAndShape';
import { showLabelPopUp } from '../labelPopUp/manipulateLabelPopUp';
import setDefaultCursorMode from '../../mouseEvents/canvas/cursorModes/defaultMode';
import setDrawCursorMode from '../../mouseEvents/canvas/cursorModes/drawMode';

const min = 99;
const max = 999999;

let canvas = null;
let pointArray = [];
let lineArray = [];
let polygonMode = true;
let activeLine = null;
let activeShape = false;

function highlightPolygon(event) {
  if (event.target && event.target.shapeName === 'polygon') {
    event.target._objects[0].set('fill', 'rgba(237, 237, 237, 0.1)');
    canvas.renderAll();
  }
}

function removePolygonHighlight(event) {
  if (event.target && event.target.shapeName === 'polygon') {
    event.target._objects[0].set('fill', 'rgba(237, 237, 237, 0.01)');
    canvas.renderAll();
  }
}

function drawPolygon(event) {
  if (activeLine && activeLine.class === 'line') {
    const pointer = canvas.getPointer(event.e);
    activeLine.set({ x2: pointer.x, y2: pointer.y });
    const points = activeShape.get('points');
    points[pointArray.length] = {
      x: pointer.x,
      y: pointer.y,
    };
    activeShape.set({
      points,
    });
    canvas.renderAll();
  }
  canvas.renderAll();
}

function removeActiveLinesAndShape() {
  lineArray.forEach((line) => {
    canvas.remove(line);
  });
  canvas.remove(activeShape).remove(activeLine);
}

function generatePolygon(event) {
  const points = [];
  pointArray.forEach((point) => {
    points.push({
      x: point.left,
      y: point.top,
    });
    canvas.remove(point);
  });
  removeActiveLinesAndShape();
  const polygon = new fabric.Polygon(points, polygonProperties.newPolygon);
  canvas.add(polygon);

  activeLine = null;
  activeShape = null;
  polygonMode = false;
  const pointer = canvas.getPointer(event.e);
  prepareLabelAndShapeGroup(polygon, canvas, pointArray);
  showLabelPopUp(pointer.x, pointer.y);
  setDefaultCursorMode(canvas);
}

function addPoint(event) {
  const random = Math.floor(Math.random() * (max - min + 1)) + min;
  const id = new Date().getTime() + random;
  const pointer = canvas.getPointer(event.e);
  const circle = new fabric.Circle(polygonProperties.newCircle(id, event, canvas));
  if (pointArray.length === 0) {
    circle.set(polygonProperties.firstCircle);
  }
  let points = [pointer.x, pointer.y, pointer.x, pointer.y];
  const line = new fabric.Line(points, polygonProperties.newLine);
  if (activeShape) {
    points = activeShape.get('points');
    points.push({
      x: pointer.x,
      y: pointer.y,
    });
    const polygon = new fabric.Polygon(points, polygonProperties.newTempPolygon);
    canvas.remove(activeShape);
    canvas.add(polygon);
    activeShape = polygon;
    canvas.renderAll();
  } else {
    const polyPoint = [{
      x: pointer.x,
      y: pointer.y,
    }];
    const polygon = new fabric.Polygon(polyPoint, polygonProperties.newTempPolygon);
    activeShape = polygon;
    canvas.add(polygon);
  }
  activeLine = line;

  pointArray.push(circle);
  lineArray.push(line);
  canvas.add(line);
  canvas.add(circle);
  canvas.selection = false;
}

function clearPolygonData() {
  if (pointArray[0]) {
    pointArray.forEach((point) => {
      canvas.remove(point);
    });
    removeActiveLinesAndShape();
    pointArray = [];
    lineArray = [];
    activeShape = null;
    activeLine = null;
  }
}

function instantiatePolygon(event) {
  if (event.target && event.target.id && event.target.id === pointArray[0].id) {
    generatePolygon(event);
  }
  if (polygonMode) {
    addPoint(event);
  }
}

function prepareCanvasForNewPolygon(canvasObj) {
  canvas = canvasObj;
  polygonMode = true;
  clearPolygonData();
  canvas.discardActiveObject();
  setDrawCursorMode(canvas);
}

export {
  instantiatePolygon,
  drawPolygon,
  prepareCanvasForNewPolygon,
  clearPolygonData,
  highlightPolygon,
  removePolygonHighlight,
};
