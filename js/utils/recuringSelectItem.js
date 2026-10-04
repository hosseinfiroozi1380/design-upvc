// src/utils/recuringSelectItem.js
import state from '../core/state.js';
// recuring selection on mouse down
export function recuringSelectItem(group, point) {
    if (
        ["mainFrame", "vPanel", "hPanel"]
            .includes(group.name)
    ) {
        state.selectedItem = group;
    } else {
        for (
            let index = 0;
            index < group.children.length;
            index++
        ) {
            let item = group.children[index];
            if (
                item.hitTest(point) &&
                item.name !== "base"
            ) {
                if (
                    [
                        "windowFrame",
                        "doorFrame",
                        "vPanel",
                        "hPanel"
                    ].includes(item.name)
                ) {
                    state.selectedItem = item;
                    break;
                } else {
                    if (item.hasChildren()) {
                        recuringSelectItem(
                            item,
                            point
                        );
                        if (state.selectedItem) {
                            break;
                        }
                    } else {
                        state.selectedItem = item;
                        if (
                            ["vMullian", "hMullian"]
                                .includes(item.name)
                        ) {
                            state.previousSelectedItem = item;
                        }
                        break;
                    }
                }
            }
        }
    }
}