// src/items/changeMullianPosition.js
import state from '../core/state.js';
import { addSlide } from './addSlide.js';
import { addMullian } from "./addMullian.js";
import { createDimensionBar } from '../drawing/createDimensionBar.js';
import { reDrawMullianChildsOnDelete } from '../drawing/reDrawMullianChildsOnDelete.js';
import { deleteItem } from '../utils/deleteItem.js';
import { enableSave } from '../services/enableSave.js';
import { saveHistory } from "../services/saveHistory.js";
import { cancelAll } from '../utils/cancelAll.js';
// change Mullian Position
export function changeMullianPosition(newPoint) {
    if (state.selectedItem) {
        if (state.selectedItem.parent.name == "window_slide") {
            let wslide = state.paper.project.activeLayer.getItem({ name: "window_slide" });
            let mullianData = state.selectedItem.data;
            if (wslide) {
                //find position of other mullians
                let vMullians = wslide.getItems({ name: "vMullian" });
                let pointsOfMullians = [];
                if (vMullians.length > 0) {
                    $.each(vMullians, function (key, mullian) {
                        if (Math.round(mullian.bounds.centerX) == Math.round(state.selectedItem.bounds.centerX)) {
                            pointsOfMullians.push(newPoint.x);
                        } else {
                            pointsOfMullians.push(mullian.bounds.centerX);
                        }
                    });
                    pointsOfMullians.sort((a, b) => (a < b ? -1 : 0)); //sort min to max
                    deleteItem(wslide);
                    let flats = state.paper.project.activeLayer.getItems({ name: "flat" });
                    $.each(flats, function (key, flat) {
                        if (flat.hitTest(wslide.bounds.center)) {
                            addSlide(flat, false, pointsOfMullians, wslide.data, mullianData);
                            return;
                        }
                    });
                    createDimensionBar();
                    return;
                }
            }
        } else {
            if (state.ctrlKeyPressed) {
                let allFlats = state.paper.project.activeLayer.getItems({ name: "flat" });
                $.each(allFlats, function (key, flat) {
                    if (flat.hitTest(newPoint)) {
                        addMullian(state.selectedItem.name, flat, newPoint, flat.parent, state.selectedItem.data);
                        return;
                    }
                });
            } else {
                let newMullian;
                let selectedItemCopy = state.selectedItem;
                let memory = deleteItem(state.selectedItem);
                let allFlats = state.paper.project.activeLayer.getItems({ name: "flat" });
                $.each(allFlats, function (key, flat) {
                    if (flat.hitTest(newPoint)) {
                        newMullian = addMullian(
                            selectedItemCopy.name,
                            flat,
                            newPoint,
                            flat.parent,
                            selectedItemCopy.data
                        );
                        return;
                    }
                });
                enableSave();
                reDrawMullianChildsOnDelete(memory);
                createDimensionBar();
                saveHistory();
                cancelAll();
                return newMullian;
            }
        }
    }
}