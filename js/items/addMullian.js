// src/items/addMullian.js
import state from '../core/state.js';
import { setDefaultData } from '../utils/setDefaultData.js';
import { createDimensionBar } from '../drawing/createDimensionBar.js';
import { enableSave } from '../services/enableSave.js';
import { showMessage } from '../utils/showMessage.js';
import { round2decimal } from '../utils/round2decimal.js';
import { updateLayerPreview } from "../utils/updateLayerPreview.js";
import { updateTempDesignSnapshot } from "../utils/updateTempDesignSnapshot.js";
import PaperOffset from "../utils/PaperOffset.js";

function createGlassBorders(glassShape, group) {
    const blackWidth = 1.5;
    const whiteWidth = 12;
    const innerBlackWidth = 1.5;
    const glassBorders = new state.paper.Group();
    glassBorders.name = "glassBorders";
    glassBorders.data.glassId = glassShape.id;
    const outerBlackInner = PaperOffset.offset(
        glassShape,
        -blackWidth
    );
    const outerBlack = glassShape.subtract(
        outerBlackInner
    );
    outerBlack.fillColor = "#222222";
    outerBlack.strokeColor = null;
    outerBlack.name = "glassOuterBlack";
    glassBorders.addChild(
        outerBlack
    );
    const whiteInner = PaperOffset.offset(
        outerBlackInner,
        -whiteWidth
    );
    const whiteBorder = outerBlackInner.subtract(
        whiteInner
    );
    whiteBorder.fillColor = "#ffffff";
    whiteBorder.strokeColor = null;
    whiteBorder.name = "glassWhiteBorder";
    glassBorders.addChild(
        whiteBorder
    );
    const outerBounds =
        outerBlackInner.bounds;
    const innerBounds =
        whiteInner.bounds;
    const cornerGroup =
        new state.paper.Group();
    cornerGroup.name =
        "glassCornerBisectors";
    const corners = [
        [
            [outerBounds.left, outerBounds.top],
            [innerBounds.left, innerBounds.top]
        ],
        [
            [outerBounds.right, outerBounds.top],
            [innerBounds.right, innerBounds.top]
        ],
        [
            [outerBounds.left, outerBounds.bottom],
            [innerBounds.left, innerBounds.bottom]
        ],
        [
            [outerBounds.right, outerBounds.bottom],
            [innerBounds.right, innerBounds.bottom]
        ]
    ];
    corners.forEach(points => {
        const line =
            new state.paper.Path.Line({
                from: points[0],
                to: points[1]
            });
        line.strokeColor = "#222222";
        line.strokeWidth = 1.5;
        line.strokeCap = "butt";
        line.name =
            "glassCornerBisector";
        cornerGroup.addChild(line);
    });
    glassBorders.addChild(
        cornerGroup
    );
    const innerBlackInner =
        PaperOffset.offset(
            whiteInner,
            -innerBlackWidth
        );
    const innerBlack =
        whiteInner.subtract(
            innerBlackInner
        );
    innerBlack.fillColor = "#222222";
    innerBlack.strokeColor = null;
    innerBlack.name =
        "glassInnerBlack";
    glassBorders.addChild(
        innerBlack
    );
    group.addChild(
        glassBorders
    );
    outerBlackInner.remove();
    whiteInner.remove();
    innerBlackInner.remove();
    return glassBorders;
}
export function addMullian(
    addNewItemType,
    flatToAdd,
    toAddPoint = false,
    toAddGroup = false,
    data = false,
    frameWidth = false
) {
    let mullianType = addNewItemType;
    let testframeSize =
        (frameWidth)
            ? frameWidth
            : state.firstMullian_width;
    testframeSize =
        (data)
            ? data.profile_width
            : testframeSize;
    if (!testframeSize) {
        showMessage(
            'بنظر می رسد این پروفیل شامل مولین نمی باشد. اگر این مورد اشتباه است به مدیریت جهت اصلاح اطلاع دهید.'
        );
        return;
    }
    state.frameSize =
        testframeSize;
    state.frameColor =
        state.unitData['profile_color_hex'];
    let stratPoint;
    let tempMullian;
    if (addNewItemType == 'vMullian') {
        if (toAddPoint) {
            stratPoint =
                new state.paper.Point(
                    round2decimal(
                        toAddPoint.x -
                        state.frameSize / 2
                    ),
                    flatToAdd.bounds.y
                );
        } else {
            stratPoint =
                new state.paper.Point(
                    round2decimal(
                        flatToAdd.bounds.x +
                        (
                            flatToAdd.width / 2
                        ) -
                        (
                            state.frameSize / 2
                        )
                    ),
                    flatToAdd.bounds.y
                );
        }
        tempMullian =
            new state.paper.Path.Rectangle(
                stratPoint,
                new state.paper.Size(
                    state.frameSize,
                    flatToAdd.bounds.height
                )
            );
        tempMullian.closed = true;
    } else {
        if (toAddPoint) {
            stratPoint =
                new state.paper.Point(
                    flatToAdd.bounds.x,
                    round2decimal(
                        toAddPoint.y -
                        state.frameSize / 2
                    )
                );
        } else {
            stratPoint =
                new state.paper.Point(
                    flatToAdd.bounds.x,
                    round2decimal(
                        flatToAdd.bounds.y +
                        (
                            flatToAdd.bounds.height / 2
                        ) -
                        (
                            state.frameSize / 2
                        )
                    )
                );
        }
        tempMullian =
            new state.paper.Path.Rectangle(
                stratPoint,
                new state.paper.Size(
                    flatToAdd.bounds.width,
                    state.frameSize
                )
            );
        tempMullian.closed = true;
    }
    // create mullian
    let mullian =
        flatToAdd.intersect(
            tempMullian
        );
    mullian.strokeColor =
        state.strokeColor;
    mullian.fillColor =
        state.frameColor;
    mullian.name =
        addNewItemType;
    setDefaultData(
        mullian,
        'mullian'
    );
    if (data) {
        mullian.data = data;
    }
    mullian.data.profile_width =
        state.frameSize;
    // create and split flat
    let tmpFlat =
        flatToAdd.subtract(
            tempMullian,
            {
                insert: false
            }
        );
    tempMullian.remove();
    if (
        tmpFlat.hasChildren() &&
        tmpFlat.children.length == 2
    ) {
        let flat1 =
            new state.paper.Path(
                tmpFlat.children[0].getPathData()
            );
        flat1.fillColor =
            flatToAdd.fillColor;
        flat1.strokeColor = null;
        flat1.name = 'flat';
        setDefaultData(
            flat1,
            'flat'
        );
        flat1.data.glass =
            flatToAdd.data.glass;
        flat1.data.glazing =
            flatToAdd.data.glazing;
        let flat2 =
            new state.paper.Path(
                tmpFlat.children[1].getPathData()
            );
        flat2.fillColor =
            flatToAdd.fillColor;
        flat2.strokeColor = null;
        flat2.name = 'flat';
        setDefaultData(
            flat2,
            'flat'
        );
        flat2.data.glass =
            flatToAdd.data.glass;
        flat2.data.glazing =
            flatToAdd.data.glazing;
        // حذف مرز قبلی شیشه
        if (state.mainSection) {
            const oldBorders =
                state.mainSection.getItems({
                    name: "glassBorders"
                });
            oldBorders.forEach(border => {
                if (
                    border.data &&
                    border.data.glassId ===
                    flatToAdd.id
                ) {
                    border.remove();
                }
            });
        }
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
            flat1
        );
        baseGroup.addChild(
            flat2
        );
        // create borders for new glass
        createGlassBorders(
            flat1,
            baseGroup
        );
        createGlassBorders(
            flat2,
            baseGroup
        );
        // mullian must be on top
        baseGroup.addChild(
            mullian
        );
        if (toAddGroup) {
            toAddGroup.addChild(
                baseGroup
            );
        }
        createDimensionBar();
    } else {
        mullian.remove();
        showMessage(
            "خطا در اضافه کردن مولین. لطفاً موقعیت دیگری را امتحان کنید.",
            "error"
        );
    }
    tmpFlat.remove();
    updateTempDesignSnapshot();
    updateLayerPreview();
    enableSave();
    return mullian;
}