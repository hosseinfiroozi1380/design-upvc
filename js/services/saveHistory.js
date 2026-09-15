// src/services/saveHistory.js
import state from '../core/state.js';
//save Undo Redo record
export function saveHistory() {
    if (state.history.length >= 15) {
        state.history.shift();
    }
    state.history.push(state.paper.project.exportJSON());
    state.history_index = state.history.length - 1;
    $('.redo').prop('disabled', true);
    $('.undo').prop('disabled', false);
}