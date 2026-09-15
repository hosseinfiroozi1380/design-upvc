// src/utils/findSidePositionByAngle.js
export function findSidePositionByAngle(angle = false) { //360deg angle
    //      90(Top)
    //0(Right)     180(Left)
    //      270(bottom)
    let side = false;
    if (angle >= 135 && angle < 225) {
        side = "right";
    } else if ((angle >= 315 && angle <= 360) || (angle >= '0' && angle < 45)) {
        side = "left";
    } else if (angle >= 45 && angle < 135) {
        side = "top";
    } else if (angle >= 225 && angle < 315) {
        side = "bottom";
    }
    return side;
}