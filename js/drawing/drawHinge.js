// src/drawing/drawHinge.js

import state from "../core/state.js";

import {
    windowHingSize,
    doorHingSize
} from "../config/constants.js";

// draw hinge for window and door
export function drawHinge(
    type,
    centerPoint,
    rotation,
    itemGroup
) {

    let hingeSize = (type === "window")
        ? windowHingSize
        : doorHingSize;

    const width = hingeSize.width;
    const totalHeight = hingeSize.height;

    // اندازه دو قسمت
    const partHeight = totalHeight / 2;

    // مستطیل بالا
    let Hinge = new state.paper.Path.Rectangle(
        new state.paper.Rectangle(
            centerPoint.x - width / 2,
            centerPoint.y - totalHeight / 2,
            width,
            partHeight
        ),
        [6, 6]
    );

    Hinge.rotate(rotation, centerPoint);
    Hinge.strokeColor = new state.paper.Color("#999999");
    Hinge.fillColor = new state.paper.Color("#dddddd");
    Hinge.name = "hingeTop";
    itemGroup.addChild(Hinge);

    // مستطیل پایین
    Hinge = new state.paper.Path.Rectangle(
        new state.paper.Rectangle(
            centerPoint.x - width / 2,
            centerPoint.y,
            width,
            partHeight
        ),
        [6, 6]
    );

    Hinge.rotate(rotation, centerPoint);
    Hinge.strokeColor = new state.paper.Color("#999999");
    Hinge.fillColor = new state.paper.Color("#dddddd");
    Hinge.name = "hingeBottom";
    itemGroup.addChild(Hinge);
}