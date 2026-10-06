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
    state.panelSize = (data)
        ? data.profile_width
        : state.firstPanel_width;
    if (!state.panelSize) {
        showMessage(
            'بنظر می رسد این پروفیل شامل پنل نمی باشد. اگر این مورد اشتباه است به مدیریت جهت اصلاح اطلاع دهید.'
        );
        return;
    }
    // مرز شیشه مربوط به همین flat را پیدا می‌کنیم
    let glassBorders = null;
    if (state.mainSection) {
        glassBorders =
            state.mainSection.children.find(
                item =>
                    item.name === "glassBorders" &&
                    item.data &&
                    item.data.glassId === flatToAdd.id
            );
    }
    let panelGroup =
        new state.paper.Group();
    panelGroup.name =
        addNewItemType;
    setDefaultData(
        panelGroup,
        'panel'
    );
    if (data) {
        panelGroup.data = data;
    }
    panelGroup.data.profile_width =
        state.panelSize;
    // panelBase
    let panelBase =
        flatToAdd.clone();
    panelBase.name =
        "panelBase";
    panelBase.fillColor =
        state.panelColor;
    panelGroup.addChild(
        panelBase
    );
    // panel margin
    // محدوده پنل دقیقاً برابر با محدوده شیشه است
    // پیدا کردن خود شیشه
    let glassFlat = null;
    if (flatToAdd.name === "flat") {
        glassFlat = flatToAdd;
    } else if (flatToAdd.parent) {
        glassFlat = flatToAdd.parent.getItem({
            name: "flat"
        });
    }
    if (!glassFlat) {
        glassFlat = state.paper.project.activeLayer.getItem({
            name: "flat"
        });
    }
    if (!glassFlat) {
        showMessage(
            "مرز شیشه پیدا نشد."
        );
        return;
    }
    let panelFlat = glassFlat.clone();
    panelFlat.name = "panelArea";
    if (addNewItemType == 'vPanel') {
        const glassBounds =
            panelFlat.bounds;
        const startX =
            glassBounds.left;
        const endX =
            glassBounds.right;
        for (
            let index = startX;
            index < endX;
            index += state.panelSize
        ) {
            const nextX =
                Math.min(
                    index + state.panelSize,
                    endX
                );
            const tempPanelItem =
                new state.paper.Path.Rectangle({
                    from: new state.paper.Point(
                        index,
                        glassBounds.top
                    ),
                    to: new state.paper.Point(
                        nextX,
                        glassBounds.bottom
                    )
                });
            const panelItem =
                panelFlat.intersect(
                    tempPanelItem
                );
            if (
                panelItem &&
                !panelItem.isEmpty()
            ) {
                panelItem.strokeColor =
                    state.strokeColor;
                panelItem.fillColor =
                    state.panelColor;
                panelItem.name =
                    "panelItem";
                panelItem.data.profile_width =
                    state.panelSize;
                panelGroup.addChild(
                    panelItem
                );
            }
            tempPanelItem.remove();
        }
    } else if (addNewItemType == 'hPanel') {
        const glassBounds =
            panelFlat.bounds;
        const startY =
            glassBounds.top;
        const endY =
            glassBounds.bottom;
        for (
            let index = startY;
            index < endY;
            index += state.panelSize
        ) {
            const nextY =
                Math.min(
                    index + state.panelSize,
                    endY
                );
            const tempPanelItem =
                new state.paper.Path.Rectangle({
                    from: new state.paper.Point(
                        glassBounds.left,
                        index
                    ),
                    to: new state.paper.Point(
                        glassBounds.right,
                        nextY
                    )
                });
            const panelItem =
                panelFlat.intersect(
                    tempPanelItem
                );
            if (
                panelItem &&
                !panelItem.isEmpty()
            ) {
                panelItem.strokeColor =
                    state.strokeColor;
                panelItem.fillColor =
                    state.panelColor;
                panelItem.name =
                    "panelItem";
                panelItem.data.profile_width =
                    state.panelSize;
                panelGroup.addChild(
                    panelItem
                );
            }
            tempPanelItem.remove();
        }
    }
    panelFlat.remove();
    flatToAdd.name =
        "base";
    let baseGroup =
        new state.paper.Group();
    baseGroup.name =
        "baseGroup";
    baseGroup.addChild(
        flatToAdd
    );
    baseGroup.addChild(
        panelGroup
    );
    if (toAddGroup) {
        toAddGroup.addChild(
            baseGroup
        );
    }
    // مرز شیشه و چهار نیم‌ساز گوشه‌ای
    // همیشه روی پنل باقی بمانند
    if (glassBorders) {
        glassBorders.bringToFront();
    }
    enableSave();
    updateTempDesignSnapshot();
    updateLayerPreview();
    return panelGroup;
}