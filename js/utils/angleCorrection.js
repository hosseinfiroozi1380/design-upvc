// src/utils/angleCorrection.js
import { round2decimal } from "./round2decimal.js";
export function angleCorrection(angle = 0) {
    angle = round2decimal(Math.abs(angle));
    // if(angle > 90){
    //     angle = 180 - angle;
    // }
    if (angle == 0 || angle == 180) {
        angle = 90;
    }
    return angle;
}