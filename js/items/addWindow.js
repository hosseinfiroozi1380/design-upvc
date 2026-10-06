// src/items/addWindow.js
import state from "../core/state.js";
import PaperOffset from "../utils/PaperOffset.js";
import { rebuildAccessoryMenu } from "../drawing/rebuildAccessoryMenu.js";
import { setDefaultData } from "../utils/setDefaultData.js";
import { addMullian } from "./addMullian.js";
import { addHingeAndHandle } from "./addHingeAndHandle.js";
import { addLockTypeText } from "./addLockTypeText.js";
import { deleteItem } from "../utils/deleteItem.js";
import { enableSave } from "../services/enableSave.js";
import { showMessage } from "../utils/showMessage.js";
import { updateLayerPreview } from "../utils/updateLayerPreview.js";
import { updateTempDesignSnapshot } from "../utils/updateTempDesignSnapshot.js";
// نوع بازشو
const OPENINGS = {
    window_simple: {
        hinge: false,
        handle: false,
        type: false
    },
    window_simple_right: {
        hinge: "left",
        handle: "right",
        type: "normal"
    },
    window_simple_left: {
        hinge: "right",
        handle: "left",
        type: "normal"
    },
    window_simple_top: {
        hinge: "bottom",
        handle: "top",
        type: "normal"
    },
    window_simple_bottom: {
        hinge: "top",
        handle: "bottom",
        type: "normal"
    },
    window_dual_right: {
        hinge: "left",
        handle: "right",
        type: "dual"
    },

    window_dual_left: {
        hinge: "right",
        handle: "left",
        type: "dual"
    },
    window_radial_right: {
        hinge: false,
        handle: "right",
        type: "radial"
    },
    window_radial_left: {
        hinge: false,
        handle: "left",
        type: "radial"
    },
    window_radial_top: {
        hinge: false,
        handle: "top",
        type: "radial"
    },
    window_radial_bottom: {
        hinge: false,
        handle: "bottom",
        type: "radial"
    },
    window_volkswagen_right: {
        hinge: false,
        handle: "right",
        type: "volkswagen"
    },
    window_volkswagen_left: {
        hinge: false,
        handle: "left",
        type: "volkswagen"
    },
    window_simple_right_noHandle: {
        hinge: "left",
        handle: "invisible",
        type: "normal"
    },
    window_simple_left_noHandle: {
        hinge: "right",
        handle: "invisible",
        type: "normal"
    }
};
// تنظیمات نوع بازشو
function getOpeningConfig(type) {
    return OPENINGS[type] || {
        hinge: false,
        handle: false,
        type: false
    };
}
// بررسی پروفیل
function getFrameSize(data) {
    if (data?.profile?.profile_width) {
        return Number(data.profile.profile_width);
    }
    if (state.firstWindowSash_width) {
        return Number(state.firstWindowSash_width);
    }
    return 0;
}
// ساخت قسمت وسط و چهار نیم‌ساز شیشه
function createGlassBorders(glassShape, group) {
    const blackWidth = 1.5;
    const whiteWidth = 12;
    const innerBlackWidth = 1.5;
    const glassBorders =
        new state.paper.Group();
    glassBorders.name =
        "glassBorders";
    glassBorders.data.glassId =
        glassShape.id;
    // لایه مشکی بیرونی
    const outerBlackInner =
        PaperOffset.offset(
            glassShape,
            -blackWidth
        );
    if (!outerBlackInner) {
        return null;
    }
    const outerBlack =
        glassShape.subtract(
            outerBlackInner
        );
    outerBlack.fillColor =
        "#222222";
    outerBlack.strokeColor =
        null;
    outerBlack.name =
        "glassOuterBlack";
    glassBorders.addChild(
        outerBlack
    );
    // قسمت سفید / وسط
    const whiteInner =
        PaperOffset.offset(
            outerBlackInner,
            -whiteWidth
        );
    if (!whiteInner) {
        outerBlackInner.remove();
        return glassBorders;
    }
    const whiteBorder =
        outerBlackInner.subtract(
            whiteInner
        );
    whiteBorder.fillColor =
        "#ffffff";
    whiteBorder.strokeColor =
        null;
    whiteBorder.name =
        "glassWhiteBorder";
    glassBorders.addChild(
        whiteBorder
    );
    // چهار نیم‌ساز گوشه
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
        line.strokeColor =
            "#222222";
        line.strokeWidth =
            1.5;
        line.strokeCap =
            "butt";
        line.name =
            "glassCornerBisector";
        cornerGroup.addChild(
            line
        );
    });
    glassBorders.addChild(
        cornerGroup
    );
    // خط مشکی داخلی
    const innerBlackInner =
        PaperOffset.offset(
            whiteInner,
            -innerBlackWidth
        );
    if (innerBlackInner) {
        const innerBlack =
            whiteInner.subtract(
                innerBlackInner
            );
        innerBlack.fillColor =
            "#222222";
        innerBlack.strokeColor =
            null;
        innerBlack.name =
            "glassInnerBlack";
        glassBorders.addChild(
            innerBlack
        );
        innerBlackInner.remove();
    }
    // حاشیه‌ها را داخل گروه پنجره قرار بده
    group.addChild(
        glassBorders
    );
    outerBlackInner.remove();
    whiteInner.remove();
    return glassBorders;
}
// ساخت هندسه پنجره
function buildWindowGeometry(flat, overlap, frameSize, data) {
    const outer = PaperOffset.offset(flat, overlap);
    if (!outer) {
        return null;
    }
    const inner = PaperOffset.offset(outer, -frameSize);
    if (!inner) {
        outer.remove();
        return null;
    }
    // رنگ شیشه
    inner.fillColor = new state.paper.Color("#8acde8");
    inner.name = "flat";
    setDefaultData(inner, "flat");
    if (data?.flat) {
        inner.data = data.flat;
    }
    if (data?.flatFillColor) {
        inner.fillColor = data.flatFillColor;
    }
    const frame = outer.subtract(inner);
    if (!frame) {
        outer.remove();
        inner.remove();
        return null;
    }
    frame.strokeColor = state.strokeColor;
    frame.strokeWidth = 2;
    frame.fillColor = state.frameColor;
    frame.name = "windowFrame";
    if (
        frame.children &&
        frame.children.length >= 2
    ) {
        frame.children[0].strokeColor =
            state.strokeColor;
        frame.children[0].strokeWidth = 3;
        frame.children[1].strokeColor =
            state.strokeColor;
        frame.children[1].strokeWidth = 3;
    }
    // سایه فریم پنجره
    // frame.shadowColor = state.shadowColor;
    // frame.shadowBlur = state.shadowBlur;
    setDefaultData(frame, "windowFrame");
    if (data?.profile) {
        frame.data = data.profile;
    }
    frame.data.profile_width = frameSize;
    return {
        outer,
        inner,
        frame
    };
}
// خطوط برش فریم
function createFrameCutLines(frame) {
    const children = frame.children;
    if (!children?.[0] || !children?.[1]) {
        return;
    }
    children.forEach(child => {
        child.name = "wframeInOut";
        child.strokeColor =
            state.strokeColor;
        child.strokeWidth = 3;
    });
    children[0].segments.forEach(segment => {
        const isStraight =
            segment.handleIn.angle === 0 &&
            segment.handleOut.angle === 0;
        if (!isStraight) {
            return;
        }
        const nearestPoint =
            children[1].getNearestPoint(
                segment.point
            );
        if (!nearestPoint) {
            return;
        }
        const line =
            new state.paper.Path.Line({
                from: segment.point,
                to: nearestPoint
            });
        line.name = "frameCutLine";
        line.strokeColor =
            state.strokeColor;
        line.strokeWidth = 3;
        line.strokeCap = "butt";
        frame.addChild(line);
    });
}
function createWindowGroup(type, geometry) {
    const group =
        new state.paper.Group();
    group.name = type;
    group.addChild(
        geometry.inner
    );
    group.addChild(
        geometry.frame
    );
    return group;
}
function addWindowHardware(type, geometry, group) {
    const opening = getOpeningConfig(type);
    addHingeAndHandle(
        "window",
        geometry.outer,
        group,
        opening.hinge,
        opening.handle,
        opening.type
    );
}
function attachWindow(flat, group, parentGroup) {
    flat.name = "base";
    const baseGroup = new state.paper.Group();
    baseGroup.name = "baseGroup";
    baseGroup.addChild(flat);
    baseGroup.addChild(group);
    if (parentGroup) {
        parentGroup.addChild(baseGroup);
    }
    return baseGroup;
}
// پیدا کردن دو صفحه پنجره فرانسوی
function findFrenchFlats(overhung) {
    const flats = state.paper.project.activeLayer.getItems({
        name: "flat"
    });
    const center = overhung.bounds.center;
    let leftFlat = null;
    let rightFlat = null;
    flats.forEach(flat => {
        if (flat.hitTest(
            new state.paper.Point(
                center.x - 150,
                center.y
            )
        )) {
            leftFlat = flat;
            return;
        }
        if (flat.hitTest(
            new state.paper.Point(
                center.x + 150,
                center.y
            )
        )) {
            rightFlat = flat;
        }
    });
    return {
        leftFlat,
        rightFlat
    };
}
// تنظیم پنجره فرانسوی
function getFrenchConfig(type) {
    const configs = {
        window_french_simple_right: [
            "window_simple_right_noHandle",
            "window_simple_left"
        ],
        window_french_simple_left: [
            "window_simple_right",
            "window_simple_left_noHandle"
        ],
        window_french_dual_right: [
            "window_simple_right_noHandle",
            "window_dual_left"
        ],
        window_french_dual_left: [
            "window_dual_right",
            "window_simple_left_noHandle"
        ]
    };
    return configs[type] || null;
}
// ساخت پنجره فرانسوی
function createFrenchWindow(type, flat) {
    const overhung = addMullian(
        "vMullian",
        flat,
        flat.bounds.center,
        flat.parent,
        null,
        state.firstOverhung_width
    );
    if (!overhung) {
        return false;
    }
    overhung.data.profile = state.firstOverhung;
    overhung.data.profile_width = state.firstOverhung_width;
    overhung.data.overhung = 1;
    const {
        leftFlat,
        rightFlat
    } = findFrenchFlats(overhung);
    if (!leftFlat || !rightFlat) {
        deleteItem(overhung);
        return false;
    }
    const config = getFrenchConfig(type);
    if (!config) {
        deleteItem(overhung);
        return false;
    }
    addWindow(
        config[0],
        leftFlat,
        leftFlat.parent
    );
    addWindow(
        config[1],
        rightFlat,
        rightFlat.parent
    );
    return true;
}
// ساخت پنجره معمولی
function createNormalWindow(
    type,
    flat,
    parentGroup,
    data,
    overlap,
    frameSize
) {
    const geometry =
        buildWindowGeometry(
            flat,
            overlap,
            frameSize,
            data
        );
    if (!geometry) {
        showMessage(
            "ساخت پنجره امکان پذیر نبود"
        );
        return false;
    }
    createFrameCutLines(
        geometry.frame
    );
    const group =
        createWindowGroup(
            type,
            geometry
        );
    // ساخت قسمت وسط و چهار نیم‌ساز
    createGlassBorders(
        geometry.inner,
        group
    );
    addLockTypeText(
        geometry.frame
    );
    addWindowHardware(
        type,
        geometry,
        group
    );
    attachWindow(
        flat,
        group,
        parentGroup
    );
    geometry.outer.remove();
    return group;
}
// افزودن پنجره
export function addWindow(
    type,
    flat,
    parentGroup = false,
    data = false,
    overlap = state.defaultOverlap
) {
    if (!type || !flat) {
        return false;
    }
    if (state.unitData?.type === "Slide") {
        showMessage(
            "این پروفیل لولایی نیست. عملیات امکان پذیر نمی باشد"
        );
        return false;
    }
    const frameSize = getFrameSize(data);
    if (!frameSize) {
        showMessage(
            "بنظر می رسد این پروفیل شامل سش پنجره نمی باشد. اگر این مورد اشتباه است به مدیریت جهت اصلاح اطلاع دهید."
        );
        return false;
    }
    state.frameSize = frameSize;
    rebuildAccessoryMenu(type);
    if (type.includes("french")) {
        const result = createFrenchWindow(
            type,
            flat
        );
        if (result) {
            enableSave();
            updateTempDesignSnapshot();
            updateLayerPreview();
        }
        return result;
    }
    const group = createNormalWindow(
        type,
        flat,
        parentGroup,
        data,
        overlap,
        frameSize
    );
    if (!group) {
        return false;
    }
    enableSave();
    updateTempDesignSnapshot();
    updateLayerPreview();
    return group;
}
export default addWindow;