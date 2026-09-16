// src/items/addPanel.js
import state from '../core/state.js';
import PaperOffset from '../utils/PaperOffset.js';
import { findGlassMargin } from '../utils/findGlassMargin.js';
import { setDefaultData } from '../utils/setDefaultData.js';
import { showMessage } from '../utils/showMessage.js';
import { enableSave } from '../services/enableSave.js';
import { updateLayerPreview } from "../utils/updateLayerPreview.js";
import { updateTempDesignSnapshot } from "../utils/updateTempDesignSnapshot.js";
// add Panel
export function addPanel(addNewItemType, flatToAdd, toAddGroup = false, data = false) {
    state.panelColor = state.unitData['profile_color_hex'];
    state.panelSize = (data) ? data.profile_width : state.firstPanel_width;
    if (!state.panelSize) {
        showMessage('بنظر می رسد این پروفیل شامل پنل نمی باشد. اگر این مورد اشتباه است به مدیریت جهت اصلاح اطلاع دهید.');
        return;
    }
    let panelGroup = new state.paper.Group();
    panelGroup.name = addNewItemType;
    setDefaultData(panelGroup, 'panel');
    if (data) {
        panelGroup.data = data;
    }
    panelGroup.data.profile_width = state.panelSize;
    //panelBase
    let panelBase = flatToAdd.clone();
    panelBase.name = "panelBase";
    panelBase.fillColor = state.panelColor;
    panelGroup.addChild(panelBase);
    //panel margin
    state.glassMarginInsideProfile = findGlassMargin(flatToAdd.parent.name);
    let panelFlat = PaperOffset.offset(
        flatToAdd,
        -state.glassMarginInsideProfile
    );
    if (addNewItemType == 'vPanel') {
        let fromPosition = panelFlat.bounds.topLeft;
        let toPosition = panelFlat.bounds.topRight;
        for (let index = fromPosition.x; index < toPosition.x; index += state.panelSize) {
            let tempPanelItem = new state.paper.Path.Rectangle(
                new state.paper.Point(index, fromPosition.y),
                new state.paper.Size(state.panelSize, panelFlat.bounds.height)
            );
            let panelItem = panelFlat.intersect(tempPanelItem);
            panelItem.strokeColor = state.strokeColor;
            panelItem.fillColor = state.panelColor;
            panelItem.name = "panelItem";
            panelItem.data.profile_width = state.panelSize;
            panelGroup.addChild(panelItem);
            tempPanelItem.remove();
        }
    } else if (state.addNewItemType == 'hPanel') {
        let fromPosition = panelFlat.bounds.topLeft;
        let toPosition = panelFlat.bounds.bottomLeft;
        for (let index = fromPosition.y; index < toPosition.y; index += state.panelSize) {
            let tempPanelItem = new state.paper.Path.Rectangle(
                new state.paper.Point(fromPosition.x, index),
                new state.paper.Size(panelFlat.bounds.width, state.panelSize)
            );
            let panelItem = panelFlat.intersect(tempPanelItem);
            panelItem.strokeColor = state.strokeColor;
            panelItem.fillColor = state.panelColor;
            panelItem.name = "panelItem";
            panelItem.data.profile_width = state.panelSize;
            panelGroup.addChild(panelItem);
            tempPanelItem.remove();
        }
    }
    panelFlat.remove();

    flatToAdd.name = "base";

    let baseGroup = new state.paper.Group();
    baseGroup.name = "baseGroup";

    baseGroup.addChild(flatToAdd);
    baseGroup.addChild(panelGroup);

    if (toAddGroup) {
        toAddGroup.addChild(baseGroup);
    }

    enableSave();
    updateTempDesignSnapshot();
    updateLayerPreview();

    return panelGroup;
}