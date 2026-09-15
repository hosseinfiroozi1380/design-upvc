// src/items/addLace.js
import state from "../core/state.js";
import { enableSave } from "../services/enableSave.js";
import { showMessage } from "../utils/showMessage.js";
// add Lace
export function addLace(selectedItem, laceID = 0) { // lace ID is components lace id for frame
    if (
        selectedItem.name == "windowFrame" ||
        selectedItem.name == "doorFrame"
    ) {
        let hasLace = selectedItem.parent.getItem({ name: 'lace' });
        if (!hasLace) {
            let panelGroup = new state.paper.Group();
            panelGroup.name = "lace";
            let fromPosition = state.selectedItem.bounds.x + state.laceSize;
            let toPosition = state.selectedItem.bounds.x + state.selectedItem.bounds.width;
            for (let index = fromPosition; index < toPosition; index += state.laceSize) {
                let tempPanelLines = new state.paper.Path();
                tempPanelLines.moveTo(index, state.selectedItem.bounds.y);
                tempPanelLines.lineTo(
                    index,
                    state.selectedItem.bounds.y + state.selectedItem.bounds.height
                );
                tempPanelLines.strokeColor = state.laceColor;
                let intersections = selectedItem.getIntersections(tempPanelLines);
                tempPanelLines.remove();
                if (intersections.length > 1) {
                    let panelLine = new state.paper.Path();
                    panelLine.moveTo(intersections[0].point);
                    panelLine.lineTo(intersections[1].point);
                    panelLine.strokeColor = state.laceColor;
                    panelLine.name = 'laceLine';
                    panelGroup.addChild(panelLine);
                }
            }
            let fromPosition2 = selectedItem.bounds.y + state.laceSize;
            let toPosition2 = selectedItem.bounds.y + selectedItem.bounds.height;
            for (let index = fromPosition2; index < toPosition2; index += state.laceSize) {
                let tempPanelLines = new state.paper.Path();
                tempPanelLines.moveTo(selectedItem.bounds.x, index);
                tempPanelLines.lineTo(
                    selectedItem.bounds.x + selectedItem.bounds.width,
                    index
                );
                tempPanelLines.strokeColor = state.laceColor;
                let intersections = selectedItem.getIntersections(tempPanelLines);
                tempPanelLines.remove();
                if (intersections.length > 1) {
                    var panelLine = new state.paper.Path();
                    panelLine.moveTo(intersections[0].point);
                    panelLine.lineTo(intersections[1].point);
                    panelLine.strokeColor = state.laceColor;
                    panelLine.name = 'laceLine';
                    panelGroup.addChild(panelLine);
                }
            }
            selectedItem.parent.addChild(panelGroup);
            selectedItem.data.lace = laceID;
            enableSave();
        }
    } else {
        showMessage('لطفا فریم یک بازشو را برای اضافه کردن توری انتخاب کنید')
    }
}