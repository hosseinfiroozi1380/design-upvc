// src/events/initPinchZoom.js
import state from "../core/state.js";
export function initPinchZoom() {
    const canvasElement = state.paper.view.element;
    const box = canvasElement.getBoundingClientRect();
    const offset = new state.paper.Point(box.left, box.top);
    const hammer = new Hammer.Manager(canvasElement, {
        inputClass: Hammer.TouchInput,
        recognizers: [
            [Hammer.Pinch, { enable: true }],
        ]
    });
    let startMatrix;
    let startMatrixInverted;
    let p0ProjectCoords;
    const tempPoint = new state.paper.Point();
    hammer.on('pinchstart', e => {
        startMatrix = state.paper.view.matrix.clone();
        startMatrixInverted = startMatrix.inverted();
        getCenterPoint(e, tempPoint);
        p0ProjectCoords = state.paper.view.viewToProject(tempPoint);
    });
    hammer.on('pinch', e => {
        if (!startMatrix) return;
        if (Math.abs(e.scale - 1) < 0.01) return;
        requestAnimationFrame(() => {
            getCenterPoint(e, tempPoint);
            const pProject0 = tempPoint.transform(startMatrixInverted);
            const delta = pProject0
                .subtract(p0ProjectCoords)
                .divide(e.scale);
            state.paper.view.matrix = startMatrix.clone()
                .scale(e.scale, p0ProjectCoords)
                .translate(delta);
            state.paper.view.update();
        });
    });
    function getCenterPoint(e, outPoint) {
        outPoint.x = e.center.x - offset.x;
        outPoint.y = e.center.y - offset.y;
        return outPoint;
    }
}