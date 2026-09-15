// src/items/addWindow.js
import state from '../core/state.js';
import PaperOffset from '../utils/PaperOffset.js';
import { rebuildAccessoryMenu } from '../drawing/rebuildAccessoryMenu.js';
import { setDefaultData } from '../utils/setDefaultData.js';
import { addMullian } from "./addMullian.js";
import { addHingeAndHandle } from './addHingeAndHandle.js';
import { addLockTypeText } from './addLockTypeText.js';
import { deleteItem } from '../utils/deleteItem.js';
import { enableSave } from "../services/enableSave.js";
import { showMessage } from '../utils/showMessage.js';
import { updateLayerPreview } from "../utils/updateLayerPreview.js";
import { updateTempDesignSnapshot } from "../utils/updateTempDesignSnapshot.js";

// add Window function
export function addWindow(addNewItemType, flatToAdd, toAddGroup = false, data = false, overlap = state.defaultOverlap) { //data = {profile: data, flat: data, flatFillColor] these are data for new windows frame and flat
    console.log("ADD WINDOW TYPE:", addNewItemType);

    if (!addNewItemType) {
        console.error("addWindow received empty type");
        return;
    }
    if (state.unitData.type == "Slide") {
        showMessage('این پروفیل لولایی نیست. عملیات امکان پذیر نمی باشد');
        return;
    }
    let testframeSize = (data && data.profile) ? data.profile.profile_width : state.firstWindowSash_width;
    if (!testframeSize) {
        showMessage('بنظر می رسد این پروفیل شامل سش پنجره نمی باشد. اگر این مورد اشتباه است به مدیریت جهت اصلاح اطلاع دهید.');
        return;
    }
    state.frameSize = testframeSize;
    state.frameColor = state.unitData['profile_color_hex'];
    rebuildAccessoryMenu(addNewItemType);
    if (addNewItemType.indexOf('french') !== -1) {
        //first add overhung
        let overhung = addMullian(
            'vMullian',
            flatToAdd,
            flatToAdd.bounds.center,
            flatToAdd.parent,
            null,
            state.firstOverhung_width
        );
        overhung.data.profile = state.firstOverhung;
        overhung.data.profile_width = state.firstOverhung_width;
        overhung.data.overhung = 1;
        //find two flats
        let flats = state.paper.project.activeLayer.getItems({
            name: "flat"
        });
        let flat1, flat2;
        $.each(flats, function (fk, flt) {
            if (flt.hitTest(new state.paper.Point(overhung.bounds.centerX - 150, overhung.bounds.centerY))) {
                flat1 = flt;
            } else if (flt.hitTest(new state.paper.Point(overhung.bounds.centerX + 150, overhung.bounds.centerY))) {
                flat2 = flt;
            }
        });
        if (flat1 && flat2) {
            if (addNewItemType == 'window_french_simple_right') {
                addWindow("window_simple_right_noHandle", flat1, flat1.parent);
                addWindow("window_simple_left", flat2, flat2.parent);
            } else if (addNewItemType == 'window_french_simple_left') {
                addWindow("window_simple_right", flat1, flat1.parent);
                addWindow("window_simple_left_noHandle", flat2, flat2.parent);
            } else if (addNewItemType == 'window_french_dual_right') {
                addWindow("window_simple_right_noHandle", flat1, flat1.parent);
                addWindow("window_dual_left", flat2, flat2.parent);
            } else if (addNewItemType == 'window_french_dual_left') {
                addWindow("window_dual_right", flat1, flat1.parent);
                addWindow("window_simple_left_noHandle", flat2, flat2.parent);
            }
        } else {
            deleteItem(overhung);
        }
    } else {
        let flatToAddNew = PaperOffset.offset(flatToAdd, overlap);
        let WindowsGroup = new state.paper.Group();
        let windowsFlat = PaperOffset.offset(flatToAddNew, -state.frameSize);
        windowsFlat.fillColor = new state.paper.Color("#8acde8");
        windowsFlat.name = "flat";
        setDefaultData(windowsFlat, windowsFlat.name);
        if (data.flat) {
            windowsFlat.data = data.flat;
        }
        if (data.flatFillColor) {
            windowsFlat.fillColor = data.flatFillColor;
        }
        let windowsFrame = flatToAddNew.subtract(windowsFlat);
        windowsFrame.strokeColor = state.strokeColor;
        windowsFrame.fillColor = state.frameColor;
        windowsFrame.name = "windowFrame";
        windowsFrame.shadowColor = state.shadowColor;
        windowsFrame.shadowBlur = state.shadowBlur;
        setDefaultData(windowsFrame, windowsFrame.name);
        if (data.profile) {
            windowsFrame.data = data.profile;
        }
        windowsFrame.data.profile_width = state.frameSize;
        let tween = windowsFrame.tweenTo({
            fillColor: state.tweenFillColor
        }, 250);
        tween.then(function () {
            windowsFrame.tweenTo({
                fillColor: state.frameColor
            }, 250);
        });
        for (let index = 0; index < windowsFrame.children.length; index++) {
            windowsFrame.children[index].name = 'wframeInOut';
        }
        $.each(windowsFrame.children[0].segments, function (key, value) {
            if (value.handleIn.angle == 0 && value.handleOut.angle == 0) { //arcs has angle more than zero
                let nearestPoint = windowsFrame.children[1].getNearestPoint(value.point);
                if (nearestPoint) {
                    let frameCutLine = new state.paper.Path.Line({
                        from: value.point,
                        to: nearestPoint,
                        name: 'frameCutLine'
                    });
                    windowsFrame.addChild(frameCutLine);
                }
            }
        });
        WindowsGroup.name = addNewItemType;
        WindowsGroup.addChild(windowsFrame);
        WindowsGroup.addChild(windowsFlat);
        addLockTypeText(windowsFrame);
        let HingePosition = false;
        let HandlePosition = false;
        let olType = false;
        if (addNewItemType == 'window_simple') {
            HingePosition = false;
            HandlePosition = false;
            olType = false;
        } else if (addNewItemType == 'window_simple_right') {
            HingePosition = "left";
            HandlePosition = "right";
            olType = 'normal';
        } else if (addNewItemType == 'window_simple_left') {
            HingePosition = "right";
            HandlePosition = "left";
            olType = 'normal';
        } else if (addNewItemType == 'window_simple_top') {
            HingePosition = "bottom";
            HandlePosition = "top";
            olType = 'normal';
        } else if (addNewItemType == 'window_simple_bottom') {
            HingePosition = "top";
            HandlePosition = "bottom";
            olType = 'normal';
        } else if (addNewItemType == 'window_dual_right') {
            HingePosition = false;
            HandlePosition = "right";
            olType = 'dual';
        } else if (addNewItemType == 'window_dual_left') {
            HingePosition = false;
            HandlePosition = "left";
            olType = 'dual';
        } else if (addNewItemType == 'window_radial_right') {
            HingePosition = false;
            HandlePosition = "right";
            olType = 'radial';
        } else if (addNewItemType == 'window_radial_left') {
            HingePosition = false;
            HandlePosition = "left";
            olType = 'radial';
        } else if (addNewItemType == 'window_radial_top') {
            HingePosition = false;
            HandlePosition = "top";
            olType = 'radial';
        } else if (addNewItemType == 'window_radial_bottom') {
            HingePosition = false;
            HandlePosition = "bottom";
            olType = 'radial';
        } else if (addNewItemType == 'window_volkswagen_right') {
            HingePosition = false;
            HandlePosition = "right";
            olType = 'volkswagen';
        } else if (addNewItemType == 'window_volkswagen_left') {
            HingePosition = false;
            HandlePosition = "left";
            olType = 'volkswagen';
        } else if (addNewItemType == "window_simple_right_noHandle") {
            HingePosition = "left";
            HandlePosition = "invisible";
            olType = 'normal';
        } else if (addNewItemType == "window_simple_left_noHandle") {
            HingePosition = "right";
            HandlePosition = "invisible";
            olType = 'normal';
        }
        addHingeAndHandle(
            "window",
            flatToAddNew,
            WindowsGroup,
            HingePosition,
            HandlePosition,
            olType
        );
        flatToAdd.name = "base";
        let baseGroup = new state.paper.Group();
        baseGroup.name = "baseGroup";
        baseGroup.addChild(flatToAdd);
        baseGroup.addChild(WindowsGroup);
        if (toAddGroup) {
            toAddGroup.addChild(baseGroup);
        }
        flatToAddNew.remove();
        enableSave();
        updateTempDesignSnapshot();
        updateLayerPreview();
        
        return WindowsGroup;
    }
    updateLayerPreview();
}











