// src/items/addSlideFrame.js
import state from '../core/state.js';
import PaperOffset from '../utils/PaperOffset.js';
import { rebuildAccessoryMenu } from '../drawing/rebuildAccessoryMenu.js';
import { setDefaultData } from '../utils/setDefaultData.js';
import { showMessage } from '../utils/showMessage.js';
// add frame for slide windows
export function addSlideFrame(flatToAdd, frameSize, overlaps, data = false) { //ex.: overlaps = {left: 8, right: 30, top: 8, bottom: 8}
    let from = new state.paper.Point(flatToAdd.bounds.x - overlaps.left, flatToAdd.bounds.y - overlaps.top);
    let to = new state.paper.Point(flatToAdd.bounds.bottomRight.x + overlaps.right, flatToAdd.bounds.bottomRight.y + overlaps.bottom);
    let testframeSize = state.firstWindowSash_width;
    if (!testframeSize) {
        showMessage('بنظر می رسد این پروفیل شامل سش مناسب نمی باشد. اگر این مورد اشتباه است به مدیریت جهت اصلاح اطلاع دهید.');
        return;
    }
    frameSize = testframeSize;
    state.frameColor = state.unitData['profile_color_hex'];
    let flatToAddNew = new state.paper.Path.Rectangle(from, to);
    let windowsFlat = PaperOffset.offset(flatToAddNew, -frameSize);
    windowsFlat.fillColor = state.flatColor;
    windowsFlat.name = "flat";
    rebuildAccessoryMenu('slide');
    setDefaultData(windowsFlat, windowsFlat.name);
    if (data && data.flat) {
        windowsFlat.data = data.flat;
    }
    let windowsFrame = flatToAddNew.subtract(windowsFlat);
    windowsFrame.strokeColor = state.strokeColor;
    windowsFrame.fillColor = state.frameColor;
    windowsFrame.name = "windowFrame";
    windowsFrame.shadowColor = state.shadowColor;
    windowsFrame.shadowBlur = state.shadowBlur;
    setDefaultData(windowsFrame, windowsFrame.name);
    if (data && data.profile) {
        windowsFrame.data = data.profile;
    }
    windowsFrame.data.profile_width = frameSize;
    windowsFrame.data.profile_width = frameSize;
    let tween = windowsFrame.tweenTo({
        fillColor: state.tweenFillColor
    }, 250);
    tween.then(function () {
        windowsFrame.tweenTo({
            fillColor: state.frameColor
        }, 250);
    });
    $.each(windowsFrame.children[0].segments, function (key, value) {
        windowsFrame.moveTo(value.point);
        var nearestPoint = windowsFrame.children[1].getNearestPoint(value.point);
        if (nearestPoint) {
            windowsFrame.lineTo(nearestPoint);
        }
    });
    for (let index = 0; index < windowsFrame.children.length; index++) {
        windowsFrame.children[index].name = 'wframeInOut';
    }
    let WindowsGroup = new state.paper.Group();
    WindowsGroup.name = "slide";
    WindowsGroup.addChild(windowsFrame);
    WindowsGroup.addChild(windowsFlat);
    WindowsGroup.parent = flatToAdd.parent;
    flatToAdd.name = "base";
    flatToAddNew.name = "base";
    flatToAddNew.remove();
    flatToAdd.remove();
    return WindowsGroup;
}