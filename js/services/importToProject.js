// src/services/importToProject.js
import state from "../core/state.js";
import {
    COLORS
} from "../config/constants.js";
import { createGLs } 
from "../drawing/createGLs.js";
import { createDimensionBar } 
from "../drawing/createDimensionBar.js";
import { setZoom } 
from "../events/setZoom.js";
import { updateLayerDetailsMenuOptions } 
from "../utils/updateLayerDetailsMenuOptions.js";
import { filterAutomateCreationBtns } 
from "../utils/filterAutomateCreationBtns.js";
import { set3D } 
from "../utils/set3D.js";
import { showMessage } 
from "../utils/showMessage.js";
// Import project
export function importToProject(importCode) {
    if (importCode !== "" && importCode !== "[]" && importCode !== '[["Layer",{"applyMatrix":true}]]') {
        state.paper.project.clear();
        state.paper.project.importJSON(importCode);
        state.paper.project.view.update();
        state.mainSection = state.paper.project.activeLayer.getItem({
            name: "section"
        });
        state.mainFrame = state.paper.project.activeLayer.getItem({
            name: "mainFrame"
        });
        state.mainFlat = state.paper.project.activeLayer.getItem({
            name: "mainFlat"
        });
        if (state.mainFrame && state.mainFlat) {
            state.extra_frame_lenght = parseFloat($('.frameInput option[value="' + state.mainFrame.data.profile + '"]').data('extra_frame_lenght') || 0);
            updateLayerDetailsMenuOptions();
            createGLs();
            createDimensionBar();
            setZoom();
            let glassColor = $('.glassInput option[value=' + state.unitData.glass_id + ']').data('color');
            state.flatColor = new state.paper.Color(glassColor);
            $('.layerName').val(state.unitData['name']);
            $('.location').val(state.unitData['location']);
            $('.layerQuantity').val(state.unitData['quantity']);
            $('#pattern_id').val(state.unitData['pattern_id']);
            state.defaultOverlap = (state.unitData['system'] == "Al") ? 6 : 8;
            state.mullianExtend = (state.unitData['system'] == "Al") ? 0 : 3;
            filterAutomateCreationBtns();
            set3D();
            if (!$('#glassBox').hasClass('closed')) {
                $('#glassBox').addClass('closed');
                $('#toggleIcon').html('<i class="ti ti-chevron-left"></i>');
            }
        } else {
            state.paper.project.clear();
            showMessage('خطا در ایمپورت اطلاعات');
        }
    }
}