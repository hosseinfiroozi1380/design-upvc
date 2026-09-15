// src/utils/layersLayout.js
import state from '../core/state.js';
import { LayersItemChildren } from './LayersItemChildren.js';
export function layersLayout() {
    if (!state.debug) return;
    let allItems = state.paper.project.activeLayer.getItems();
    let out = '<ul class="tree small">';
    $.each(allItems, function (key, item) {
        out +=
            '<li class="layersLi layer_' +
            item.id +
            '"><i class="ti ti-square-chevron-right fs-5"></i> ' +
            item.name +
            ' (' +
            item.id +
            ')</li>';
        if (item.hasChildren()) {
            out += LayersItemChildren(item);
        }
    });
    out += '</ul>';
    $('#layers').html(out);
}