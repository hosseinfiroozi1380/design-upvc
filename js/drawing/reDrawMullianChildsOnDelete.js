// src/drawing/reDrawMullianChildsOnDelete.js
import state from "../core/state.js";
import { addSlide } from "../items/addSlide.js";
import { addMullian } from "../items/addMullian.js";
import { addWindow } from "../items/addWindow.js";
import { addDoor } from "../items/addDoor.js";
import { addPanel } from "../items/addPanel.js";
import { enableSave } from "../services/enableSave.js";
import { getBaseGroupItems } from "../utils/getBaseGroupItems.js";
export function reDrawMullianChildsOnDelete(memory, newOffset = false) {

    let selectedType = state.selectedItem ? state.selectedItem.name : null;
    if (!memory || memory.length < 0) {
        return;
    }
    $.each(memory, function (key, item) {
        if (['vMullian', 'hMullian'].includes(item.name)) {
            state.mulliansToRedraw.push(item);
            state.othersToRedraw.push(item);
        } else if (item.name == "window_slide") {
            let flats = state.paper.project.activeLayer.getItems({ name: 'flat' });
            $.each(flats, function (key2, flat) {
                if (flat.hitTest(item.bounds.center)) {
                    addSlide(flat, false, false, item.data)
                    return;
                }
            });
        } else if (item.name == "baseGroup") {
            getBaseGroupItems(item)
        }
    });
    //first reDraw Mullians except in slide
    $.each(state.mulliansToRedraw, function (key, item) {
        if (item.parent.name == "window_slide") {
            return true;
        }
        let flats = state.paper.project.activeLayer.getItems({ name: "flat" });
        $.each(flats, function (k, flat) {
            let testPoint = item.bounds.center;
            if (newOffset) testPoint = new state.paper.Point(testPoint.x + newOffset.x, testPoint.y + newOffset.y);
            if (selectedType == "vMullian") {
                if (item.bounds.centerX > state.selectedItem.bounds.centerX) { //item was in right mullain side
                    testPoint = [item.bounds.rightCenter.x - 10, item.bounds.rightCenter.y];
                } else {
                    testPoint = [item.bounds.leftCenter.x + 10, item.bounds.rightCenter.y];
                }
            } else if (selectedType == "hMullian") {
                if (item.bounds.centerY > state.selectedItem.bounds.centerY) { //item was in below mullain side
                    testPoint = [item.bounds.bottomCenter.x, item.bounds.bottomCenter.y - 10];
                } else {
                    testPoint = [item.bounds.topCenter.x, item.bounds.topCenter.y + 10];
                }
            }
            if (flat.hitTest(testPoint)) {
                addMullian(item.name, flat, item.bounds.center, flat.parent, item.data);
                return;
            }
        });
    });
    state.mulliansToRedraw = [];
    //then reDraw Others except Panel
    $.each(state.othersToRedraw, function (key, item) {
        if (item.name.indexOf("window_") !== -1 || item.name.indexOf("door_") !== -1) {
            let flats = state.paper.project.activeLayer.getItems({ name: "flat" });
            $.each(flats, function (k, flat) {
                let testPoint = item.bounds.center;
                if (newOffset) testPoint = new state.paper.Point(testPoint.x + newOffset.x, testPoint.y + newOffset.y);
                if (selectedType == "vMullian") {
                    if (item.bounds.centerX > state.selectedItem.bounds.centerX) { //item was in right mullain side
                        testPoint = [item.bounds.rightCenter.x - 100, item.bounds.rightCenter.y]; //100 for framesize back
                    } else {
                        testPoint = [item.bounds.leftCenter.x + 100, item.bounds.rightCenter.y];
                    }
                } else if (selectedType == "hMullian") {
                    if (item.bounds.centerY > state.selectedItem.bounds.centerY) { //item was in below mullain side
                        testPoint = [item.bounds.bottomCenter.x, item.bounds.bottomCenter.y - 100]; //100 for framesize back
                    } else {
                        testPoint = [item.bounds.topCenter.x, item.bounds.topCenter.y + 100];
                    }
                }
                if (flat.hitTest(testPoint)) {
                    let openingFlatData = false;
                    let openingFlatFillColor = false;
                    for (let k = 0; k < item.children.length; k++) {
                        if (item.children[k].name == "flat") {
                            openingFlatData = item.children[k].data;
                            openingFlatFillColor = item.children[k].fillColor;
                            break;
                        }
                    }
                    let window;
                    if (item.name.indexOf("window_") !== -1) {
                        window = addWindow(item.name, flat, flat.parent, {
                            profile: item.children[0].data,
                            flat: openingFlatData,
                            flatFillColor: openingFlatFillColor
                        });
                    } else if (item.name.indexOf("door_") !== -1) {
                        window = addDoor(item.name, flat, flat.parent, {
                            profile: item.children[0].data,
                            flat: openingFlatData,
                            flatFillColor: openingFlatFillColor
                        });
                    }
                    //add child property
                    let otherProperty = item.getItems({
                        name: function (value) {
                            return ['vMullian', 'hMullian', 'vPanel', 'hPanel'].includes(value);
                        }
                    })
                    $.each(otherProperty, function (s, itemp) {
                        if (itemp.name.indexOf("Mullian") !== -1) {
                            let flatsi = state.paper.project.activeLayer.getItems({ name: "flat" });
                            $.each(flatsi, function (k, flt) {
                                let testPoint = itemp.bounds.center;
                                if (newOffset) testPoint = new state.paper.Point(testPoint.x + newOffset.x, testPoint.y + newOffset.y);
                                if (selectedType == "vMullian") {
                                    if (itemp.bounds.centerX > state.selectedItem.bounds.centerX) { //item was in right mullain side
                                        testPoint = [itemp.bounds.rightCenter.x - 10, itemp.bounds.rightCenter.y];
                                    } else {
                                        testPoint = [itemp.bounds.leftCenter.x + 10, itemp.bounds.rightCenter.y];
                                    }
                                } else if (selectedType == "hMullian") {
                                    if (itemp.bounds.centerY > state.selectedItem.bounds.centerY) { //item was in below mullain side
                                        testPoint = [itemp.bounds.bottomCenter.x, itemp.bounds.bottomCenter.y - 10];
                                    } else {
                                        testPoint = [itemp.bounds.topCenter.x, itemp.bounds.topCenter.y + 10];
                                    }
                                }
                                if (flt.hitTest(testPoint)) {
                                    addMullian(itemp.name, flt, itemp.bounds.center, flt.parent, itemp.data, false);
                                    return;
                                }
                            });
                        }
                    });
                    $.each(otherProperty, function (s, itemp) {
                        if (itemp.name.indexOf("Panel") !== -1) {
                            let flatsi = state.paper.project.activeLayer.getItems({ name: "flat" });
                            $.each(flatsi, function (k, flt) {
                                let testPoint = itemp.bounds.center;
                                if (newOffset) testPoint = new state.paper.Point(testPoint.x + newOffset.x, testPoint.y + newOffset.y);
                                if (selectedType == "vMullian") {
                                    if (itemp.bounds.centerX > state.selectedItem.bounds.centerX) { //item was in right mullain side
                                        testPoint = [itemp.bounds.rightCenter.x - 100, itemp.bounds.rightCenter.y];
                                    } else {
                                        testPoint = [itemp.bounds.leftCenter.x + 100, itemp.bounds.rightCenter.y];
                                    }
                                } else if (selectedType == "hMullian") {
                                    if (itemp.bounds.centerY > state.selectedItem.bounds.centerY) { //item was in below mullain side
                                        testPoint = [itemp.bounds.bottomCenter.x, itemp.bounds.bottomCenter.y - 100];
                                    } else {
                                        testPoint = [itemp.bounds.topCenter.x, itemp.bounds.topCenter.y + 100];
                                    }
                                }
                                if (flt.hitTest(testPoint)) {
                                    addPanel(itemp.name, flt, flt.parent, itemp.data);
                                    return;
                                }
                            });
                        }
                    });
                    return;
                }
            });
        }
    });
    //then reDraw Panel
    $.each(state.othersToRedraw, function (key, item) {
        if (item.name.indexOf("Panel") !== -1) {
            let flats = state.paper.project.activeLayer.getItems({ name: "flat" });
            $.each(flats, function (k, flat) {
                let testPoint = item.bounds.center;
                if (newOffset) testPoint = new state.paper.Point(testPoint.x + newOffset.x, testPoint.y + newOffset.y);
                if (selectedType == "vMullian") {
                    if (item.bounds.centerX > state.selectedItem.bounds.centerX) { //item was in right mullain side
                        testPoint = [item.bounds.rightCenter.x - 100, item.bounds.rightCenter.y]; //100 for framesize back
                    } else {
                        testPoint = [item.bounds.leftCenter.x + 100, item.bounds.rightCenter.y];
                    }
                } else if (selectedType == "hMullian") {
                    if (item.bounds.centerY > state.selectedItem.bounds.centerY) { //item was in below mullain side
                        testPoint = [item.bounds.bottomCenter.x, item.bounds.bottomCenter.y - 100]; //100 for framesize back
                    } else {
                        testPoint = [item.bounds.topCenter.x, item.bounds.topCenter.y + 100];
                    }
                }
                if (flat.hitTest(testPoint)) {
                    addPanel(item.name, flat, flat.parent, item.data);
                    return;
                }
            });
        }
    });
    state.othersToRedraw = [];
    state.removedDependenceMemory = [];
    enableSave();
}