// src/geometry/getCenterPoint.js

export function getCenterPoint(e, outPoint, offset) {

    outPoint.x = e.center.x - offset.x;

    outPoint.y = e.center.y - offset.y;

    return outPoint;

}