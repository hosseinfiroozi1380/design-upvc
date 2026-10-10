import state from '../core/state.js';
export function saveHistory() {
    if (!state.paper?.project) {
        return;
    }
    const currentState = state.paper.project.exportJSON();
    if (
        state.history[state.history_index] === currentState
    ) {
        return;
    }
    state.history = state.history.slice(0, state.history_index + 1);
    state.history.push(currentState);
    if (state.history.length > 15) {
        state.history.shift();
    }
    state.history_index = state.history.length - 1;
    $('.undo').prop('disabled', state.history_index <= 0);
    $('.redo').prop('disabled', true);
}