// src/geometry/angleTwoPoint.js
export function angleTwoPoint(point1, point2) {
    let deltaY = point2.y - point1.y;
    let deltaX = point2.x - point1.x;
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI); // Convert to degrees;
    if (angle < 0) {
        angle += 360;
    }
    return angle;
}