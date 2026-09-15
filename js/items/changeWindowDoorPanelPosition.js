// src/items/changeWindowDoorPanelPosition.js
import state from '../core/state.js';
import { addWindow } from './addWindow.js';
import { addDoor } from './addDoor.js';
import { addPanel } from './addPanel.js';
import { deleteItem } from '../utils/deleteItem.js';
import { reDrawMullianChildsOnDelete } from '../drawing/reDrawMullianChildsOnDelete.js';
import { createDimensionBar } from '../drawing/createDimensionBar.js';
// change window / door / panel position
export function changeWindowDoorPanelPosition(newPoint) {
    let item = state.selectedItem;
    if (!item) {
        return;
    }
    if (["windowFrame", "doorFrame", "hPanel", "vPanel"].includes(item.name)) {
        let itemParent = item.parent;
        let memory = false;
        if (state.ctrlKeyPressed) {//copy stat
            $.each(itemParent.children, function (key, itemp) {
                if (itemp.id !== item.id) {
                    state.removedDependenceMemory.push(itemp);
                }
            });
            memory = state.removedDependenceMemory;
        } else {
            memory = deleteItem(itemParent);
        }
        let flats = state.paper.project.activeLayer.getItems({ name: "flat" });
        let newItem = false;
        $.each(flats, function (key, flat) {
            if (flat.hitTest(newPoint)) {
                let openingFlatData = false;
                let openingFlatFillColor = false;
                for (let k = 0; k < itemParent.children.length; k++) {
                    if (itemParent.children[k].name == "flat") {
                        openingFlatData = itemParent.children[k].data;
                        openingFlatFillColor = itemParent.children[k].fillColor;
                        break;
                    }
                }
                if (item.name == "windowFrame") {
                    newItem = addWindow(itemParent.name, flat, flat.parent, {
                        profile: itemParent.children[0].data,
                        flat: openingFlatData,
                        flatFillColor: openingFlatFillColor
                    })
                } else if (item.name == "doorFrame") {
                    newItem = addDoor(itemParent.name, flat, flat.parent, {
                        profile: itemParent.children[0].data,
                        flat: openingFlatData,
                        flatFillColor: openingFlatFillColor
                    })
                } else if (item.name == "vPanel" || item.name == "hPanel") {
                    newItem = addPanel(item.name, flat, flat.parent, item.data)
                }
                return;
            }
        });
        if (memory && newItem) {
            reDrawMullianChildsOnDelete(memory, new state.paper.Point(newItem.bounds.centerX - itemParent.bounds.centerX, newItem.bounds.centerY - itemParent.bounds.centerY));
        }
    }
    createDimensionBar();
    state.paper.project.deselectAll();
    state.removedDependenceMemory = [];
}