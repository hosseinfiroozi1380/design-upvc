// src/items/removeCornic.js

import state from "../core/state.js";
import { enableSave } from '../services/enableSave.js';

// Remove Cornic

export function removeCornic() {

    let cornic = state.paper.project.activeLayer.getItem({
        name: "cornic"
    });

    if (cornic) {

        cornic.remove();

        $('#cornic_top').prop('checked', false);
        $('#cornic_right').prop('checked', false);
        $('#cornic_bottom').prop('checked', false);
        $('#cornic_left').prop('checked', false);

        let mainFrame = state.paper.project.activeLayer.getItem({
            name: "mainFrame"
        });

        if (mainFrame) {
            mainFrame.data.cornic = 0;
        }

        enableSave();

        return true;

    } else {

        return false;

    }
}