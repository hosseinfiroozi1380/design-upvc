// src/utils/LayersItemChildren.js
import state from "../core/state.js";
export function LayersItemChildren(item) {
    let out2 = '<ul style="padding-left: 1rem">';
    $.each(item.children, function (key, item) {
        if (state.debug) {
            out2 +=
                '<li class="layersLi layer_' +
                item.id +
                '"><i class="ti ti-square-chevron-right fs-5"></i> ' +
                item.name +
                ' (' +
                item.id +
                ')</li>';
            if (item.hasChildren()) {
                out2 += LayersItemChildren(item);
            }
        }
    });
    out2 += '</ul>';
    return out2;
}