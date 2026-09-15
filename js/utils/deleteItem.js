// src/utils/deleteItem.js
import state from '../core/state.js';
import { enableSave } from '../services/enableSave.js';
import { hideGLs } from './hideGLs.js';
import { createDimensionBar } from '../drawing/createDimensionBar.js';
import { showMessage } from './showMessage.js';
import { extendSectionDelete } from './extendSectionDelete.js';
//delete items
export function deleteItem(toDeleteItem) {
    enableSave();
    if (['vMullian', 'hMullian'].includes(toDeleteItem.name)) {
        //slide windows
        if (state.unitData.type == "Slide") {
            if (toDeleteItem.parent.name == "window_slide") {
                deleteItem(toDeleteItem.parent);
                hideGLs();
                return;
            } else {
                let wslide = state.paper.project.activeLayer.getItem({ name: "window_slide" });
                if (wslide) {
                    state.removedDependenceMemory.push(wslide);
                    deleteItem(wslide);
                }
                deleteItem(toDeleteItem.parent);
                hideGLs();
                return state.removedDependenceMemory;
            }
        }
        let findedBase = toDeleteItem.parent.getItem({
            name: "base"
        });
        if (findedBase) {
            //remeber depencies
            $.each(toDeleteItem.parent.children, function (key, item) {
                if (item.id !== toDeleteItem.id) {
                    state.removedDependenceMemory.push(item);
                }
            });
            //clone and delete item prent
            let baseToFlat = findedBase.clone();
            baseToFlat.moveAbove(findedBase.parent);
            baseToFlat.name = "flat";
            findedBase.parent.remove();
            state.vMGL.visible = false;
            state.vMGLT.visible = false;
            state.vMGRT.visible = false;
            state.hMGL.visible = false;
            state.hMGTT.visible = false;
            state.hMGBT.visible = false;
            createDimensionBar();
            return state.removedDependenceMemory;
        } else {
            showMessage('پنل حذف پیدا نشد!');
        }
    } else if (toDeleteItem.name.indexOf('Panel') !== -1 || toDeleteItem.name.indexOf('window_') !== -1 || toDeleteItem.name.indexOf('door_') !== -1) {
        let findedBase = toDeleteItem.parent.getItem({
            name: "base"
        });
        if (findedBase) {
            //remeber depencies
            $.each(toDeleteItem.children, function (key, item) {
                state.removedDependenceMemory.push(item);
            });
            let baseToFlat = findedBase.clone();
            baseToFlat.moveAbove(findedBase.parent);
            baseToFlat.name = "flat";
            findedBase.parent.remove();
            return state.removedDependenceMemory;
        }
    } else if (toDeleteItem.name == "baseGroup") {
        let findedBase = toDeleteItem.getItem({
            name: "base"
        });
        if (findedBase) {
            let baseToFlat = findedBase.clone();
            baseToFlat.moveAbove(findedBase.parent);
            baseToFlat.name = "flat";
            toDeleteItem.remove();
        }
    } else if (toDeleteItem.name == "windowFrame" || toDeleteItem.name == "doorFrame") {
        if (toDeleteItem.parent.name == "slide") {
            deleteItem(toDeleteItem.parent.parent.parent);
        } else {
            let findedBase = toDeleteItem.parent.parent.getItem({
                name: "base"
            });
            if (findedBase) {
                //remeber depencies
                $.each(toDeleteItem.parent.children, function (key, item) {
                    state.removedDependenceMemory.push(item);
                });
                let baseToFlat = findedBase.clone();
                baseToFlat.moveAbove(findedBase.parent);
                baseToFlat.name = "flat";
                findedBase.parent.remove();
                return state.removedDependenceMemory;
            }
        }
    } else if (toDeleteItem.name == 'flat') {
        if (toDeleteItem.parent) {
            if (toDeleteItem.parent.name == "slide") {
                deleteItem(toDeleteItem.parent.parent.parent);
            } else if (toDeleteItem.parent.name == "window_slide") {
                deleteItem(toDeleteItem.parent.parent);
            } else if (toDeleteItem.parent.name.indexOf('door_') !== -1 || toDeleteItem.parent.name.indexOf('window_') !== -1) {
                deleteItem(toDeleteItem.parent.children[0]);
            } else if (toDeleteItem.parent.name.indexOf('section') !== -1) {
                return;
            }
        }
    } else if (toDeleteItem.name == 'vCoupling' || toDeleteItem.name == 'hCoupling') {
        let sections = state.paper.project.activeLayer.getItems({
            name: "section"
        });
        toDeleteItem.remove();
        for (let i = 0; i < sections.length; i++) {
            if (toDeleteItem.name == 'vCoupling') {
                if (sections[i].bounds.topLeft.x == toDeleteItem.bounds.topRight.x) {
                    deleteItem(sections[i]);
                    break;
                }
            } else if (toDeleteItem.name == 'hCoupling') {
                if (sections[i].bounds.topLeft.y == toDeleteItem.bounds.bottomLeft.y) {
                    deleteItem(sections[i]);
                    break;
                }
            }
        }
    } else if (toDeleteItem.name == 'mainFrame') {
        let mains = state.paper.project.activeLayer.getItems({ name: "mainFrame" });
        if (toDeleteItem.bounds.topLeft.x < 100 && toDeleteItem.bounds.topLeft.y < 100) {
            showMessage("این فریم اصلی است. حذف کنی چیزی نمیمونه!");
        } else {
            deleteItem(toDeleteItem.parent);
        }
    } else if (toDeleteItem.name == 'section') {
        extendSectionDelete(toDeleteItem);
    }
    $('.itemDetails').html('');
    state.paper.project.deselectAll();
    createDimensionBar();
}