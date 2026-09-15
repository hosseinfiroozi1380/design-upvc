// src/items/addRemoveBottomdoor.js

import state from "../core/state.js";
import { reDrawItem } from '../drawing/reDrawItem.js';

export function addRemoveBottomdoor(action, height = false) {

    if (action === "add" && Number(height) > 0) {

        state.selectedItem.data.bottomdoor = Number(height);

        reDrawItem(state.selectedItem);

    } else if (action === "remove") {

        state.selectedItem.data.bottomdoor = 0;

        reDrawItem(state.selectedItem);

    }

    $("#configMenuDropDown").trigger('click');
}