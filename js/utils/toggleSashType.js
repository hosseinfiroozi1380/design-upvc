// src/utils/toggleSashType.js
import state from '../core/state.js';
import { showMessage } from './showMessage.js';
import { reDrawItem } from '../drawing/reDrawItem.js';
export function toggleSashType() {
    if (!state.selectedItem || !["windowFrame", "doorFrame"].includes(state.selectedItem.name)) {
        showMessage('لطفا ابتدا فریم یک بازشو را انتخاب نمایید');
        return;
    }
    if (state.selectedItem.parent.name.indexOf('left') !== -1) {
        state.selectedItem.parent.name = state.selectedItem.parent.name.replace('left', 'right');
    } else if (state.selectedItem.parent.name.indexOf('right') !== -1) {
        state.selectedItem.parent.name = state.selectedItem.parent.name.replace('right', 'left');
    }
    reDrawItem(state.selectedItem);
    state.selectedItem = false;
}