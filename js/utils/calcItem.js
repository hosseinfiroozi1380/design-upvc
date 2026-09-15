// src/utils/calcItem.js
import state from '../core/state.js';
import { angleCorrection } from "./angleCorrection.js";
import { round2decimal } from './round2decimal.js';
import { findGlassMargin } from "./findGlassMargin.js";
import { findSidePositionByAngle } from "./findSidePositionByAngle.js";
import { angleTwoPoint } from "../geometry/angleTwoPoint.js";
import { waterSlut } from "../utils/waterSlut.js";

export function calcItem(arg) { //arg{id, item, type, parent}
    let abrevationType = '';
    let angles = {};
    let sides = {};
    let dimensions = {};
    let angles_glazing = {};
    let sides_glazing = {};
    let dimensions_glazing = {};
    let mullianPoints = [];
    let mullianPointsSides = [];
    let hingePointsSide = '';
    let waterSluts = [];
    let stat;
    if (arg.item) {
        if (arg.type == "flat") { //Flat => minus offset flat to new paper.Size for glass margin
            state.glassMarginInsideProfile = findGlassMargin(arg.item.parent.name);
            let newItem = PaperOffset.offset(
                arg.item,
                -state.glassMarginInsideProfile
            );
            for (let i = 0; i < newItem.curves.length; i++) {
                angles[i] = angleCorrection(180 - round2decimal(newItem.curves[i].getTangentAt(0.001, true).getAngle(newItem.curves[i].previous.getTangentAt(0.999, true))));
                sides[i] = round2decimal(newItem.curves[i].length);
            }
            dimensions = {
                width: round2decimal(newItem.bounds.width),
                height: round2decimal(newItem.bounds.height)
            };
            newItem.remove();
            //clac glazing
            for (let i = 0; i < arg.item.curves.length; i++) {
                let ni = 180 - round2decimal(arg.item.curves[i].getTangentAt(0.001, true).getAngle(arg.item.curves[i].previous.getTangentAt(0.999, true)));
                angles_glazing[i] = (state.unitData.system == "Al") ? 90 : angleCorrection(round2decimal(ni / 2));
                let sidePosition = findSidePositionByAngle(angleTwoPoint(arg.item.curves[i].segment1.point, arg.item.curves[i].segment2.point));
                sides_glazing[i] = round2decimal(arg.item.curves[i].length);
                if (state.unitData.system == "Al") {
                    // let glazingID = arg.item.data.glazing;
                    // let dataWidth = $(`select.glazingInput option[value="${glazingID}"]`).data('width');
                    // let glWidth = (['top', 'bottom'].includes(sidePosition)) ? dataWidth : 0;
                    let dataWidth = 22 * 2;
                    let glWidth = (['top', 'bottom'].includes(sidePosition)) ? dataWidth : 0;
                    sides_glazing[i] = round2decimal(arg.item.curves[i].length - glWidth);
                }
            }
            dimensions_glazing = {
                width: round2decimal(arg.item.bounds.width),
                height: round2decimal(arg.item.bounds.height)
            };
        } else if (arg.type == "lace") { //Lace => extend flat to new paper.Size
            let newItem = PaperOffset.offset(arg.item, state.laceOverlap);
            angles = [90, 90];
            dimensions = {
                width: round2decimal(newItem.bounds.width),
                height: round2decimal(newItem.bounds.height)
            };
            newItem.remove();
        } else {
            if (arg.type == "vMullian" && arg.item.bounds.width == 2) { //slide mullian and should be ignored
                return
            }
            let extraLength = 0;
            if (arg.type == "vMullian" || arg.type == "hMullian") {
                extraLength = 2 * state.mullianExtend;
                if (typeof arg.item.data.overhung !== -1 && arg.item.data.overhung == 1) {
                    extraLength -= state.overHungMinusLenght;
                }
            }
            if (arg.type == "vMullian") {
                angles[0] = angleCorrection(180 - round2decimal(arg.item.curves[2].getTangentAt(0.001, true).getAngle(arg.item.curves[2].previous.getTangentAt(0.999, true))));
                angles[1] = angleCorrection(180 - round2decimal(arg.item.curves[1].getTangentAt(0.001, true).getAngle(arg.item.curves[1].previous.getTangentAt(0.999, true))));
            } else if (arg.type == "hMullian") {
                angles[0] = angleCorrection(180 - round2decimal(arg.item.curves[0].getTangentAt(0.001, true).getAngle(arg.item.curves[0].previous.getTangentAt(0.999, true))));
                angles[1] = angleCorrection(180 - round2decimal(arg.item.curves[3].getTangentAt(0.001, true).getAngle(arg.item.curves[3].previous.getTangentAt(0.999, true))));
            }

            for (let i = 0; i < arg.item.curves.length; i++) {
                sides[i] = round2decimal(arg.item.curves[i].length + extraLength);
            }
            dimensions = {
                width: round2decimal(arg.item.bounds.width) + extraLength,
                height: round2decimal(arg.item.bounds.height) + extraLength
            };

            waterSluts = [];
            if (arg.type == "vMullian") {
                stat = 'Vertical';
            } else {
                stat = 'Horizontal';
                waterSluts = waterSlut(arg.item, 'hMullian');
            }

            //find mullians installation side on frames for connection position
            let mullians = state.paper.project.activeLayer.getItems({
                name: function (value) {
                    return ['vMullian', 'hMullian'].includes(value);
                }
            });

            $.each(mullians, function (key, mullian) {
                let intersection = arg.item.getIntersections(mullian);
                if (intersection.length > 1) {
                    if (arg.item.name == "hMullian") { //hMullian
                        let distance = Math.abs(intersection[0].point.x - intersection[1].point.x);
                        if (distance > 1) {
                            let position = round2decimal(Math.abs(mullian.bounds.topLeft.x - arg.item.bounds.topLeft.x) + distance / 2);
                            mullianPoints.push(position);
                            if (arg.item.bounds.topLeft.y > mullian.bounds.topLeft.y) {
                                mullianPointsSides.push('up');
                            } else {
                                mullianPointsSides.push('down');
                            }
                        }
                    } else if (arg.item.name == "vMullian") { //vMullian
                        let distance = Math.abs(intersection[0].point.y - intersection[1].point.y);
                        if (distance > 1) {
                            let position = round2decimal(Math.abs(mullian.bounds.bottomLeft.y - arg.item.bounds.bottomLeft.y) + distance / 2);
                            mullianPoints.push(position);
                            if (arg.item.bounds.topLeft.x > mullian.bounds.topLeft.x) {
                                mullianPointsSides.push('up');
                            } else {
                                mullianPointsSides.push('down');
                            }
                        }
                    }
                }
            });

            //find window/door installation side on frames for connection position
            let windoors = state.paper.project.activeLayer.getItems({
                name: function (value) {
                    return value && (value.indexOf("windowFrame") !== -1 || value.indexOf("doorFrame") !== -1);
                }
            });

            $.each(windoors, function (key, windoor) {
                let intersection = arg.item.getIntersections(windoor);
                if (intersection.length > 1) {
                    if (arg.item.name == "hMullian") { //hMullian
                        if (windoor.bounds.centerY < arg.item.bounds.centerY) {
                            hingePointsSide = 'up';
                        } else {
                            hingePointsSide = 'down';
                        }
                    } else if (arg.item.name == "vMullian") { //vMullian
                        if (windoor.bounds.centerX < arg.item.bounds.centerX) {
                            hingePointsSide = 'up';
                        } else {
                            hingePointsSide = 'down';
                        }
                    }
                }
            });

        }

        if (arg.type == "vMullian" || arg.type == "hMullian") {
            abrevationType = "mullian";
        } else if (arg.type == "vCoupling" || arg.type == "hCoupling") {
            abrevationType = "coupling";
        } else {
            abrevationType = arg.type;
        }

        state.calculations[abrevationType][arg.id] = {
            id: arg.id,
            type: arg.type,
            sides: sides,
            bounds: {
                top: round2decimal(arg.item.bounds.top),
                left: round2decimal(arg.item.bounds.left),
                width: round2decimal(dimensions.width),
                height: round2decimal(dimensions.height)
            },
            length: Math.max(...Object.values(sides)),
            angles: angles,
            components: ((abrevationType == "panel") ? arg.item.parent.data : arg.item.data),
            mullianPoints: mullianPoints,
            mullianPointsSides: mullianPointsSides,
            hingePointsSide: hingePointsSide,
            waterSluts: waterSluts,
            parent: arg.parent,
            stat: stat,
            path: arg.item.getPathData(),
        }
        if (arg.type == "flat") {
            arg.item.data['profile'] = arg.item.data['glazing'];
            state.calculations["glazing"][arg.id] = {
                // id: arg.item.data.glazing,
                id: arg.id,
                type: "glazing",
                sides: sides_glazing,
                //length: Math.max(...Object.values(sides_glazing)),
                angles: angles_glazing,
                components: arg.item.data,
                //parent: arg.parent,
                //path: arg.item.getPathData()
            }
        }
    }
}