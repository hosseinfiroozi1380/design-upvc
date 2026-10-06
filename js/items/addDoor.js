// src/items/addDoor.js
import state from "../core/state.js";
import PaperOffset from "../utils/PaperOffset.js";
import { rebuildAccessoryMenu } from "../drawing/rebuildAccessoryMenu.js";
import { showMessage } from "../utils/showMessage.js";
import { addMullian } from "./addMullian.js";
import { addLockTypeText } from "./addLockTypeText.js";
import { setDefaultData } from "../utils/setDefaultData.js";
import { addHingeAndHandle } from "./addHingeAndHandle.js";
import { enableSave } from "../services/enableSave.js";
import { drawDoorOpeningLines } from "../drawing/drawDoorOpeningLines.js";
import { updateTempDesignSnapshot } from "../utils/updateTempDesignSnapshot.js";
import { updateLayerPreview } from "../utils/updateLayerPreview.js";
// ساخت قسمت وسط و چهار نیم‌ساز شیشه
function createGlassBorders(glassShape, group) {
    const blackWidth = 1.5;
    const whiteWidth = 12;
    const innerBlackWidth = 1.5;
    const glassBorders =
        new state.paper.Group();
    glassBorders.name =
        "glassBorders";
    glassBorders.data.glassId =
        glassShape.id;
    // لایه مشکی بیرونی
    const outerBlackInner =
        PaperOffset.offset(
            glassShape,
            -blackWidth
        );
    if (!outerBlackInner) {
        return null;
    }
    const outerBlack =
        glassShape.subtract(
            outerBlackInner
        );
    outerBlack.fillColor =
        "#222222";
    outerBlack.strokeColor =
        null;
    outerBlack.name =
        "glassOuterBlack";
    glassBorders.addChild(
        outerBlack
    );
    // قسمت سفید / وسط
    const whiteInner =
        PaperOffset.offset(
            outerBlackInner,
            -whiteWidth
        );
    if (!whiteInner) {
        outerBlackInner.remove();
        return glassBorders;
    }
    const whiteBorder =
        outerBlackInner.subtract(
            whiteInner
        );
    whiteBorder.fillColor =
        "#ffffff";
    whiteBorder.strokeColor =
        null;
    whiteBorder.name =
        "glassWhiteBorder";
    glassBorders.addChild(
        whiteBorder
    );
    // چهار نیم‌ساز گوشه
    const outerBounds =
        outerBlackInner.bounds;
    const innerBounds =
        whiteInner.bounds;
    const cornerGroup =
        new state.paper.Group();
    cornerGroup.name =
        "glassCornerBisectors";
    const corners = [
        [
            [outerBounds.left, outerBounds.top],
            [innerBounds.left, innerBounds.top]
        ],
        [
            [outerBounds.right, outerBounds.top],
            [innerBounds.right, innerBounds.top]
        ],
        [
            [outerBounds.left, outerBounds.bottom],
            [innerBounds.left, innerBounds.bottom]
        ],
        [
            [outerBounds.right, outerBounds.bottom],
            [innerBounds.right, innerBounds.bottom]
        ]
    ];
    corners.forEach(points => {
        const line =
            new state.paper.Path.Line({
                from: points[0],
                to: points[1]
            });
        line.strokeColor =
            "#222222";
        line.strokeWidth =
            1.5;
        line.strokeCap =
            "butt";
        line.name =
            "glassCornerBisector";
        cornerGroup.addChild(
            line
        );
    });
    glassBorders.addChild(
        cornerGroup
    );
    // خط مشکی داخلی
    const innerBlackInner =
        PaperOffset.offset(
            whiteInner,
            -innerBlackWidth
        );
    if (innerBlackInner) {
        const innerBlack =
            whiteInner.subtract(
                innerBlackInner
            );
        innerBlack.fillColor =
            "#222222";
        innerBlack.strokeColor =
            null;
        innerBlack.name =
            "glassInnerBlack";
        glassBorders.addChild(
            innerBlack
        );
        innerBlackInner.remove();
    }
    // اضافه کردن به گروه درب
    group.addChild(
        glassBorders
    );
    outerBlackInner.remove();
    whiteInner.remove();
    return glassBorders;
}
//add Door function
export function addDoor(
    addNewItemType,
    flatToAdd,
    toAddGroup = false,
    data = false,
    overlap = state.defaultOverlap
) {
    if (state.unitData.type == "Slide") {
        showMessage('این پروفیل لولایی نیست. عملیات امکان پذیر نمی باشد');
        return;
    }
    rebuildAccessoryMenu(addNewItemType);
    let testframeSizeDoor = (data && data.profile)
        ? data.profile.profile_width
        : state.firstDoorSash_width;
    if (!testframeSizeDoor) {
        showMessage(
            'بنظر می رسد این پروفیل شامل سش درب نمی باشد. اگر این مورد اشتباه است به مدیریت جهت اصلاح اطلاع دهید.'
        );
        return;
    }
    state.frameSizeDoor = testframeSizeDoor;
    state.frameColor = state.unitData['profile_color_hex'];
    if (addNewItemType.indexOf('french') !== -1) {
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
        let flats = state.paper.project.activeLayer.getItems({
            name: "flat"
        });
        let flat1;
        let flat2;
        $.each(flats, function (fk, flt) {
            if (
                flt.hitTest(
                    new state.paper.Point(
                        overhung.bounds.centerX - 150,
                        overhung.bounds.centerY
                    )
                )
            ) {
                flat1 = flt;
            } else if (
                flt.hitTest(
                    new state.paper.Point(
                        overhung.bounds.centerX + 150,
                        overhung.bounds.centerY
                    )
                )
            ) {
                flat2 = flt;
            }
        });
        if (flat1 && flat2) {
            if (addNewItemType == 'door_french_simple_right') {
                addDoor("door_simple_right_noHandle", flat1, flat1.parent);
                addDoor("door_simple_left", flat2, flat2.parent);
            } else if (addNewItemType == 'door_french_simple_left') {
                addDoor("door_simple_right", flat1, flat1.parent);
                addDoor("door_simple_left_noHandle", flat2, flat2.parent);
            } else if (addNewItemType == 'door_french_dual_right') {
                addDoor("door_simple_right_noHandle", flat1, flat1.parent);
                addDoor("door_dual_left", flat2, flat2.parent);
            } else if (addNewItemType == 'door_french_dual_left') {
                addDoor("door_dual_right", flat1, flat1.parent);
                addDoor("door_simple_left_noHandle", flat2, flat2.parent);
            }
        } else {
            overhung.remove();
        }
    } else {
        let flatToAddNew = PaperOffset.offset(
            flatToAdd,
            overlap
        );
        let DoorsGroup = new state.paper.Group();
        let windowsFlat = PaperOffset.offset(
            flatToAddNew,
            -state.frameSizeDoor
        );
        windowsFlat.fillColor = new state.paper.Color("#8acde8");
        windowsFlat.name = "flat";
        setDefaultData(
            windowsFlat,
            windowsFlat.name
        );
        if (data && data.flat) {
            windowsFlat.data = data.flat;
        }
        if (data && data.flatFillColor) {
            windowsFlat.fillColor = data.flatFillColor;
        }
        let windowsFrame =
            flatToAddNew.subtract(
                windowsFlat
            );
        windowsFrame.strokeColor =
            state.strokeColor;
        windowsFrame.strokeWidth = 2;
        windowsFrame.fillColor =
            state.frameColor;
        windowsFrame.name =
            "doorFrame";
        // سایه فریم در
        // windowsFrame.shadowColor = state.shadowColor;
        // windowsFrame.shadowBlur = state.shadowBlur;
        // پررنگ کردن مرزهای خود فریم درب
        if (
            windowsFrame.children &&
            windowsFrame.children.length >= 2
        ) {
            windowsFrame.children[0].strokeColor =
                state.strokeColor;
            windowsFrame.children[0].strokeWidth =
                3;
            windowsFrame.children[1].strokeColor =
                state.strokeColor;
            windowsFrame.children[1].strokeWidth =
                3;
        }
        setDefaultData(
            windowsFrame,
            windowsFrame.name
        );
        setDefaultData(
            windowsFrame,
            windowsFrame.name
        );
        if (data.profile) {
            windowsFrame.data = data.profile;
        }
        windowsFrame.data.profile_width = state.frameSizeDoor;
        for (
            let index = 0;
            index < windowsFrame.children.length;
            index++
        ) {
            windowsFrame.children[index].name = 'dframeInOut';
        }
        // چهار نیم‌ساز گوشه فریم درب
        if (
            windowsFrame.children &&
            windowsFrame.children.length >= 2
        ) {
            windowsFrame.children.forEach(child => {
                child.name =
                    "dframeInOut";
                child.strokeColor =
                    state.strokeColor;
                child.strokeWidth =
                    3;
            });
            windowsFrame.children[0].segments.forEach(
                segment => {
                    const isStraight =
                        segment.handleIn.angle === 0 &&
                        segment.handleOut.angle === 0;
                    if (!isStraight) {
                        return;
                    }
                    const nearestPoint =
                        windowsFrame.children[1]
                            .getNearestPoint(
                                segment.point
                            );
                    if (!nearestPoint) {
                        return;
                    }
                    const frameCutLine =
                        new state.paper.Path.Line({
                            from: segment.point,
                            to: nearestPoint
                        });
                    frameCutLine.name =
                        "frameCutLine";
                    frameCutLine.strokeColor =
                        state.strokeColor;
                    frameCutLine.strokeWidth =
                        3;
                    frameCutLine.strokeCap =
                        "butt";
                    windowsFrame.addChild(
                        frameCutLine
                    );
                }
            );
        }
        DoorsGroup.name = addNewItemType;
        // فریم درب
        DoorsGroup.addChild(
            windowsFrame
        );
        // شیشه
        DoorsGroup.addChild(
            windowsFlat
        );
        // قسمت وسط + چهار نیم‌ساز
        createGlassBorders(
            windowsFlat,
            DoorsGroup
        );
        addLockTypeText(
            windowsFrame
        );
        let HingePosition = false;
        let HandlePosition = false;
        let olType = false;
        if (addNewItemType == 'door_simple_right') {
            HingePosition = "left";
            HandlePosition = "right";
            olType = 'normal';
        } else if (addNewItemType == 'door_simple_left') {
            HingePosition = "right";
            HandlePosition = "left";
            olType = 'normal';
        } else if (addNewItemType == 'door_dual_right') {
            HingePosition = "left";
            HandlePosition = "right";
            olType = 'dual';
        } else if (addNewItemType == 'door_dual_left') {
            HingePosition = "right";
            HandlePosition = "left";
            olType = 'dual';
        } else if (addNewItemType == "door_simple_right_noHandle") {
            HingePosition = "left";
            HandlePosition = "invisible";
            olType = 'normal';
        } else if (addNewItemType == "door_simple_left_noHandle") {
            HingePosition = "right";
            HandlePosition = "invisible";
            olType = 'normal';
        }
        addHingeAndHandle(
            "door",
            flatToAddNew,
            DoorsGroup,
            HingePosition,
            HandlePosition,
            false
        );
        if (HandlePosition !== "invisible") {
            drawDoorOpeningLines(
                HandlePosition,
                DoorsGroup,
                addNewItemType === "door_dual_right" ||
                addNewItemType === "door_dual_left"
            );
        }
        flatToAdd.name = "base";
        let baseGroup = new state.paper.Group();
        baseGroup.name = "baseGroup";
        baseGroup.addChild(flatToAdd);
        baseGroup.addChild(DoorsGroup);
        if (toAddGroup) {
            toAddGroup.addChild(baseGroup);
        }
        flatToAddNew.remove();
        enableSave();
        updateTempDesignSnapshot();
        updateLayerPreview();
        return DoorsGroup;
    }
}