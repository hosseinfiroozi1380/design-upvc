// src/utils/getBaseGroupItems.js
import state from '../core/state.js';
export function getBaseGroupItems(baseGroup) {
    if (baseGroup) {
        $.each(baseGroup.children, function (key1, item) {
            if (['vMullian', 'hMullian'].includes(item.name)) {
                state.mulliansToRedraw.push(item);
            } else if (
                item.name &&
                (
                    item.name.indexOf("window_") !== -1 ||
                    item.name.indexOf("door_") !== -1 ||
                    item.name.indexOf("Panel") !== -1
                )
            ) {
                state.othersToRedraw.push(item);
            } else if (item.name == "baseGroup") {
                getBaseGroupItems(item);
            }
        });
    }
}