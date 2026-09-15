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
        windowsFlat.fillColor = state.flatColor;
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
        let windowsFrame = flatToAddNew.subtract(windowsFlat);
        windowsFrame.strokeColor = state.strokeColor;
        windowsFrame.fillColor = state.frameColor;
        windowsFrame.name = "doorFrame";
        windowsFrame.shadowColor = state.shadowColor;
        windowsFrame.shadowBlur = state.shadowBlur;
        setDefaultData(
            windowsFrame,
            windowsFrame.name
        );
        if (data.profile) {
            windowsFrame.data = data.profile;
        }
        windowsFrame.data.profile_width = state.frameSizeDoor;
        let tween = windowsFrame.tweenTo(
            {
                fillColor: state.tweenFillColor
            },
            250
        );
        tween.then(function () {
            windowsFrame.tweenTo(
                {
                    fillColor: state.frameColor
                },
                250
            );
        });
        for (
            let index = 0;
            index < windowsFrame.children.length;
            index++
        ) {
            windowsFrame.children[index].name = 'dframeInOut';
        }
        $.each(
            windowsFrame.children[0].segments,
            function (key, value) {
                if (
                    value.handleIn.angle == 0 &&
                    value.handleOut.angle == 0
                ) {
                    let nearestPoint =
                        windowsFrame.children[1]
                        .getNearestPoint(value.point);
                    if (nearestPoint) {
                        let frameCutLine =
                            new state.paper.Path.Line({
                                from: value.point,
                                to: nearestPoint,
                                name: 'frameCutLine'
                            });
                        windowsFrame.addChild(frameCutLine);
                    }
                }
            }
        );
        DoorsGroup.name = addNewItemType;
        DoorsGroup.addChild(windowsFrame);
        DoorsGroup.addChild(windowsFlat);
        addLockTypeText(windowsFrame);
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
                DoorsGroup
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
        return DoorsGroup;
    }
}