// src/items/resetProfileDataTypeOfWindowDoorSubItems.js
import state from '../core/state.js';
export function resetProfileDataTypeOfWindowDoorSubItems(item) {
    if (
        item.name &&
        (
            item.name.indexOf('window_') !== -1 ||
            item.name.indexOf('door_') !== -1 ||
            item.name.indexOf('windowFrame') !== -1 ||
            item.name.indexOf('doorFrame') !== -1
        )
    ) {
        for (let j = 0; j < item.children.length; j++) {
            if (item.children[j].name && item.children[j].name.indexOf('Mullian') !== -1) {
                item.children[j].data.profile = state.firstMullian;
                item.children[j].data.profile_width = state.firstMullian_width;
            } else if (item.children[j].name && item.children[j].name.indexOf('Panel') !== -1) {
                item.children[j].data.profile = state.firstPanel;
                item.children[j].data.profile_width = state.firstPanel_width;
            } else if (item.children[j].name && item.children[j].name.indexOf('window_') !== -1) {
                item.children[j].data.profile = state.firstWindowSash;
                item.children[j].data.profile_width = state.firstWindowSash_width;
                resetProfileDataTypeOfWindowDoorSubItems(item.children[j])
            } else if (item.children[j].name && item.children[j].name.indexOf('door_') !== -1) {
                item.children[j].data.profile = state.firstDoorSash;
                item.children[j].data.profile_width = state.firstDoorSash_width;
                resetProfileDataTypeOfWindowDoorSubItems(item.children[j])
            } else if (item.children[j].name && item.children[j].name.indexOf('flat') !== -1 || item.children[j].name && item.children[j].name.indexOf('base') !== -1) {
                item.children[j].data.glazing = state.firstGlazing;
            } else if (item.children[j].name && item.children[j].name.indexOf('wframeInOut') !== -1) {
                item.children[j].data.glazing = state.firstGlazing;
            }
        }
    }
}