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
            HingePosition = "left";
            HandlePosition = "right";
            olType = 'dual';
        } else if (addNewItemType == 'window_dual_left') {
            HingePosition = "right";
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
/////////////////////////////////////////////////////////
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
// import { updateLayerPreview } from "../utils/updateLayerPreview.js";
// import { updateTempDesignSnapshot } from "../utils/updateTempDesignSnapshot.js";
// // ساخت شیشه پنجره
// function createWindowGlass(flat, frameSize, data) {
//     const glass = PaperOffset.offset(
//         flat,
//         -frameSize
//     );
//     glass.fillColor =
//         state.flatColor ||
//         new state.paper.Color("#8acde8");
//     glass.name = "flat";
//     setDefaultData(
//         glass,
//         glass.name
//     );
//     if (data && data.flat) {
//         glass.data = data.flat;
//     }
//     if (data && data.flatFillColor) {
//         glass.fillColor = data.flatFillColor;
//     }
//     return glass;
// }
// // ساخت فریم پنجره
// function createWindowFrame(
//     outerShape,
//     glass,
//     data
// ) {
//     const frame =
//         outerShape.subtract(glass);
//     frame.strokeColor =
//         state.strokeColor;
//     frame.fillColor =
//         state.frameColor;
//     frame.name =
//         "windowFrame";
//     frame.shadowColor =
//         state.shadowColor;
//     frame.shadowBlur =
//         state.shadowBlur;
//     setDefaultData(
//         frame,
//         frame.name
//     );
//     if (data && data.profile) {
//         frame.data = data.profile;
//     }
//     frame.data.profile_width =
//         state.frameSize;
//     return frame;
// }
// // اضافه کردن خطوط برش داخل فریم
// function addFrameCutLines(frame) {
//     if (
//         !frame.children[0] ||
//         !frame.children[1]
//     ) {
//         return;
//     }
//     $.each(
//         frame.children[0].segments,
//         function (key, segment) {
//             const isStraightPoint =
//                 segment.handleIn.angle === 0 &&
//                 segment.handleOut.angle === 0;
//             if (!isStraightPoint) {
//                 return;
//             }
//             const nearestPoint =
//                 frame.children[1].getNearestPoint(
//                     segment.point
//                 );
//             if (!nearestPoint) {
//                 return;
//             }
//             const cutLine =
//                 new state.paper.Path.Line({
//                     from: segment.point,
//                     to: nearestPoint,
//                     name: "frameCutLine"
//                 });
//             frame.addChild(cutLine);
//         }
//     );
// }
// // تعیین نوع لولا، دستگیره و بازشو
// function getWindowOpeningConfig(type) {
//     switch (type) {
//         case "window_simple":
//             return {
//                 hinge: false,
//                 handle: false,
//                 opening: false
//             };
//         case "window_simple_right":
//             return {
//                 hinge: "left",
//                 handle: "right",
//                 opening: "normal"
//             };
//         case "window_simple_left":
//             return {
//                 hinge: "right",
//                 handle: "left",
//                 opening: "normal"
//             };
//         case "window_simple_top":
//             return {
//                 hinge: "bottom",
//                 handle: "top",
//                 opening: "normal"
//             };
//         case "window_simple_bottom":
//             return {
//                 hinge: "top",
//                 handle: "bottom",
//                 opening: "normal"
//             };
//         case "window_dual_right":
//             return {
//                 hinge: "left",
//                 handle: "right",
//                 opening: "dual"
//             };
//         case "window_dual_left":
//             return {
//                 hinge: "right",
//                 handle: "left",
//                 opening: "dual"
//             };
//         case "window_radial_right":
//             return {
//                 hinge: false,
//                 handle: "right",
//                 opening: "radial"
//             };
//         case "window_radial_left":
//             return {
//                 hinge: false,
//                 handle: "left",
//                 opening: "radial"
//             };
//         case "window_radial_top":
//             return {
//                 hinge: false,
//                 handle: "top",
//                 opening: "radial"
//             };
//         case "window_radial_bottom":
//             return {
//                 hinge: false,
//                 handle: "bottom",
//                 opening: "radial"
//             };
//         case "window_volkswagen_right":
//             return {
//                 hinge: false,
//                 handle: "right",
//                 opening: "volkswagen"
//             };
//         case "window_volkswagen_left":
//             return {
//                 hinge: false,
//                 handle: "left",
//                 opening: "volkswagen"
//             };
//         case "window_simple_right_noHandle":
//             return {
//                 hinge: "left",
//                 handle: "invisible",
//                 opening: "normal"
//             };
//         case "window_simple_left_noHandle":
//             return {
//                 hinge: "right",
//                 handle: "invisible",
//                 opening: "normal"
//             };
//         default:
//             return {
//                 hinge: false,
//                 handle: false,
//                 opening: false
//             };
//     }
// }
// // پیدا کردن دو قسمت شیشه برای پنجره فرانسوی
// function findFrenchWindowFlats(overhung) {
//     const flats =
//         state.paper.project.activeLayer.getItems({
//             name: "flat"
//         });
//     let flat1 = null;
//     let flat2 = null;
//     $.each(
//         flats,
//         function (fk, flat) {
//             if (
//                 flat.hitTest(
//                     new state.paper.Point(
//                         overhung.bounds.centerX - 150,
//                         overhung.bounds.centerY
//                     )
//                 )
//             ) {
//                 flat1 = flat;
//             } else if (
//                 flat.hitTest(
//                     new state.paper.Point(
//                         overhung.bounds.centerX + 150,
//                         overhung.bounds.centerY
//                     )
//                 )
//             ) {
//                 flat2 = flat;
//             }
//         }
//     );
//     return {
//         flat1,
//         flat2
//     };
// }
// // تعیین ترکیب دو پنجره فرانسوی
// function addFrenchWindowParts(
//     type,
//     flat1,
//     flat2
// ) {
//     switch (type) {
//         case "window_french_simple_right":
//             addWindow(
//                 "window_simple_right_noHandle",
//                 flat1,
//                 flat1.parent
//             );
//             addWindow(
//                 "window_simple_left",
//                 flat2,
//                 flat2.parent
//             );
//             break;
//         case "window_french_simple_left":
//             addWindow(
//                 "window_simple_right",
//                 flat1,
//                 flat1.parent
//             );
//             addWindow(
//                 "window_simple_left_noHandle",
//                 flat2,
//                 flat2.parent
//             );
//             break;
//         case "window_french_dual_right":
//             addWindow(
//                 "window_simple_right_noHandle",
//                 flat1,
//                 flat1.parent
//             );
//             addWindow(
//                 "window_dual_left",
//                 flat2,
//                 flat2.parent
//             );
//             break;
//         case "window_french_dual_left":
//             addWindow(
//                 "window_dual_right",
//                 flat1,
//                 flat1.parent
//             );
//             addWindow(
//                 "window_simple_left_noHandle",
//                 flat2,
//                 flat2.parent
//             );
//             break;
//     }
// }
// // ساخت پنجره فرانسوی
// function createFrenchWindow(
//     type,
//     flatToAdd
// ) {
//     const overhung = addMullian(
//         "vMullian",
//         flatToAdd,
//         flatToAdd.bounds.center,
//         flatToAdd.parent,
//         null,
//         state.firstOverhung_width
//     );
//     if (!overhung) {
//         return;
//     }
//     overhung.data.profile =
//         state.firstOverhung;
//     overhung.data.profile_width =
//         state.firstOverhung_width;
//     overhung.data.overhung = 1;
//     const frenchFlats =
//         findFrenchWindowFlats(overhung);
//     if (
//         frenchFlats.flat1 &&
//         frenchFlats.flat2
//     ) {
//         addFrenchWindowParts(
//             type,
//             frenchFlats.flat1,
//             frenchFlats.flat2
//         );
//     } else {
//         deleteItem(overhung);
//     }
// }
// // add Window function
// export function addWindow(
//     addNewItemType,
//     flatToAdd,
//     toAddGroup = false,
//     data = false,
//     overlap = state.defaultOverlap
// ) {
//     console.log(
//         "ADD WINDOW TYPE:",
//         addNewItemType
//     );
//     // بررسی نوع پنجره
//     if (!addNewItemType) {
//         console.error(
//             "addWindow received empty type"
//         );
//         return;
//     }
//     // بررسی پروفیل کشویی
//     if (
//         state.unitData.type === "Slide"
//     ) {
//         showMessage(
//             "این پروفیل لولایی نیست. عملیات امکان پذیر نمی باشد"
//         );
//         return;
//     }
//     // تعیین اندازه فریم
//     const testFrameSize =
//         data && data.profile
//             ? data.profile.profile_width
//             : state.firstWindowSash_width;
//     if (!testFrameSize) {
//         showMessage(
//             "بنظر می رسد این پروفیل شامل سش پنجره نمی باشد. اگر این مورد اشتباه است به مدیریت جهت اصلاح اطلاع دهید."
//         );
//         return;
//     }
//     state.frameSize =
//         testFrameSize;
//     state.frameColor =
//         state.unitData.profile_color_hex;
//     // بروزرسانی منوی یراق
//     rebuildAccessoryMenu(
//         addNewItemType
//     );
//     // پنجره فرانسوی
//     if (
//         addNewItemType.indexOf("french") !== -1
//     ) {
//         createFrenchWindow(
//             addNewItemType,
//             flatToAdd
//         );
//         updateLayerPreview();
//         return;
//     }
//     // ایجاد محدوده جدید
//     const flatToAddNew =
//         PaperOffset.offset(
//             flatToAdd,
//             overlap
//         );
//     // ساخت شیشه
//     const windowsFlat =
//         createWindowGlass(
//             flatToAddNew,
//             state.frameSize,
//             data
//         );
//     // ساخت فریم
//     const windowsFrame =
//         createWindowFrame(
//             flatToAddNew,
//             windowsFlat,
//             data
//         );
//     // افکت تغییر رنگ فریم
//     const tween =
//         windowsFrame.tweenTo(
//             {
//                 fillColor:
//                     state.tweenFillColor
//             },
//             250
//         );
//     tween.then(function () {
//         windowsFrame.tweenTo(
//             {
//                 fillColor:
//                     state.frameColor
//             },
//             250
//         );
//     });
//     // نام‌گذاری قسمت‌های داخلی فریم
//     for (
//         let index = 0;
//         index < windowsFrame.children.length;
//         index++
//     ) {
//         windowsFrame.children[index].name =
//             "wframeInOut";
//     }
//     // ایجاد خطوط برش
//     addFrameCutLines(
//         windowsFrame
//     );
//     // ساخت گروه پنجره
//     const WindowsGroup =
//         new state.paper.Group();
//     WindowsGroup.name =
//         addNewItemType;
//     WindowsGroup.addChild(
//         windowsFrame
//     );
//     WindowsGroup.addChild(
//         windowsFlat
//     );
//     // متن نوع قفل
//     addLockTypeText(
//         windowsFrame
//     );
//     // تنظیمات بازشو
//     const openingConfig =
//         getWindowOpeningConfig(
//             addNewItemType
//         );
//     // اضافه کردن لولا و دستگیره
//     addHingeAndHandle(
//         "window",
//         flatToAddNew,
//         WindowsGroup,
//         openingConfig.hinge,
//         openingConfig.handle,
//         openingConfig.opening
//     );
//     // ساخت گروه اصلی
//     flatToAdd.name =
//         "base";
//     const baseGroup =
//         new state.paper.Group();
//     baseGroup.name =
//         "baseGroup";
//     baseGroup.addChild(
//         flatToAdd
//     );
//     baseGroup.addChild(
//         WindowsGroup
//     );
//     // اضافه کردن به گروه والد
//     if (toAddGroup) {
//         toAddGroup.addChild(
//             baseGroup
//         );
//     }
//     // حذف شکل موقت
//     flatToAddNew.remove();
//     // فعال کردن ذخیره
//     enableSave();
//     // بروزرسانی اطلاعات طراحی
//     updateTempDesignSnapshot();
//     updateLayerPreview();
//     return WindowsGroup;
// }