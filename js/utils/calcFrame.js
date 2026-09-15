// src/utils/calcFrame.js
import state from "../core/state.js";

import { angleCorrection } from "./angleCorrection.js";
import { angleTwoPoint } from "../geometry/angleTwoPoint.js";
import { findSidePositionByAngle } from "./findSidePositionByAngle.js";
import { round2decimal } from "./round2decimal.js";
import { weldSizeExtraSize } from "../geometry/weldSizeExtraSize.js";
import { waterSlut } from "./waterSlut.js";


export function calcFrame(arg) { //arg{id, item, type, parent}
    let frameFlat = arg.item?.children?.[0] || null;
    let abrevationType = '';
    let handlePositions = [];
    let hingePositions = [];
    let hingePositionsFirst = [];
    let handleFromFrame = [];
    let hingeFromFrame = [];
    let waterSluts = [];
    let stat = '';
    let toRemove = false;

    let slideSlide = arg.item?.parent?.parent?.data?.config?.slideSide ?? '';

    if (arg.type.indexOf('slide') !== -1) {
        abrevationType = "windowFrame"
    } else if (arg.type.indexOf('window_') !== -1) {
        abrevationType = "windowFrame";
    } else if (arg.type.indexOf('door_') !== -1) {
        abrevationType = "doorFrame";
    } else {
        abrevationType = "mainFrame";
    }

    $.each(arg.item.parent.children, function (key, child) {
        if (child.name == "handle") {
            handlePositions.push([child.bounds.center.x, child.bounds.center.y]);
        } else if (child.name == "hinge") {
            hingePositions.push([child.bounds.center.x, child.bounds.center.y]);
            hingePositionsFirst.push([child.bounds.center.x, child.bounds.center.y]);
        }
    });

    //find mullians installation side on frames for connection position
    let mullians = arg.item.parent.getItems({
        name: function (value) {
            return ['vMullian', 'hMullian'].includes(value);
        }
    });

    for (let index = 0; index < frameFlat.curves.length; index++) {
        let curve = frameFlat.curves[index];
        let angles = [];
        if (abrevationType == "mainFrame") {
            angles.push(angleCorrection((180 - curve.getTangentAt(0.001, true).getAngle(curve.previous.getTangentAt(0.999, true))) / 2));
            angles.push(angleCorrection((180 - curve.next.getTangentAt(0.001, true).getAngle(curve.getTangentAt(0.999, true))) / 2));
        } else {
            angles.push(angleCorrection((180 - curve.next.getTangentAt(0.001, true).getAngle(curve.getTangentAt(0.999, true))) / 2));
            angles.push(angleCorrection((180 - curve.getTangentAt(0.001, true).getAngle(curve.previous.getTangentAt(0.999, true))) / 2));
        }

        let sidePosition = findSidePositionByAngle(angleTwoPoint(curve.bounds.center, frameFlat.bounds.center));

        waterSluts = [];
        if (sidePosition == "top") {
            stat = 'Top';
        } else if (sidePosition == "bottom") {
            stat = 'Bottom';
            waterSluts = waterSlut(curve, abrevationType);
            if (abrevationType == "mainFrame" && arg.item.data.bottomdoor > 0) {
                angles = [90, 90];
                toRemove = index;
            }
        } else if (sidePosition == "left") {
            stat = 'Left';
            if (abrevationType == "mainFrame" && arg.item.data.bottomdoor > 0) {
                angles = [90, angles[1]];
            }
        } else if (sidePosition == "right") {
            stat = 'Right';
            if (abrevationType == "mainFrame" && arg.item.data.bottomdoor > 0) {
                angles = [angles[0], 90];
            }
        } else {
            stat = '';
        }

        let isCurve = false;
        if (!curve.isStraight()) {
            isCurve = true;
            stat += ' Curve';
        }

        //create caculation object
        state.calculations[abrevationType][arg.id + '_' + index] = {
            id: arg.id,
            type: arg.type,
            length: round2decimal(curve.length + weldSizeExtraSize(angles[0]) + weldSizeExtraSize(angles[1])),
            angles: angles,
            slideSlide: slideSlide,
            arc: isCurve,
            components: arg.item.data,
            waterSluts: waterSluts,
            parent: arg.parent,
            bounds: {
                top: round2decimal(curve.bounds.top),
                left: round2decimal(curve.bounds.left),
                width: round2decimal(arg.item.bounds.width),
                height: round2decimal(arg.item.bounds.height)
            },
            handle: 0,
            hinge: 0,
            zamak: 0,
            mullianPoints: [],
            stat: stat,
            path: curve.path.getPathData(),
        }

        //find mullain points on frame
        let mullianPoints = [];
        let curveTempLine = new state.paper.Path.Line(curve.segment1.point, curve.segment2.point);
        let profileWidth = arg.item.data.profile_width ?? 0;
        $.each(mullians, function (key, mullian) {
            let mullianTempLine;
            if (mullian.name == "vMullian") { //vMullian
                let point1 = new state.paper.Point(mullian.bounds.centerX, mullian.bounds.topCenter.y - profileWidth);
                let point2 = new state.paper.Point(mullian.bounds.centerX, mullian.bounds.bottomCenter.y + profileWidth);
                mullianTempLine = new state.paper.Path.Line(point1, point2);
                let intersect = curveTempLine.getIntersections(mullianTempLine);
                if (intersect.length > 0) {
                    let minCurvePoint = curve.segment1.point;
                    let maxCurvePoint = curve.segment2.point;
                    if (curve.segment1.point.x > curve.segment2.point.x) {
                        minCurvePoint = curve.segment2.point;
                        maxCurvePoint = curve.segment1.point;
                    }
                    if (abrevationType == "mainFrame") {
                        if (sidePosition == "bottom") {
                            mullianPoints.push(round2decimal(maxCurvePoint.getDistance(intersect[0].point) + weldSizeExtraSize(angles[1])));
                        } else if (sidePosition == "top") {
                            mullianPoints.push(round2decimal(minCurvePoint.getDistance(intersect[0].point) + weldSizeExtraSize(angles[1])));
                        }
                    } else {
                        if (sidePosition == "bottom") {
                            mullianPoints.push(round2decimal(minCurvePoint.getDistance(intersect[0].point) + weldSizeExtraSize(angles[1])));
                        } else if (sidePosition == "top") {
                            mullianPoints.push(round2decimal(maxCurvePoint.getDistance(intersect[0].point) + weldSizeExtraSize(angles[1])));
                        }
                    }

                }
            } else { //hMullian
                let point1 = new state.paper.Point(mullian.bounds.leftCenter.x - profileWidth, mullian.bounds.centerY);
                let point2 = new state.paper.Point(mullian.bounds.rightCenter.x + profileWidth, mullian.bounds.centerY);
                mullianTempLine = new state.paper.Path.Line(point1, point2);
                let intersect = curveTempLine.getIntersections(mullianTempLine);
                if (intersect.length > 0) {
                    let minCurvePoint = curve.segment1.point;
                    let maxCurvePoint = curve.segment2.point;
                    if (curve.segment1.point.y > curve.segment2.point.y) {
                        minCurvePoint = curve.segment2.point;
                        maxCurvePoint = curve.segment1.point;
                    }
                    if (abrevationType == "mainFrame") {
                        if (sidePosition == "left") {
                            mullianPoints.push(round2decimal(maxCurvePoint.getDistance(intersect[0].point) + weldSizeExtraSize(angles[1])));
                        } else if (sidePosition == "right") {
                            mullianPoints.push(round2decimal(minCurvePoint.getDistance(intersect[0].point) + weldSizeExtraSize(angles[1])));
                        }
                    } else {
                        if (sidePosition == "left") {
                            mullianPoints.push(round2decimal(minCurvePoint.getDistance(intersect[0].point) + weldSizeExtraSize(angles[1])));
                        } else if (sidePosition == "right") {
                            mullianPoints.push(round2decimal(maxCurvePoint.getDistance(intersect[0].point) + weldSizeExtraSize(angles[1])));
                        }
                    }
                }
            }
            mullianTempLine.remove();
        });
        curveTempLine.remove();
        state.calculations[abrevationType][arg.id + '_' + index].mullianPoints = mullianPoints;
    }

    if (toRemove) {
        delete state.calculations["mainFrame"][arg.id + '_' + toRemove];
    }

    let middleOfHandles = false;
    if (handlePositions.length == 1) {
        middleOfHandles = new state.paper.Point(handlePositions[0]);
    } else if (handlePositions.length > 1) {
        middleOfHandles = new state.paper.Point(handlePositions[0]).add(new state.paper.Point(handlePositions[handlePositions.length - 1])).divide(2);
    }

    let middleOfHinges = false;
    if (hingePositions.length > 1) {
        middleOfHinges = new state.paper.Point(hingePositions[0]).add(new state.paper.Point(hingePositions[hingePositions.length - 1])).divide(2);
    }

    //find handle and hinges distance from flat curve to find position side
    for (let index = 0; index < frameFlat.curves.length; index++) {
        if (middleOfHandles) {
            handleFromFrame[index] = middleOfHandles.getDistance(frameFlat.curves[index].bounds.center);
        }
        if (middleOfHinges) {
            hingeFromFrame[index] = middleOfHinges.getDistance(frameFlat.curves[index].bounds.center);
        }
    }

    //find handle positions
    if (middleOfHandles) {
        let curveKey1 = Object.keys(handleFromFrame).reduce((key, v) => handleFromFrame[v] < handleFromFrame[key] ? v : key);
        state.calculations[abrevationType][arg.id + '_' + curveKey1].handle = [round2decimal(state.calculations[abrevationType][arg.id + '_' + curveKey1].length / 2)];
    }
    //find hinges positions
    if (middleOfHinges) {
        let newHingPosition = [];
        let curveKey2 = Object.keys(hingeFromFrame).reduce((key, v) => hingeFromFrame[v] < hingeFromFrame[key] ? v : key);
        let hingStat = state.calculations[abrevationType][arg.id + '_' + curveKey2].stat;
        let welddMove = weldSizeExtraSize(state.calculations[abrevationType][arg.id + '_' + curveKey2]['angles'][0]);
        for (let s = 0; s < hingePositions.length; s++) {
            if (hingStat == "Left") {
                newHingPosition.push(round2decimal(Math.abs(hingePositions[s][1] - arg.item.bounds.top) + welddMove));
            } else if (hingStat == "Bottom") {
                newHingPosition.push(round2decimal(Math.abs(hingePositions[s][0] - arg.item.bounds.left) + welddMove));
            } else if (hingStat == "Right") {
                newHingPosition.push(round2decimal(Math.abs(hingePositions[s][1] - arg.item.bounds.bottom) + welddMove));
            } else if (hingStat == "Top") {
                newHingPosition.push(round2decimal(Math.abs(hingePositions[s][0] - arg.item.bounds.right) + welddMove));
            }
        }
        state.calculations[abrevationType][arg.id + '_' + curveKey2].hinge = newHingPosition;
        //find hinge second side position on parent frames (mullian, windowFrame, doorFrame, mainframe)
        let items = state.paper.project.activeLayer.getItems({
            name: function (value) {
                return ['windowFrame', 'doorFrame', 'vMullian', 'hMullian', 'mainFrame'].includes(value);
            }
        });
        $.each(items, function (key, item) {
            if (arg.item.id !== item.id && item.hitTest(middleOfHinges)) {
                newHingPosition = [];
                if (['vMullian', 'hMullian'].includes(item.name)) {
                    if (!Array.isArray(state.calculations['mullian'][item.id]['hinge'])) {
                        state.calculations['mullian'][item.id]['hinge'] = [];
                    }
                    for (let s = 0; s < hingePositions.length; s++) {
                        if (item.name == "vMullian") {
                            newHingPosition.push(round2decimal(item.bounds.height - Math.abs(item.bounds.top - hingePositions[s][1])));
                            // if(arg.type.includes('left')){ //reverse hinge position for machine in this case
                            //     newHingPosition.push(round2decimal(item.bounds.height - Math.abs(item.bounds.top - hingePositions[s][1])));
                            // } else {
                            //     newHingPosition.push(round2decimal(Math.abs(item.bounds.top - hingePositions[s][1])));
                            // }
                        } else {
                            newHingPosition.push(round2decimal(Math.abs(hingePositions[s][0] - item.bounds.left)));
                        }
                    }
                    state.calculations['mullian'][item.id]['hinge'] = newHingPosition;
                } else if (['mainFrame'].includes(item.name)) {
                    let frameFlat = item.children[0] || null;
                    let hingeFromFrame = {};
                    let id = (item.name == "mainFrame") ? item.id : item.parent.id;
                    for (let index = 0; index < frameFlat.curves.length; index++) {
                        hingeFromFrame[index] = middleOfHinges.getDistance(frameFlat.curves[index].bounds.center);
                    }
                    let curveKey2 = Object.keys(hingeFromFrame).reduce((key, v) => hingeFromFrame[v] < hingeFromFrame[key] ? v : key);
                    let welddMove2 = weldSizeExtraSize(state.calculations[item.name][id + '_' + curveKey2]['angles'][0]);
                    let hingStat2 = state.calculations[item.name][id + '_' + curveKey2].stat;
                    if (!Array.isArray(state.calculations[item.name][id + '_' + curveKey2]['hinge'])) {
                        state.calculations[item.name][id + '_' + curveKey2]['hinge'] = [];
                    }
                    for (let s = 0; s < hingePositionsFirst.length; s++) {
                        if (hingStat2 == "Right") {
                            newHingPosition.push(round2decimal(Math.abs(hingePositionsFirst[s][1] - state.calculations[item.name][id + '_' + curveKey2].bounds.top) + welddMove2));
                        } else if (hingStat2 == "Top") {
                            newHingPosition.push(round2decimal(Math.abs(hingePositionsFirst[s][0] - state.calculations[item.name][id + '_' + curveKey2].bounds.left) + welddMove2));
                        } else if (hingStat2 == "Left") {
                            newHingPosition.push(round2decimal(Math.abs(hingePositionsFirst[s][1] - state.calculations[item.name][id + '_' + curveKey2].length - state.calculations[item.name][id + '_' + curveKey2].bounds.top) + welddMove2));
                        } else if (hingStat2 == "Bottom") {
                            newHingPosition.push(round2decimal(Math.abs(hingePositionsFirst[s][0] - state.calculations[item.name][id + '_' + curveKey2].length - state.calculations[item.name][id + '_' + curveKey2].bounds.left) + welddMove2));
                        }
                    }
                    state.calculations[item.name][id + '_' + curveKey2]['hinge'] = newHingPosition;
                } else if (['windowFrame', 'doorFrame'].includes(item.name)) {
                    let frameFlat = item.children[0] || null;
                    let hingeFromFrame = {};
                    let id = (item.name == "mainFrame") ? item.id : item.parent.id;
                    for (let index = 0; index < frameFlat.curves.length; index++) {
                        hingeFromFrame[index] = middleOfHinges.getDistance(frameFlat.curves[index].bounds.center);
                    }
                    let curveKey2 = Object.keys(hingeFromFrame).reduce((key, v) => hingeFromFrame[v] < hingeFromFrame[key] ? v : key);
                    let welddMove2 = weldSizeExtraSize(state.calculations[item.name][id + '_' + curveKey2]['angles'][0]);
                    let hingStat2 = state.calculations[item.name][id + '_' + curveKey2].stat;
                    if (!Array.isArray(state.calculations[item.name][id + '_' + curveKey2]['hinge'])) {
                        state.calculations[item.name][id + '_' + curveKey2]['hinge'] = [];
                    }
                    for (let s = 0; s < hingePositionsFirst.length; s++) {
                        if (hingStat2 == "Left") {
                            newHingPosition.push(round2decimal(Math.abs(hingePositionsFirst[s][1] - state.calculations[item.name][id + '_' + curveKey2].bounds.top) + welddMove2));
                        } else if (hingStat2 == "Bottom") {
                            newHingPosition.push(round2decimal(Math.abs(hingePositionsFirst[s][0] - state.calculations[item.name][id + '_' + curveKey2].bounds.left) + welddMove2));
                        } else if (hingStat2 == "Right") {
                            newHingPosition.push(round2decimal(Math.abs(hingePositionsFirst[s][1] - state.calculations[item.name][id + '_' + curveKey2].length - state.calculations[item.name][id + '_' + curveKey2].bounds.top) + welddMove2));
                        } else if (hingStat2 == "Top") {
                            newHingPosition.push(round2decimal(Math.abs(hingePositionsFirst[s][0] - state.calculations[item.name][id + '_' + curveKey2].length - state.calculations[item.name][id + '_' + curveKey2].bounds.left) + welddMove2));
                        }
                    }
                    state.calculations[item.name][id + '_' + curveKey2]['hinge'] = newHingPosition;
                }
            }
        });
    }
}