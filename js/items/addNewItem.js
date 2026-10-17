// js/items/addNewItem.js
import state from '../core/state.js';
import { addLace } from './addLace.js';
import { addMullian } from './addMullian.js';
import { addPanel } from './addPanel.js';
import { addWindow } from './addWindow.js';
import { addDoor } from './addDoor.js';
import { addSlide } from './addSlide.js';
import { mouseHelperHide } from '../events/mouseHelperHide.js';
import { createDimensionBar } from '../drawing/createDimensionBar.js';
import { showMessage } from '../utils/showMessage.js';
import { saveHistory } from '../services/saveHistory.js';
import { cancelAll } from '../utils/cancelAll.js';
import { hideGLs } from '../utils/hideGLs.js';
export function addNewItem(addNewItemType, flatToAdd, toAddPoint = false) {
    console.log("ADD NEW ITEM TYPE:", addNewItemType);
    console.log("FLAT:", flatToAdd);
    state.frameColor = state.unitData['profile_color_hex'];
    if (addNewItemType === "lace") {
        addLace(flatToAdd, Number($('.laceInput[data-id="lace"] option:not([disabled]):eq(1)').val()));
    } else if (flatToAdd && flatToAdd.name === "flat") {
        const paper = state.paper;
        const activeLayer = paper.project.activeLayer;
        const frameSize = state.frameSize ?? 60;
        if (addNewItemType === 'vMullian' || addNewItemType === 'hMullian') {
            if (
                (addNewItemType === 'vMullian' && flatToAdd.bounds.width > 120) ||
                (addNewItemType === 'hMullian' && flatToAdd.bounds.height > 120)
            ) {
                if (state.shiftKeyPressed) {
                    const centerPoint = new paper.Point(
                        flatToAdd.bounds.centerX,
                        flatToAdd.bounds.centerY
                    );
                    addMullian(addNewItemType, flatToAdd, centerPoint, flatToAdd.parent);
                } else {
                    addMullian(addNewItemType, flatToAdd, toAddPoint, flatToAdd.parent);
                }
            } else {
                showMessage('صفحه بیش از اندازه کوچک است');
            }
        } else if (addNewItemType === '2vMullian') {
            if (flatToAdd.bounds.width > 160) {
                const flatPartWidth = flatToAdd.bounds.width / 3;
                const firstPoint = new paper.Point(
                    flatToAdd.bounds.x + flatPartWidth - frameSize / 6,
                    flatToAdd.bounds.centerY
                );
                const secondPoint = new paper.Point(
                    flatToAdd.bounds.x + flatPartWidth * 2 + frameSize / 6,
                    flatToAdd.bounds.centerY
                );
                addMullian('vMullian', flatToAdd, firstPoint, flatToAdd.parent);
                const secondFlat = activeLayer.getItems({ name: "flat" }).find(flat =>
                    flat !== flatToAdd &&
                    flat.parent === flatToAdd.parent &&
                    flat.bounds.contains(secondPoint)
                );
                if (secondFlat) {
                    addMullian('vMullian', secondFlat, secondPoint, secondFlat.parent);
                } else {
                    showMessage('محل مولین دوم پیدا نشد', 'error');
                }
            } else {
                showMessage('صفحه بیش از اندازه کوچک است');
            }
        } else if (addNewItemType === '3vMullian') {
            if (flatToAdd.bounds.width > 240) {
                const flatPartWidth = flatToAdd.bounds.width / 4;
                const firstPoint = new paper.Point(
                    flatToAdd.bounds.x + flatPartWidth - frameSize / 4,
                    flatToAdd.bounds.centerY
                );
                const secondPoint = new paper.Point(
                    flatToAdd.bounds.x + flatPartWidth * 2,
                    flatToAdd.bounds.centerY
                );
                const thirdPoint = new paper.Point(
                    flatToAdd.bounds.x + flatPartWidth * 3 + frameSize / 4,
                    flatToAdd.bounds.centerY
                );
                addMullian('vMullian', flatToAdd, firstPoint, flatToAdd.parent);
                const secondFlat = activeLayer.getItems({ name: "flat" }).find(flat =>
                    flat !== flatToAdd &&
                    flat.parent === flatToAdd.parent &&
                    flat.bounds.contains(secondPoint)
                );
                if (secondFlat) {
                    addMullian('vMullian', secondFlat, secondPoint, secondFlat.parent);
                } else {
                    showMessage('محل مولین دوم پیدا نشد', 'error');
                }
                const thirdFlat = activeLayer.getItems({ name: "flat" }).find(flat =>
                    flat !== flatToAdd &&
                    flat.parent === flatToAdd.parent &&
                    flat.bounds.contains(thirdPoint)
                );
                if (thirdFlat) {
                    addMullian('vMullian', thirdFlat, thirdPoint, thirdFlat.parent);
                } else {
                    showMessage('محل مولین سوم پیدا نشد', 'error');
                }
            } else {
                showMessage('صفحه بیش از اندازه کوچک است');
            }
        } else if (addNewItemType === '2hMullian') {
            if (flatToAdd.bounds.height > 160) {
                const flatPartHeight = flatToAdd.bounds.height / 3;
                const firstPoint = new paper.Point(
                    flatToAdd.bounds.centerX,
                    flatToAdd.bounds.y + flatPartHeight - frameSize / 6
                );
                const secondPoint = new paper.Point(
                    flatToAdd.bounds.centerX,
                    flatToAdd.bounds.y + flatPartHeight * 2 + frameSize / 6
                );
                addMullian('hMullian', flatToAdd, firstPoint, flatToAdd.parent);
                const secondFlat = activeLayer.getItems({ name: "flat" }).find(flat =>
                    flat !== flatToAdd &&
                    flat.parent === flatToAdd.parent &&
                    flat.bounds.contains(secondPoint)
                );
                if (secondFlat) {
                    addMullian('hMullian', secondFlat, secondPoint, secondFlat.parent);
                } else {
                    showMessage('محل مولین افقی دوم پیدا نشد', 'error');
                }
            } else {
                showMessage('صفحه بیش از اندازه کوچک است');
            }
        } else if (addNewItemType === '3hMullian') {
            if (flatToAdd.bounds.height > 240) {
                const flatPartHeight = flatToAdd.bounds.height / 4;
                const firstPoint = new paper.Point(
                    flatToAdd.bounds.centerX,
                    flatToAdd.bounds.y + flatPartHeight - frameSize / 4
                );
                const secondPoint = new paper.Point(
                    flatToAdd.bounds.centerX,
                    flatToAdd.bounds.y + flatPartHeight * 2
                );
                const thirdPoint = new paper.Point(
                    flatToAdd.bounds.centerX,
                    flatToAdd.bounds.y + flatPartHeight * 3 + frameSize / 4
                );
                addMullian('hMullian', flatToAdd, firstPoint, flatToAdd.parent);
                const secondFlat = activeLayer.getItems({ name: "flat" }).find(flat =>
                    flat !== flatToAdd &&
                    flat.parent === flatToAdd.parent &&
                    flat.bounds.contains(secondPoint)
                );
                if (secondFlat) {
                    addMullian('hMullian', secondFlat, secondPoint, secondFlat.parent);
                } else {
                    showMessage('محل مولین افقی دوم پیدا نشد', 'error');
                }
                const thirdFlat = activeLayer.getItems({ name: "flat" }).find(flat =>
                    flat !== flatToAdd &&
                    flat.parent === flatToAdd.parent &&
                    flat.bounds.contains(thirdPoint)
                );
                if (thirdFlat) {
                    addMullian('hMullian', thirdFlat, thirdPoint, thirdFlat.parent);
                } else {
                    showMessage('محل مولین افقی سوم پیدا نشد', 'error');
                }
            } else {
                showMessage('صفحه بیش از اندازه کوچک است');
            }
        } else if (addNewItemType === 'fullhMullian' || addNewItemType === 'fullvMullian') {
            const isHorizontal = addNewItemType === 'fullhMullian';
            let position = isHorizontal ? toAddPoint.y : toAddPoint.x;
            if (state.shiftKeyPressed) {
                position = isHorizontal ? flatToAdd.bounds.centerY : flatToAdd.bounds.centerX;
            }
            const allFlats = activeLayer.getItems({ name: "flat" });
            const targetFlats = allFlats.filter(flat => {
                const parent = flat.parent;
                return parent === flatToAdd.parent;
            });
            targetFlats.forEach(flat => {
                if (isHorizontal) {
                    if (position > flat.bounds.top && position < flat.bounds.bottom) {
                        addMullian('hMullian', flat, new paper.Point(flat.bounds.centerX, position), flat.parent);
                    }
                } else if (position > flat.bounds.left && position < flat.bounds.right) {
                    addMullian('vMullian', flat, new paper.Point(position, flat.bounds.centerY), flat.parent);
                }
            });
        } else if (addNewItemType === 'vPanel' || addNewItemType === 'hPanel') {
            if (
                (addNewItemType === 'vPanel' && flatToAdd.bounds.width > 120) ||
                (addNewItemType === 'hPanel' && flatToAdd.bounds.height > 120)
            ) {
                addPanel(addNewItemType, flatToAdd, flatToAdd.parent);
            } else {
                showMessage('صفحه بیش از اندازه کوچک است');
            }
        } else if (addNewItemType.includes('window_')) {
            if (flatToAdd.bounds.width > 120 && flatToAdd.bounds.height > 120) {
                addWindow(addNewItemType, flatToAdd, flatToAdd.parent);
            } else {
                showMessage('صفحه بیش از اندازه کوچک است');
            }
        } else if (addNewItemType.includes('door_')) {
            if (flatToAdd.bounds.width > 120 && flatToAdd.bounds.height > 120) {
                addDoor(addNewItemType, flatToAdd, flatToAdd.parent);
            } else {
                showMessage('صفحه بیش از اندازه کوچک است');
            }
        } else if (addNewItemType.includes('slide')) {
            if (flatToAdd.bounds.width > 200 && flatToAdd.bounds.height > 200) {
                addSlide(flatToAdd, addNewItemType);
            } else {
                showMessage('صفحه بیش از اندازه کوچک است');
            }
        }
        paper.project.deselectAll();
        cancelAll();
        createDimensionBar();
        saveHistory();
    } else {
        showMessage("برای ادامه، لطفاً اطلاعات فرم را تکمیل کنید.", "error");
        hideGLs();
    }
    if (!$('#glassBox').hasClass('closed')) {
        $('#glassBox').addClass('closed');
        $('#toggleIcon').html('<i class="ti ti-chevron-left"></i>');
    }
    state.paper.project.deselectAll();
    mouseHelperHide();
}
