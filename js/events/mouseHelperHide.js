// src/events/mouseHelperHide.js
import state from "../core/state.js";
export function mouseHelperHide() {
    if (state.deleteMode) {
        return
    }
    $('.mouseHelper').html('');
    $('.mouseHelper').hide('slow');
    $('.mouseHelperBg').hide('slow');
}