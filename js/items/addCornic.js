// src/items/addCornic.js
import state from "../core/state.js";
import PaperOffset from "../utils/PaperOffset.js";
import { enableSave } from "../services/enableSave.js";
//add Cornic
export function addCornic(positions, height) {
    state.frameColor = state.unitData['profile_color_hex'];
    if (state.unitData.shape == "simple_rectangle" && height > 0) {
        let cornic = state.paper.project.activeLayer.getItem({
            name: "cornic"
        });
        if (cornic) {
            cornic.remove();
        }
        if (!cornicInnert) {
            return;
        }
        let cornicInnert = state.paper.project.activeLayer.getItem({
            name: "mainFlat"
        });
        let group = new state.paper.Group();
        group.name = "cornic";
        let cornicOuter = PaperOffset.offset(cornicInnert, height);
        cornicOuter.name = "cornicOuter";
        cornicOuter.fillColor = state.frameColor;
        cornicOuter.strokeColor = state.strokeColor;
        group.addChild(cornicOuter);
        if (positions.top) {
            let cornicItem = new state.paper.Path();
            cornicItem.add([cornicInnert.bounds.topLeft.x, cornicInnert.bounds.topLeft.y]);
            cornicItem.add([cornicInnert.bounds.topRight.x, cornicInnert.bounds.topRight.y]);
            if (positions.right) {
                cornicItem.add([cornicOuter.bounds.topRight.x, cornicOuter.bounds.topRight.y]);
            } else {
                cornicItem.add([cornicInnert.bounds.topRight.x, cornicInnert.bounds.topRight.y - height]);
            }
            if (positions.left) {
                cornicItem.add([cornicOuter.bounds.topLeft.x, cornicOuter.bounds.topLeft.y]);
            } else {
                cornicItem.add([cornicInnert.bounds.topLeft.x, cornicInnert.bounds.topLeft.y - height]);
            }
            cornicItem.add([cornicInnert.bounds.topLeft.x, cornicInnert.bounds.topLeft.y]);
            cornicItem.name = "top";
            cornicItem.fillColor = state.frameColor;
            cornicItem.strokeColor = state.strokeColor;
            group.addChild(cornicItem);
        }
        if (positions.right) {
            let cornicItem = new state.paper.Path();
            cornicItem.add([cornicInnert.bounds.topRight.x, cornicInnert.bounds.topRight.y]);
            cornicItem.add([cornicInnert.bounds.bottomRight.x, cornicInnert.bounds.bottomRight.y]);
            if (positions.bottom) {
                cornicItem.add([cornicOuter.bounds.bottomRight.x, cornicOuter.bounds.bottomRight.y]);
            } else {
                cornicItem.add([cornicInnert.bounds.bottomRight.x + height, cornicInnert.bounds.bottomRight.y]);
            }
            if (positions.top) {
                cornicItem.add([cornicOuter.bounds.topRight.x, cornicOuter.bounds.topRight.y]);
            } else {
                cornicItem.add([cornicInnert.bounds.topRight.x + height, cornicInnert.bounds.topRight.y]);
            }
            cornicItem.add([cornicInnert.bounds.topRight.x, cornicInnert.bounds.topRight.y]);
            cornicItem.name = "right";
            cornicItem.fillColor = state.frameColor;
            cornicItem.strokeColor = state.strokeColor;
            group.addChild(cornicItem);
        }
        if (positions.bottom) {
            let cornicItem = new state.paper.Path();
            cornicItem.add([cornicInnert.bounds.bottomLeft.x, cornicInnert.bounds.bottomLeft.y]);
            cornicItem.add([cornicInnert.bounds.bottomRight.x, cornicInnert.bounds.bottomRight.y]);
            if (positions.right) {
                cornicItem.add([cornicOuter.bounds.bottomRight.x, cornicOuter.bounds.bottomRight.y]);
            } else {
                cornicItem.add([cornicInnert.bounds.bottomRight.x, cornicInnert.bounds.bottomRight.y + height]);
            }
            if (positions.left) {
                cornicItem.add([cornicOuter.bounds.bottomLeft.x, cornicOuter.bounds.bottomLeft.y]);
            } else {
                cornicItem.add([cornicInnert.bounds.bottomLeft.x, cornicInnert.bounds.bottomLeft.y + height]);
            }
            cornicItem.add([cornicInnert.bounds.bottomLeft.x, cornicInnert.bounds.bottomLeft.y]);
            cornicItem.name = "bottom";
            cornicItem.fillColor = state.frameColor;
            cornicItem.strokeColor = state.strokeColor;
            group.addChild(cornicItem);
        }
        if (positions.left) {
            let cornicItem = new state.paper.Path();
            cornicItem.add([cornicInnert.bounds.topLeft.x, cornicInnert.bounds.topLeft.y]);
            cornicItem.add([cornicInnert.bounds.bottomLeft.x, cornicInnert.bounds.bottomLeft.y]);
            if (positions.bottom) {
                cornicItem.add([cornicOuter.bounds.bottomLeft.x, cornicOuter.bounds.bottomLeft.y]);
            } else {
                cornicItem.add([cornicInnert.bounds.bottomLeft.x - height, cornicInnert.bounds.bottomRight.y]);
            }
            if (positions.top) {
                cornicItem.add([cornicOuter.bounds.topLeft.x, cornicOuter.bounds.topLeft.y]);
            } else {
                cornicItem.add([cornicInnert.bounds.topLeft.x - height, cornicInnert.bounds.topLeft.y]);
            }
            cornicItem.add([cornicInnert.bounds.topLeft.x, cornicInnert.bounds.topLeft.y]);
            cornicItem.name = "left";
            cornicItem.fillColor = state.frameColor;
            cornicItem.strokeColor = state.strokeColor;
            group.addChild(cornicItem);
            let mainFrame = state.paper.project.activeLayer.getItem({
                name: "mainFrame"
            });
            mainFrame.data.cornic = height;
        }
        cornicOuter.remove();
        enableSave();
    }
}