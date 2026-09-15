// src/utils/showGLs.js
import state from '../core/state.js';
import {
    round2decimal
} from './round2decimal.js';
import {
    mouseHelperSetColor
} from '../events/mouseHelperSetColor.js';
export function showGLs(event) {
    if (state.flatHover) state.flatHover.remove();
    if (state.mouseHelperClone) state.mouseHelperClone.remove();
    //find section base on event point
    let selectedSection;
    let allSections = state.paper.project.activeLayer.getItems({
        name: "section"
    });
    if (allSections.length == 1) {
        selectedSection = allSections[0];
    } else {
        selectedSection = state.mainSection;
        let toCheckPoint;
        if (event) {
            toCheckPoint = event.point;
        } else {
            toCheckPoint = state.selectedItem.bounds.center;
        }
        $.each(allSections, function (s, sec) {
            if (sec.contains(toCheckPoint)) {
                selectedSection = sec;
                return;
            }
        });
    }
    state.hMGL.bounds.width =
        selectedSection.bounds.width;
    state.vMGL.bounds.height =
        selectedSection.bounds.height;
    state.glG.visible = true;
    state.vMGL.visible = true;
    state.vMGLT.visible = true;
    state.vMGRT.visible = true;
    state.hMGL.visible = true;
    state.hMGTT.visible = true;
    state.hMGBT.visible = true;
    state.glG.bringToFront();
    state.vMGL.bringToFront();
    state.vMGLT.bringToFront();
    state.vMGRT.bringToFront();
    state.hMGL.bringToFront();
    state.hMGTT.bringToFront();
    state.hMGBT.bringToFront();
    if (event) {
        let hitFlat = false;
        let flats = state.paper.project.activeLayer.getItems({
            name: "flat"
        });
        $.each(flats, function (key, flat) {
            if (flat.hitTest(event.point)) {
                hitFlat = flat;
                return;
            }
        });
        if (hitFlat) {
            state.flatHover = hitFlat.clone();
            state.flatHover.fillColor =
                state.flatHoverColor;
            if (state.waitingToAddItemFlag) {
                mouseHelperSetColor(
                    'info',
                    'محل نصب را مشخص نمایید'
                );
            } else {
                mouseHelperSetColor(
                    'info',
                    'بگیرید و به مکان مورد نظر بکشید'
                );
                state.mouseHelperClone =
                    (
                        [
                            'vMullian',
                            'hMullian'
                        ].includes(state.selectedItem.name)
                    )
                        ? state.selectedItem.clone()
                        : state.selectedItem.parent.clone();
                state.mouseHelperClone.scale(0.5);
                state.mouseHelperClone.parent =
                    state.paper.project.activeLayer;
                state.mouseHelperClone.position =
                    new state.paper.Point(
                        event.point.x,
                        event.point.y
                    );
            }
            document.body.style.cursor = "grabbing";
        } else {
            mouseHelperSetColor(
                'warning',
                '<i class="ti ti-trash icon"></i>'
            );
            document.body.style.cursor = "removing";
        }
    }
    state.moveStepFactor =
        state.shiftKeyPressed
            ? 1
            : 5;
    if (
        (
            event &&
            state.waitingToAddItemFlag &&
            (
                state.addNewItemType == "vMullian" ||
                state.addNewItemType == "fullvMullian"
            )
        ) ||
        (
            state.selectedItem &&
            state.selectedItem.name == "vMullian"
        )
    ) {
        let itemXCenter =
            event
                ? Math.ceil(
                    event.point.x /
                    state.moveStepFactor
                ) *
                state.moveStepFactor
                : state.selectedItem.bounds.centerX;
        state.hMGL.position =
            new state.paper.Point(
                selectedSection.bounds.centerX,
                selectedSection.bounds.y +
                state.frameSize
            );
        state.vMGL.position =
            new state.paper.Point(
                itemXCenter,
                selectedSection.bounds.centerY
            );
        state.vMGLT.position =
            new state.paper.Point(
                (
                    selectedSection.bounds.x +
                    itemXCenter
                ) / 2,
                selectedSection.bounds.y - 50
            );
        state.vMGLT.content =
            round2decimal(
                itemXCenter -
                selectedSection.bounds.x
            );
        state.vMGRT.position =
            new state.paper.Point(
                itemXCenter +
                (
                    selectedSection.bounds.x +
                    selectedSection.bounds.width -
                    itemXCenter
                ) / 2,
                selectedSection.bounds.y - 50
            );
        state.vMGRT.content =
            round2decimal(
                selectedSection.bounds.x +
                selectedSection.bounds.width -
                itemXCenter
            );
        state.hMGTT.visible = false;
        state.hMGBT.visible = false;
    } else if (
        (
            event &&
            state.waitingToAddItemFlag &&
            (
                state.addNewItemType == "hMullian" ||
                state.addNewItemType == "fullhMullian"
            )
        ) ||
        (
            state.selectedItem &&
            state.selectedItem.name == "hMullian"
        )
    ) {
        let itemYCenter =
            event
                ? Math.ceil(
                    event.point.y /
                    state.moveStepFactor
                ) *
                state.moveStepFactor
                : state.selectedItem.bounds.centerY;
        state.vMGL.position =
            new state.paper.Point(
                selectedSection.bounds.x +
                selectedSection.bounds.width -
                state.frameSize,
                selectedSection.bounds.centerY
            );
        state.hMGL.position =
            new state.paper.Point(
                selectedSection.bounds.centerX,
                itemYCenter
            );
        state.hMGTT.position =
            new state.paper.Point(
                selectedSection.bounds.x +
                selectedSection.bounds.width +
                60,
                itemYCenter / 2
            );
        state.hMGTT.content =
            round2decimal(itemYCenter);
        state.hMGBT.position =
            new state.paper.Point(
                selectedSection.bounds.x +
                selectedSection.bounds.width +
                60,
                itemYCenter +
                (
                    selectedSection.bounds.height -
                    itemYCenter
                ) / 2
            );
        state.hMGBT.content =
            round2decimal(
                selectedSection.bounds.height -
                itemYCenter
            );
        state.vMGLT.visible = false;
        state.vMGRT.visible = false;
    } else if (
        event &&
        state.waitingToAddItemFlag
    ) {
        let itemXCenter = event.point.x;
        let itemYCenter = event.point.y;
        state.vMGL.position =
            new state.paper.Point(
                itemXCenter,
                selectedSection.bounds.centerY
            );
        state.vMGLT.position =
            new state.paper.Point(
                itemXCenter / 2,
                selectedSection.bounds.y - 100
            );
        state.vMGLT.content =
            round2decimal(itemXCenter);
        state.vMGRT.position =
            new state.paper.Point(
                itemXCenter +
                (
                    selectedSection.bounds.width -
                    itemXCenter
                ) / 2,
                selectedSection.bounds.y - 100
            );
        state.vMGRT.content =
            round2decimal(
                selectedSection.bounds.width -
                itemXCenter
            );
        state.hMGL.position =
            new state.paper.Point(
                selectedSection.bounds.centerX,
                itemYCenter
            );
        state.hMGTT.position =
            new state.paper.Point(
                selectedSection.bounds.x +
                selectedSection.bounds.width +
                60,
                itemYCenter / 2
            );
        state.hMGTT.content =
            round2decimal(itemYCenter);
        state.hMGBT.position =
            new state.paper.Point(
                selectedSection.bounds.x +
                selectedSection.bounds.width +
                60,
                itemYCenter +
                (
                    selectedSection.bounds.height -
                    itemYCenter
                ) / 2
            );
        state.hMGBT.content =
            round2decimal(
                selectedSection.bounds.height -
                itemYCenter
            );
        state.hMGTT.visible = false;
        state.hMGBT.visible = false;
        state.vMGLT.visible = false;
        state.vMGRT.visible = false;
        if (state.addNewItemType == "lace") {
            mouseHelperSetColor(
                'info',
                'فریم یک بازشو را انتخاب کنید'
            );
        } else {
            mouseHelperSetColor(
                'info',
                'محل نصب را مشخص نمایید'
            );
        }
    } else if (
        state.selectedItem &&
        state.selectedItem.name == "gl"
    ) {
        state.vMGL.visible = false;
        state.vMGLT.visible = false;
        state.vMGRT.visible = false;
        state.hMGL.visible = false;
        state.hMGTT.visible = false;
        state.hMGBT.visible = false;
        state.selectedItem.visible = true;
    } else {
        state.vMGL.visible = false;
        state.vMGLT.visible = false;
        state.vMGRT.visible = false;
        state.hMGL.visible = false;
        state.hMGTT.visible = false;
        state.hMGBT.visible = false;
    }
}