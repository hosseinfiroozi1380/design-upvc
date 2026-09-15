// src/items/mullianEuallingSpace.js
import state from "../core/state.js";
import {
    changeMullianPosition
} from "./changeMullianPosition.js";
import {
    showMessage
} from "../utils/showMessage.js";
export function mullianEuallingSpace(
    type = "vMullian",
    step = 1
) {
    if (state.unitData.locked) {
        showMessage('یونیت قفل است. لطفا ابتدا قفل را بردارید');
        return;
    }
    let list = [];
    let baseGroups = state.paper.project.activeLayer.getItems({
        name: 'baseGroup',
        recursive: true
    });
    for (let i = 0; i < baseGroups.length; i++) {
        for (let j = 0; j < baseGroups[i].children.length; j++) {
            if (baseGroups[i].children[j].name == type) {
                if (
                    baseGroups[i].parent.name == "section" ||
                    baseGroups[i].parent.name == "baseGroup"
                ) {
                    list.push(baseGroups[i].children[j]);
                }
            }
        }
    }
    if (list.length > 0 && list.length >= step) {
        state.selectedItem = list[step - 1];
        let section = state.paper.project.getItem({
            name: 'section'
        });
        // Calculate equal spacing
        let spacing = section.bounds.width / (list.length + 1);
        let newX = spacing * step;
        let newY = state.selectedItem.bounds.center.y;
        if (type == "hMullian") {
            spacing = section.bounds.height / (list.length + 1);
            newX = state.selectedItem.bounds.center.x;
            newY = spacing * step;
        }
        // Move the mullion
        changeMullianPosition(
            new state.paper.Point(newX, newY)
        );
        step++;
        if (list.length >= step) {
            mullianEuallingSpace(type, step);
        }
    }
}