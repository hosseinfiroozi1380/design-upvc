// src/utils/foundHingeCount.js
export function foundHingeCount(length) {
    let out = 2;
    if (length >= 1000) {
        out = 3;
    }
    if (length >= 1700) {
        out = 4;
    }
    if (length >= 2100) {
        out = 5;
    }
    return out;
}