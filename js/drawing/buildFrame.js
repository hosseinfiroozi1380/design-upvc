// src/drawing/buildFrame.js
import state from "../core/state.js";
import { createGLs } from "./createGLs.js";
import { createDimensionBar } from "./createDimensionBar.js";
import { setZoom } from "../events/setZoom.js";
import { showMessage } from "../utils/showMessage.js";
import { setDefaultData } from "../utils/setDefaultData.js";
import PaperOffset from "../utils/PaperOffset.js";
export function buildFrame(
    tmpShape,
    newFrameSize = false,
    mainFrameData = false,
    isExtension = false
) {
    let testFrameSize = state.firstFrame_width;
    if (!testFrameSize) {
        showMessage(
            "بنظر می رسد این پروفیل شامل فریم نمی باشد. اگر این مورد اشتباه است به مدیریت جهت اصلاح اطلاع دهید."
        );
        return false;
    }
    state.frameSize = testFrameSize;
    state.frameColor = state.unitData.profile_color_hex;
    // MAIN SECTION
    if (!isExtension) {
        state.mainSection = new state.paper.Group();
        state.mainSection.name = "section";
        state.mainSection.data.designID =
            state.currentDesignID || null;
    }
    if (newFrameSize) {
        state.frameSize = newFrameSize;
    }
    if (mainFrameData) {
        state.frameSize = mainFrameData.profile_width;
    }
    // افزونه
    if (isExtension) {
        const extensionSection = new state.paper.Group();
        extensionSection.name = "section";
        extensionSection.data.isExtension = true;
        // CREATE EXTENSION FLAT
        const extensionFlat = PaperOffset.offset(
            tmpShape,
            -state.frameSize
        );
        extensionFlat.fillColor = "#4fc3f724";
        extensionFlat.name = "mainFlat";
        // CREATE FIRST FLAT
        const firstFlat = extensionFlat.clone();
        firstFlat.fillColor = "#8acde8";
        firstFlat.strokeColor = state.strokeColor;
        firstFlat.strokeWidth = 1;
        firstFlat.name = "flat";
        setDefaultData(
            firstFlat,
            "flat"
        );
        // CREATE EXTENSION FRAME
        const extensionFrame =
            tmpShape.subtract(
                extensionFlat
            );
        if (
            extensionFrame.children &&
            extensionFrame.children.length >= 2
        ) {
            extensionFrame.children[0].name =
                "mainFlat";
            extensionFrame.children[1].name =
                "mainFlat";
            extensionFrame.children[0].strokeColor =
                state.strokeColor;
            extensionFrame.children[0].strokeWidth = 3;
            extensionFrame.children[1].strokeColor =
                state.strokeColor;
            extensionFrame.children[1].strokeWidth = 3;
        }
        extensionFrame.strokeColor =
            state.strokeColor;
        extensionFrame.strokeWidth = 2;
        extensionFrame.fillColor =
            state.frameColor;
        extensionFrame.name =
            "mainFrame";
        setDefaultData(
            extensionFrame,
            "mainFrame"
        );
        // FRAME CUT LINE
        if (
            extensionFrame.children &&
            extensionFrame.children.length >= 2
        ) {
            $.each(
                extensionFrame.children[0].segments,
                function (key, value) {
                    const nearestPoint =
                        extensionFrame.children[1]
                            .getNearestPoint(
                                value.point
                            );
                    if (nearestPoint) {
                        const frameCutLine =
                            new state.paper.Path.Line({
                                from: value.point,
                                to: nearestPoint,
                                name: "frameCutLine"
                            });
                        frameCutLine.strokeColor =
                            state.strokeColor;
                        frameCutLine.strokeWidth = 3;
                        frameCutLine.strokeCap = "butt";
                        extensionFrame.addChild(
                            frameCutLine
                        );
                    }
                }
            );
        }
        // ADD TO EXTENSION SECTION
        extensionSection.addChild(
            extensionFlat
        );
        extensionSection.addChild(
            firstFlat
        );
        extensionSection.addChild(
            extensionFrame
        );
        extensionFlat.remove();
        tmpShape.remove();
        // ADD SECTION
        state.paper.project.activeLayer.addChild(
            extensionSection
        );
        createGLs();
        createDimensionBar();
        return extensionSection;
    }
    // CREATE MAIN FLAT
    state.mainFlat =
        PaperOffset.offset(
            tmpShape,
            -state.frameSize
        );
    state.mainFlat.fillColor =
        "#4fc3f724";
    state.mainFlat.name =
        "mainFlat";
    state.mainSection.addChild(
        state.mainFlat
    );
    // BOTTOM DOOR
    if (
        mainFrameData &&
        mainFrameData.bottomdoor > 0
    ) {
        let scaleY =
            (
                state.mainFlat.bounds.height +
                state.frameSize -
                mainFrameData.bottomdoor
            ) /
            state.mainFlat.bounds.height;
        state.mainFlat.scale(
            1,
            scaleY
        );
        state.mainFlat.bounds.y =
            state.frameSize;
    }
    // CREATE FIRST FLAT
    let firstFlat =
        state.mainFlat.clone();
    firstFlat.fillColor =
        "#8acde8";
    firstFlat.strokeColor =
        state.strokeColor;
    firstFlat.strokeWidth = 1;
    firstFlat.name =
        "flat";
    setDefaultData(
        firstFlat,
        "flat"
    );
    state.mainSection.addChild(
        firstFlat
    );
    createGlassBorders(
        firstFlat,
        state.mainSection
    );
    // CREATE FRAME
    state.mainFrame =
        tmpShape.subtract(
            state.mainFlat
        );
    if (
        state.mainFrame.children &&
        state.mainFrame.children.length >= 2
    ) {
        state.mainFrame.children[0].name =
            "mainFlat";
        state.mainFrame.children[1].name =
            "mainFlat";
    }
    state.mainFrame.strokeColor =
        state.strokeColor;
    state.mainFrame.strokeWidth = 2;
    state.mainFrame.fillColor =
        state.frameColor;
    if (
        state.mainFrame.children &&
        state.mainFrame.children.length >= 2
    ) {
        state.mainFrame.children[0].strokeColor =
            state.strokeColor;
        state.mainFrame.children[0].strokeWidth = 3;
        state.mainFrame.children[1].strokeColor =
            state.strokeColor;
        state.mainFrame.children[1].strokeWidth = 3;
    }
    state.mainFrame.name =
        "mainFrame";
    setDefaultData(
        state.mainFrame,
        "mainFrame"
    );
    if (mainFrameData) {
        state.mainFrame.data =
            mainFrameData;
    }
    // FRAME CUT LINE
    if (
        state.mainFrame.children &&
        state.mainFrame.children.length >= 2
    ) {
        $.each(
            state.mainFrame.children[0].segments,
            function (key, value) {
                let nearestPoint =
                    state.mainFrame.children[1]
                        .getNearestPoint(
                            value.point
                        );
                if (nearestPoint) {
                    let fromPoint =
                        value.point;
                    let toPoint =
                        nearestPoint;
                    let frameCutLine =
                        new state.paper.Path.Line({
                            from:
                                (
                                    mainFrameData &&
                                    mainFrameData.bottomdoor > 0 &&
                                    fromPoint.y ==
                                    state.mainFrame.bounds.height
                                )
                                    ?
                                    [
                                        toPoint.x,
                                        fromPoint.y
                                    ]
                                    :
                                    fromPoint,
                            to:
                                toPoint,
                            name:
                                "frameCutLine"
                        });
                    frameCutLine.strokeColor =
                        state.strokeColor;
                    frameCutLine.strokeWidth = 3;
                    frameCutLine.strokeCap = "butt";
                    state.mainFrame.addChild(
                        frameCutLine
                    );
                }
            }
        );
    }
    // ADD FRAME TO SECTION
    state.mainSection.addChild(
        state.mainFrame
    );
    state.mainFlat.remove();
    tmpShape.remove();
    // AFTER BUILD
    createGLs();
    createDimensionBar();
    setZoom();
    // CREATE GLASS BORDER
    function createGlassBorders(
        glassShape,
        section
    ) {
        const blackWidth = 1.5;
        const whiteWidth = 12;
        const innerBlackWidth = 1.5;
        const glassBorders =
            new state.paper.Group();
        glassBorders.name =
            "glassBorders";
        glassBorders.data.glassId =
            glassShape.id;
        const outerBlackInner =
            PaperOffset.offset(
                glassShape,
                -blackWidth
            );
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
        const whiteInner =
            PaperOffset.offset(
                outerBlackInner,
                -whiteWidth
            );
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
                [
                    outerBounds.left,
                    outerBounds.top
                ],
                [
                    innerBounds.left,
                    innerBounds.top
                ]
            ],
            [
                [
                    outerBounds.right,
                    outerBounds.top
                ],
                [
                    innerBounds.right,
                    innerBounds.top
                ]
            ],
            [
                [
                    outerBounds.left,
                    outerBounds.bottom
                ],
                [
                    innerBounds.left,
                    innerBounds.bottom
                ]
            ],
            [
                [
                    outerBounds.right,
                    outerBounds.bottom
                ],
                [
                    innerBounds.right,
                    innerBounds.bottom
                ]
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
            line.strokeWidth = 1.5;
            line.strokeCap = "butt";
            line.name =
                "glassCornerBisector";
            cornerGroup.addChild(
                line
            );
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
        innerBlack.fillColor =
            "#222222";
        innerBlack.strokeColor =
            null;
        innerBlack.name =
            "glassInnerBlack";
        glassBorders.addChild(
            innerBlack
        );
        section.addChild(
            glassBorders
        );
        outerBlackInner.remove();
        whiteInner.remove();
        innerBlackInner.remove();
        return glassBorders;
    }
    return state.mainSection;
}