// src/items/addWindow.js
// import state from '../core/state.js';
// import PaperOffset from '../utils/PaperOffset.js';
// import { rebuildAccessoryMenu } from '../drawing/rebuildAccessoryMenu.js';
// import { setDefaultData } from '../utils/setDefaultData.js';
// import { addMullian } from "./addMullian.js";
// import { addHingeAndHandle } from './addHingeAndHandle.js';
// import { addLockTypeText } from './addLockTypeText.js';
// import { deleteItem } from '../utils/deleteItem.js';
// import { enableSave } from "../services/enableSave.js";
// import { showMessage } from '../utils/showMessage.js';
// // add Window function
// export function addWindow(addNewItemType, flatToAdd, toAddGroup = false, data = false, overlap = state.defaultOverlap) { //data = {profile: data, flat: data, flatFillColor] these are data for new windows frame and flat
//     console.log("ADD WINDOW TYPE:", addNewItemType);
//     if (!addNewItemType) {
//         console.error("addWindow received empty type");
//         return;
//     }
//     if (state.unitData.type == "Slide") {
//         showMessage('این پروفیل لولایی نیست. عملیات امکان پذیر نمی باشد');
//         return;
//     }
//     let testframeSize = (data && data.profile) ? data.profile.profile_width : state.firstWindowSash_width;
//     if (!testframeSize) {
//         showMessage('بنظر می رسد این پروفیل شامل سش پنجره نمی باشد. اگر این مورد اشتباه است به مدیریت جهت اصلاح اطلاع دهید.');
//         return;
//     }
//     state.frameSize = testframeSize;
//     state.frameColor = state.unitData['profile_color_hex'];
//     rebuildAccessoryMenu(addNewItemType);
//     if (addNewItemType.indexOf('french') !== -1) {
//         //first add overhung
//         let overhung = addMullian(
//             'vMullian',
//             flatToAdd,
//             flatToAdd.bounds.center,
//             flatToAdd.parent,
//             null,
//             state.firstOverhung_width
//         );
//         overhung.data.profile = state.firstOverhung;
//         overhung.data.profile_width = state.firstOverhung_width;
//         overhung.data.overhung = 1;
//         //find two flats
//         let flats = state.paper.project.activeLayer.getItems({
//             name: "flat"
//         });
//         let flat1, flat2;
//         $.each(flats, function (fk, flt) {
//             if (flt.hitTest(new state.paper.Point(overhung.bounds.centerX - 150, overhung.bounds.centerY))) {
//                 flat1 = flt;
//             } else if (flt.hitTest(new state.paper.Point(overhung.bounds.centerX + 150, overhung.bounds.centerY))) {
//                 flat2 = flt;
//             }
//         });
//         if (flat1 && flat2) {
//             if (addNewItemType == 'window_french_simple_right') {
//                 addWindow("window_simple_right_noHandle", flat1, flat1.parent);
//                 addWindow("window_simple_left", flat2, flat2.parent);
//             } else if (addNewItemType == 'window_french_simple_left') {
//                 addWindow("window_simple_right", flat1, flat1.parent);
//                 addWindow("window_simple_left_noHandle", flat2, flat2.parent);
//             } else if (addNewItemType == 'window_french_dual_right') {
//                 addWindow("window_simple_right_noHandle", flat1, flat1.parent);
//                 addWindow("window_dual_left", flat2, flat2.parent);
//             } else if (addNewItemType == 'window_french_dual_left') {
//                 addWindow("window_dual_right", flat1, flat1.parent);
//                 addWindow("window_simple_left_noHandle", flat2, flat2.parent);
//             }
//         } else {
//             deleteItem(overhung);
//         }
//     } else {
//         let flatToAddNew = PaperOffset.offset(flatToAdd, overlap);
//         let WindowsGroup = new state.paper.Group();
//         // محدوده داخلی فریم اصلی
//         let windowsFlat = PaperOffset.offset(
//             flatToAddNew,
//             -state.frameSize
//         );
//         // فریم اصلی
//         let windowsFrame = flatToAddNew.subtract(windowsFlat);
//         windowsFrame.strokeColor = state.strokeColor;
//         windowsFrame.fillColor = state.frameColor;
//         windowsFrame.name = "windowFrame";
//         windowsFrame.shadowColor = state.shadowColor;
//         windowsFrame.shadowBlur = state.shadowBlur;
//         setDefaultData(windowsFrame, windowsFrame.name);
//         if (data.profile) {
//             windowsFrame.data = data.profile;
//         }
//         windowsFrame.data.profile_width = state.frameSize;
//         // نیم‌سازهای چهار گوشه فریم اصلی
//         for (let index = 0; index < windowsFrame.children.length; index++) {
//             windowsFrame.children[index].name = 'wframeInOut';
//         }
//         $.each(windowsFrame.children[0].segments, function (key, value) {
//             if (
//                 value.handleIn.angle == 0 &&
//                 value.handleOut.angle == 0
//             ) {
//                 let nearestPoint =
//                     windowsFrame.children[1].getNearestPoint(value.point);
//                 if (nearestPoint) {
//                     let frameCutLine = new state.paper.Path.Line({
//                         from: value.point,
//                         to: nearestPoint,
//                         name: 'frameCutLine'
//                     });
//                     frameCutLine.strokeColor = state.strokeColor;
//                     frameCutLine.strokeWidth = 1;
//                     windowsFrame.addChild(frameCutLine);
//                 }
//             }
//         });
//         // فریم داخلی
//         // کمی لاغرتر از مقدار قبلی
//         let innerFrameWidth = 18;
//         let innerGlass = PaperOffset.offset(
//             windowsFlat,
//             -innerFrameWidth
//         );
//         let innerFrame = windowsFlat.subtract(innerGlass);
//         innerFrame.name = "innerWindowFrame";
//         innerFrame.strokeColor = state.strokeColor;
//         innerFrame.fillColor = state.frameColor;
//         // فریم داخلی بدون سایه
//         innerFrame.shadowColor = null;
//         innerFrame.shadowBlur = 0;
//         setDefaultData(innerFrame, innerFrame.name);
//         // نیم‌سازهای چهار گوشه فریم داخلی
//         if (
//             innerFrame.children &&
//             innerFrame.children.length >= 2
//         ) {
//             let innerOuterPath = innerFrame.children[0];
//             let innerInnerPath = innerFrame.children[1];
//             if (
//                 innerOuterPath &&
//                 innerInnerPath &&
//                 innerOuterPath.segments
//             ) {
//                 $.each(
//                     innerOuterPath.segments,
//                     function (key, value) {
//                         if (
//                             value.handleIn.angle == 0 &&
//                             value.handleOut.angle == 0
//                         ) {
//                             let nearestPoint =
//                                 innerInnerPath.getNearestPoint(
//                                     value.point
//                                 );
//                             if (nearestPoint) {
//                                 let innerCutLine =
//                                     new state.paper.Path.Line({
//                                         from: value.point,
//                                         to: nearestPoint,
//                                         name: "innerFrameCutLine"
//                                     });
//                                 innerCutLine.strokeColor =
//                                     state.strokeColor;
//                                 innerCutLine.strokeWidth = 1;
//                                 innerFrame.addChild(
//                                     innerCutLine
//                                 );
//                             }
//                         }
//                     }
//                 );
//             }
//         }
//         // شیشه
//         windowsFlat = innerGlass;
//         windowsFlat.fillColor =
//             new state.paper.Color("#8acde8");
//         windowsFlat.name = "flat";
//         setDefaultData(
//             windowsFlat,
//             windowsFlat.name
//         );
//         if (data.flat) {
//             windowsFlat.data = data.flat;
//         }
//         // افکت فریم اصلی
//         let tween = windowsFrame.tweenTo({
//             fillColor: state.tweenFillColor
//         }, 250);
//         tween.then(function () {
//             windowsFrame.tweenTo({
//                 fillColor: state.frameColor
//             }, 250);
//         });
//         // ساخت گروه
//         WindowsGroup.name = addNewItemType;

