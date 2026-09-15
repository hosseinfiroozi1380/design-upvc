// src/utils/round2decimal.js
export function round2decimal(num) {
    if (num > 0) {
        return Math.round(num * 100) / 100;
    } else {
        return num;
    }
}