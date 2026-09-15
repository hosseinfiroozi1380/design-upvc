// src/items/addHingeAndHandle.js
import state from "../core/state.js";
import { foundHingeCount } from "../utils/foundHingeCount.js";
import { angleTwoPoint } from "../geometry/angleTwoPoint.js";
import { findSidePositionByAngle } from "../utils/findSidePositionByAngle.js";
import { drawHinge } from "../drawing/drawHinge.js";
import { drawHandle } from "../drawing/drawHandle.js";
import { drawOpeningLines } from "../drawing/drawOpeningLines.js";
import { showMessage } from "../utils/showMessage.js";

// add hinge and handle
export function addHingeAndHandle(winOrDoor, flatToAdd, itemGroup, HingePosition, HandlePosition, olType) {

    let hingePositions = [];
    hingePositions['right'] = [];
    hingePositions['left'] = [];
    hingePositions['top'] = [];
    hingePositions['bottom'] = [];
    let handlePositions = [];
    let minSpace = 120;

    for (let index = 0; index < flatToAdd.curves.length; index++) {
        let curve = flatToAdd.curves[index];
        if (curve.isStraight() && curve.length > 30) { //some tiny straight curve is in start and end of arcs
            let hingeCount = foundHingeCount(curve.length);
            let angle = angleTwoPoint(curve.bounds.center, flatToAdd.bounds.center);
            let side = findSidePositionByAngle(angle);

            if (side) { //side = bottom, left, top, right
                if (hingeCount == 2) {
                    hingePositions[side][0] = curve.getLocationAt(minSpace).point;
                    hingePositions[side][1] = curve.getLocationAt(curve.length - minSpace).point;
                } else if (hingeCount == 3) {
                    hingePositions[side][0] = curve.getLocationAt(minSpace).point;
                    hingePositions[side][1] = curve.getLocationAt(minSpace + 350).point;
                    if (HingePosition == "left") {
                        hingePositions[side][1] = curve.getLocationAt(curve.length - minSpace - 350).point;
                    }
                    // hingePositions[side][1] = curve.getLocationAt(curve.length/2).point;
                    hingePositions[side][2] = curve.getLocationAt(curve.length - minSpace).point;
                } else if (hingeCount == 4) {
                    hingePositions[side][0] = curve.getLocationAt(minSpace).point;
                    hingePositions[side][1] = curve.getLocationAt(minSpace + 350).point;
                    // hingePositions[side][2] = curve.getLocationAt(minSpace + 700).point;
                    // hingePositions[side][1] = curve.getLocationAt(curve.length - minSpace - 700).point;
                    hingePositions[side][2] = curve.getLocationAt(curve.length - minSpace - 350).point;
                    hingePositions[side][3] = curve.getLocationAt(curve.length - minSpace).point;
                } else if (hingeCount >= 5) {
                    hingePositions[side][0] = curve.getLocationAt(minSpace).point;
                    hingePositions[side][1] = curve.getLocationAt(minSpace + 350).point;
                    hingePositions[side][2] = curve.getLocationAt(curve.length / 2).point;
                    hingePositions[side][3] = curve.getLocationAt(curve.length - minSpace - 350).point;
                    hingePositions[side][4] = curve.getLocationAt(curve.length - minSpace).point;
                }
                handlePositions[side] = flatToAdd.curves[index].bounds.center;
            }
        }
    }

    //draw hinges
    $.each(["left", "right", "top", "bottom"], function (key, pos) {
        if ([pos].includes(HingePosition)) {
            $.each(hingePositions[pos], function (key, hingeCenterPoint) {
                let Tangant = flatToAdd.getTangentAt(flatToAdd.getOffsetOf(hingeCenterPoint));
                let rotation = 90;
                if (Tangant) {
                    drawHinge(winOrDoor, hingeCenterPoint, (rotation + Tangant.angle), itemGroup)
                } else {
                    showMessage('خطای فنی نصب لولا در موقعیت نامناسب! لولا نصب نشد.');
                    state.errorInDraw = true;
                }
            });
        }
    });

    //draw hanlde
    $.each(["left", "right", "top", "bottom"], function (key, pos) {
        if ([pos].includes(HandlePosition)) {
            let handlePos = handlePositions[pos];
            let handlePosNew = handlePos;
            let displacement = (winOrDoor == "door")
                ? state.frameSizeDoor / 2 + 8
                : state.frameSize / 2;
            if (handlePos) {
                if (pos == "left") {
                    handlePosNew = new state.paper.Point(handlePos.x + displacement, handlePos.y);
                } else if (pos == "right") {
                    handlePosNew = new state.paper.Point(handlePos.x - displacement, handlePos.y);
                } else if (pos == "top") {
                    handlePosNew = new state.paper.Point(handlePos.x, handlePos.y + displacement);
                } else if (pos == "bottom") {
                    handlePosNew = new state.paper.Point(handlePos.x, handlePos.y - displacement);
                }
                let Tangant = flatToAdd.getTangentAt(flatToAdd.getOffsetOf(handlePos));
                let rotation = (pos == "right") ? 270 : 90;
                drawHandle(winOrDoor, HandlePosition, handlePosNew, (rotation + Tangant.angle), itemGroup);
            } else {
                showMessage('خطای فنی نصب دستگیره در موقعیت نامناسب! دستگیره نصب نشد.');
                state.errorInDraw = true;
            }
        }
    });

    //draw opening lines
    if (olType) {
        drawOpeningLines(olType, HandlePosition, handlePositions, HingePosition, hingePositions, itemGroup);
    }

}//