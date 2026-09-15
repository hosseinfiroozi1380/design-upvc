// src/drawing/createGLs.js
import state from "../core/state.js";
//Mullian guidelines
export function createGLs() {
    if (!state.paper || !state.mainSection) {
        console.warn("createGLs failed", {
            paper: state.paper,
            mainSection: state.mainSection
        });
        return;
    }
    let previousGlG = state.paper.project.activeLayer.getItem({
        name: "glG"
    });
    if (previousGlG) {
        previousGlG.remove();
    }
    state.glG = new state.paper.Group();
    state.glG.name = "glG";
    state.vMGL = new state.paper.Path.Line(new state.paper.Point(state.mainSection.bounds.x, state.mainSection.bounds.y), new state.paper.Point(state.mainSection.bounds.x, state.mainSection.bounds.y + state.mainSection.bounds.height));
    state.vMGL.strokeColor = state.glColor;
    state.vMGL.strokeWidth = 5;
    state.vMGL.fillColor = state.glColor;
    state.vMGL.name = 'vMGL';
    state.glG.addChild(state.vMGL);
    state.vMGLT = new state.paper.PointText(new state.paper.Point(state.mainSection.bounds.x, state.mainSection.bounds.y - 150));
    state.vMGLT.content = 0;
    state.vMGLT.fillColor = state.glColor;
    state.vMGLT.fontSize = 60;
    state.vMGLT.name = 'vMGLT';
    state.glG.addChild(state.vMGLT);
    state.vMGRT = new state.paper.PointText(new state.paper.Point(state.mainSection.bounds.x, state.mainSection.bounds.y - 150));
    state.vMGRT.content = 0;
    state.vMGRT.fillColor = state.glColor;
    state.vMGRT.fontSize = 60;
    state.vMGRT.name = 'vMGRT';
    state.glG.addChild(state.vMGRT);
    state.hMGL = new state.paper.Path.Line(new state.paper.Point(state.mainSection.bounds.x, state.mainSection.bounds.y), new state.paper.Point(state.mainSection.bounds.x + state.mainSection.bounds.width, state.mainSection.bounds.y));
    state.hMGL.strokeColor = state.glColor;
    state.hMGL.strokeWidth = 5;
    state.hMGL.fillColor = state.glColor;
    state.hMGL.name = 'hMGL';
    state.glG.addChild(state.hMGL);
    state.hMGTT = new state.paper.PointText(new state.paper.Point(state.mainSection.bounds.x - 150, state.mainSection.bounds.y));
    state.hMGTT.content = 0;
    state.hMGTT.fillColor = state.glColor;
    state.hMGTT.fontSize = 60;
    state.hMGTT.name = 'hMGTT';
    state.glG.addChild(state.hMGTT);
    state.hMGBT = new state.paper.PointText(new state.paper.Point(state.mainSection.bounds.x - 150, state.mainSection.bounds.y));
    state.hMGBT.content = 0;
    state.hMGBT.fillColor = state.glColor;
    state.hMGBT.fontSize = 60;
    state.hMGBT.name = 'hMGBT';
    state.glG.addChild(state.hMGBT);
    state.glG.visible = false;
}