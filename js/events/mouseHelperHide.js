// src/events/mouseHelperHide.js
// import state from "../core/state.js";
// export function mouseHelperHide() {
//     if (state.deleteMode) {
//         return
//     }
//     $('.mouseHelper').html('');
//     $('.mouseHelper').hide('slow');
//     $('.mouseHelperBg').hide('slow');
// }

import state from "../core/state.js";
export function mouseHelperHide() {
    if (state.deleteMode) {
        return;
    }
    if (state.mouseHelperClone) {
        state.mouseHelperClone.remove();
        state.mouseHelperClone = null;
    }
    if (state.flatHover) {
        state.flatHover.remove();
        state.flatHover = null;
    }
    $('.mouseHelper').html('');
    $('.mouseHelper').hide('slow');
    $('.mouseHelperBg').hide('slow');
}