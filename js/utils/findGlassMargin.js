// src/utils/findGlassMargin.js
import state from '../core/state.js';
export function findGlassMargin(parentName = '') {

    if (!parentName) {
        parentName = '';
    }

    if (parentName.indexOf("window_") !== -1) {
        return Math.round(state.window_glass_space / 2);
    } else if (parentName.indexOf("door_") !== -1) {
        return Math.round(state.door_glass_space / 2);
    }

    return Math.round(state.frame_glass_space / 2);
}