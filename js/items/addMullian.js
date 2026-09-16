// src/items/addMullian.js
import state from '../core/state.js';
import { setDefaultData } from '../utils/setDefaultData.js';
import { createDimensionBar } from '../drawing/createDimensionBar.js';
import { enableSave } from '../services/enableSave.js';
import { showMessage } from '../utils/showMessage.js';
import { round2decimal } from '../utils/round2decimal.js';
import { updateLayerPreview } from "../utils/updateLayerPreview.js";
import { updateTempDesignSnapshot } from "../utils/updateTempDesignSnapshot.js";
// add mullian function
export function addMullian(addNewItemType, flatToAdd, toAddPoint = false, toAddGroup = false, data = false, frameWidth = false) { //data = mullian data
    let mullianType = addNewItemType;
    let testframeSize = (frameWidth) ? frameWidth : state.firstMullian_width;
    testframeSize = (data) ? data.profile_width : testframeSize;
    if (!testframeSize) {
        showMessage('بنظر می رسد این پروفیل شامل مولین نمی باشد. اگر این مورد اشتباه است به مدیریت جهت اصلاح اطلاع دهید.');
        return;
    }
    state.frameSize = testframeSize;
    state.frameColor = state.unitData['profile_color_hex'];
    let stratPoint, tempMullian;
    if (addNewItemType == 'vMullian') {
        if (toAddPoint) {
            stratPoint = new state.paper.Point(
                round2decimal(toAddPoint.x - state.frameSize / 2),
                flatToAdd.bounds.y
            )
        } else {
            stratPoint = new state.paper.Point(
                round2decimal(flatToAdd.bounds.x + (flatToAdd.width / 2) - (state.frameSize / 2)),
                flatToAdd.bounds.y
            )
        }
        //create tempMullian
        tempMullian = new state.paper.Path.Rectangle(
            stratPoint,
            new state.paper.Size(state.frameSize, flatToAdd.bounds.height)
        );
        tempMullian.closed = true;
    } else {
        if (toAddPoint) {
            stratPoint = new state.paper.Point(
                flatToAdd.bounds.x,
                round2decimal(toAddPoint.y - state.frameSize / 2)
            )
        } else {
            stratPoint = new state.paper.Point(
                flatToAdd.bounds.x,
                round2decimal(flatToAdd.bounds.y + (flatToAdd.bounds.height / 2) - (state.frameSize / 2))
            )
        }
        //create tempMullian
        tempMullian = new state.paper.Path.Rectangle(
            stratPoint,
            new state.paper.Size(flatToAdd.bounds.width, state.frameSize)
        );
        tempMullian.closed = true;
    }
    console.log("PAPER TEST", state.paper);
    console.log("PATH", state.paper.Path);
    console.log("POINT", state.paper.Point);
    //create mullian
    let mullian = flatToAdd.intersect(tempMullian);
    mullian.strokeColor = state.strokeColor;
    mullian.fillColor = state.frameColor;
    let tween = mullian.tweenTo({
        fillColor: state.tweenFillColor
    }, 250);
    tween.then(function () {
        mullian.tweenTo({
            fillColor: state.frameColor
        }, 250);
    });
    // mullian.name = mullianType;
    mullian.name = addNewItemType;
    setDefaultData(mullian, 'mullian');
    if (data) {
        mullian.data = data;
    }
    mullian.data.profile_width = state.frameSize;
    //create and spilit flat
    let tmpFlat = flatToAdd.subtract(tempMullian, {
        insert: false
    });
    tempMullian.remove();
    if (tmpFlat.hasChildren() && tmpFlat.children.length == 2) {
        let flat1 = new state.paper.Path(tmpFlat.children[0].getPathData());
        flat1.fillColor = flatToAdd.fillColor;
        flat1.name = 'flat';
        setDefaultData(flat1, 'flat');
        flat1.data.glass = flatToAdd.data.glass;
        flat1.data.glazing = flatToAdd.data.glazing;
        let flat2 = new state.paper.Path(tmpFlat.children[1].getPathData());
        flat2.fillColor = flatToAdd.fillColor;
        flat2.name = 'flat';
        setDefaultData(flat2, 'flat');
        flat2.data.glass = flatToAdd.data.glass;
        flat2.data.glazing = flatToAdd.data.glazing;
        flatToAdd.name = "base";
        let baseGroup = new state.paper.Group();
        baseGroup.name = "baseGroup";
        baseGroup.addChild(flatToAdd);
        baseGroup.addChild(mullian);
        baseGroup.addChild(flat1);
        baseGroup.addChild(flat2);
        if (toAddGroup) toAddGroup.addChild(baseGroup);
        createDimensionBar();
    } else {
        mullian.remove();
        showMessage('خطا در اضافه کردن مولین. لطفا موقعیت دیگری را امتحان کنید')
    }
    tmpFlat.remove();
    updateTempDesignSnapshot();
    updateLayerPreview();
    enableSave();
    return mullian;
}