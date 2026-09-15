// src/utils/hideGLs.js
import state from '../core/state.js';
import { mouseHelperHide } from "../events/mouseHelperHide.js";

export function hideGLs() {

    if (state.glG) {
        state.glG.visible = false;
    }

    state.selectedItem = false;

    if (state.paper && state.paper.project) {
        state.paper.project.activeLayer.selected = false;
    }

    if (state.flatHover) {
        state.flatHover.remove();
        state.flatHover = false;
    }

    if (state.mouseHelperClone) {
        state.mouseHelperClone.remove();
        state.mouseHelperClone = false;
    }

    mouseHelperHide();

}

// export function hideGLs() {
//     state.glG.visible = false;
//     state.selectedItem = false;
//     state.paper.project.activeLayer.selected = false;
//     if (state.flatHover) {
//         state.flatHover.remove();
//     }
//     if (state.mouseHelperClone) {
//         state.mouseHelperClone.remove();
//     }
//     mouseHelperHide();
// }