//         WindowsGroup.addChild(windowsFrame);
//         WindowsGroup.addChild(windowsFlat);
//         WindowsGroup.addChild(innerFrame);

//         addLockTypeText(windowsFrame);

//         let HingePosition = false;
//         let HandlePosition = false;
//         let olType = false;
//         if (addNewItemType == 'window_simple') {
//             HingePosition = false;
//             HandlePosition = false;
//             olType = false;
//         } else if (addNewItemType == 'window_simple_right') {
//             HingePosition = "left";
//             HandlePosition = "right";
//             olType = 'normal';
//         } else if (addNewItemType == 'window_simple_left') {
//             HingePosition = "right";
//             HandlePosition = "left";
//             olType = 'normal';
//         } else if (addNewItemType == 'window_simple_top') {
//             HingePosition = "bottom";
//             HandlePosition = "top";
//             olType = 'normal';
//         } else if (addNewItemType == 'window_simple_bottom') {
//             HingePosition = "top";
//             HandlePosition = "bottom";
//             olType = 'normal';
//         } else if (addNewItemType == 'window_dual_right') {
//             HingePosition = false;
//             HandlePosition = "right";
//             olType = 'dual';
//         } else if (addNewItemType == 'window_dual_left') {
//             HingePosition = false;
//             HandlePosition = "left";
//             olType = 'dual';
//         } else if (addNewItemType == 'window_radial_right') {
//             HingePosition = false;
//             HandlePosition = "right";
//             olType = 'radial';
//         } else if (addNewItemType == 'window_radial_left') {
//             HingePosition = false;
//             HandlePosition = "left";
//             olType = 'radial';
//         } else if (addNewItemType == 'window_radial_top') {
//             HingePosition = false;
//             HandlePosition = "top";
//             olType = 'radial';
//         } else if (addNewItemType == 'window_radial_bottom') {
//             HingePosition = false;
//             HandlePosition = "bottom";
//             olType = 'radial';
//         } else if (addNewItemType == 'window_volkswagen_right') {
//             HingePosition = false;
//             HandlePosition = "right";
//             olType = 'volkswagen';
//         } else if (addNewItemType == 'window_volkswagen_left') {
//             HingePosition = false;
//             HandlePosition = "left";
//             olType = 'volkswagen';
//         } else if (addNewItemType == "window_simple_right_noHandle") {
//             HingePosition = "left";
//             HandlePosition = "invisible";
//             olType = 'normal';
//         } else if (addNewItemType == "window_simple_left_noHandle") {
//             HingePosition = "right";
//             HandlePosition = "invisible";
//             olType = 'normal';
//         }
//         addHingeAndHandle(
//             "window",
//             flatToAddNew,
//             WindowsGroup,
//             HingePosition,
//             HandlePosition,
//             olType
//         );
//         flatToAdd.name = "base";
//         let baseGroup = new state.paper.Group();
//         baseGroup.name = "baseGroup";
//         baseGroup.addChild(flatToAdd);
//         baseGroup.addChild(WindowsGroup);
//         if (toAddGroup) {
//             toAddGroup.addChild(baseGroup);
//         }
//         flatToAddNew.remove();
//         enableSave();
//         return WindowsGroup;
//     }
// }