// src/drawing/createDimensionBar.js
import state from "../core/state.js";
import {
    round2decimal
} from "../utils/round2decimal.js";
import {
    correctWindowDoorGLines
} from "../items/correctWindowDoorGLines.js";
import {
    layersLayout
} from "../utils/layersLayout.js";
import { itemsDimensionText } from "../utils/itemsDimensionText.js";
export function createDimensionBar() {
    let text = null;
    // let extra_frame_lenght = 0;
    console.log(
        "SECTION COUNT:",
        state.paper.project.activeLayer.getItems({
            name: "section"
        }).length
    );
    
    console.log(
        "SECTION ITEMS:",
        state.paper.project.activeLayer.getItems({
            name: "section"
        })
    );
    // حذف تمام اندازه‌گذاری‌های قبلی
    const allDimensions =
    state.paper.project.activeLayer.getItems({
        name: "dbG"
    });

    allDimensions.forEach(item => {
    item.remove();
    });
    state.dbG = new state.paper.Group();
    state.dbG.name = "dbG";
    let xBarPosition = 0;
    let yBarPosition = 0;
    let allSections = state.paper.project.activeLayer.getItems({
        name: "section"
    });
    let AllvMullians = state.paper.project.activeLayer.getItems({
        name: "vMullian"
    });
    let AllhMullians = state.paper.project.activeLayer.getItems({
        name: "hMullian"
    });
    //loop on sections
    for (let i = 0; i < allSections.length; i++) {
        xBarPosition = allSections[i].bounds.y + allSections[i].bounds.height + 30;
        yBarPosition -= 30;
        let vMulliansPositions = [];
        let hMulliansPositions = [];
        //add mulians positions
        for (let j = 0; j < AllvMullians.length; j++) {
            if (allSections[i].contains(AllvMullians[j].bounds.center)) {
                vMulliansPositions.push(round2decimal(AllvMullians[j].bounds.x + AllvMullians[j].bounds.width / 2))
            }
        }
        for (let j = 0; j < AllhMullians.length; j++) {
            if (allSections[i].contains(AllhMullians[j].bounds.center)) {
                hMulliansPositions.push(round2decimal(AllhMullians[j].bounds.y + AllhMullians[j].bounds.height / 2))
            }
        }
        //add sections start and end positions
        if (vMulliansPositions.length > 0) {
            vMulliansPositions.push(round2decimal(allSections[i].bounds.x + allSections[i].bounds.width));
        }
        if (hMulliansPositions.length > 0) {
            hMulliansPositions.push(round2decimal(allSections[i].bounds.y + allSections[i].bounds.height));
        }
        //remove duplicate value
        vMulliansPositions =
            vMulliansPositions.filter((item, index) =>
                vMulliansPositions.indexOf(item) === index);
        hMulliansPositions = hMulliansPositions.filter((item, index) => hMulliansPositions.indexOf(item) === index);
        //sort value
        vMulliansPositions.sort(function (a, b) {
            if (a > b) return 1;
            if (a < b) return -1;
            return 0;
        });
        hMulliansPositions.sort(function (a, b) {
            if (a > b) return 1;
            if (a < b) return -1;
            return 0;
        });
        //draw vMullian bars
        //draw vMullian bars
        for (let index = 0; index < vMulliansPositions.length; index++) {
            let previousX = allSections[i].bounds.x;
            if (index > 0) {
                previousX = vMulliansPositions[index - 1];
            }
            let textcontent =
                round2decimal(
                    Math.abs(
                        previousX -
                        vMulliansPositions[index]
                    )
                );
            if (textcontent > 0) {
                let newxBar =
                    new state.paper.Group();
                let leftBar =
                    new state.paper.Path.Line(
                        new state.paper.Point(
                            previousX,
                            xBarPosition
                        ),
                        new state.paper.Point(
                            previousX,
                            xBarPosition + 30
                        )
                    );
                let rightBar =
                    new state.paper.Path.Line(
                        new state.paper.Point(
                            vMulliansPositions[index],
                            xBarPosition
                        ),
                        new state.paper.Point(
                            vMulliansPositions[index],
                            xBarPosition + 30
                        )
                    );
                leftBar.strokeColor =
                    state.otherBarColor;
                rightBar.strokeColor =
                    state.otherBarColor;
                leftBar.strokeWidth = 2;
                rightBar.strokeWidth = 2;
                newxBar.addChild(leftBar);
                newxBar.addChild(rightBar);
                newxBar.name = 'xBar';
                state.dbG.addChild(newxBar);
                // ساخت عدد
                let textX =
                    previousX +
                    (
                        Math.abs(
                            previousX -
                            vMulliansPositions[index]
                        ) / 2
                    );
                text =
                    new state.paper.PointText(
                        new state.paper.Point(
                            textX,
                            xBarPosition + 30
                        )
                    );
                text.content =
                    textcontent;
                text.fillColor =
                    state.otherBarColor;
                text.fontSize =
                    state.DimensionBarTextSize2;
                text.justification =
                    'center';
                text.rotation = 0;
                text.name = 'xBarT';
                text.data.section =
                    allSections[i].id;
                text.data.position =
                    vMulliansPositions[index];
                state.dbG.addChild(text);
                // خط افقی سمت چپ عدد
                let textHalfWidth =
                    text.bounds.width / 2 + 5;
                let middleBarLeft =
                    new state.paper.Path.Line(
                        new state.paper.Point(
                            previousX,
                            xBarPosition + 15
                        ),
                        new state.paper.Point(
                            textX - textHalfWidth,
                            xBarPosition + 15
                        )
                    );
                // خط افقی سمت راست عدد
                let middleBarRight =
                    new state.paper.Path.Line(
                        new state.paper.Point(
                            textX + textHalfWidth,
                            xBarPosition + 15
                        ),
                        new state.paper.Point(
                            vMulliansPositions[index],
                            xBarPosition + 15
                        )
                    );
                middleBarLeft.strokeColor =
                    state.otherBarColor;
                middleBarRight.strokeColor =
                    state.otherBarColor;
                middleBarLeft.strokeWidth = 2;
                middleBarRight.strokeWidth = 2;
                state.dbG.addChild(middleBarLeft);
                state.dbG.addChild(middleBarRight);
            }
        }
        let mainFrameProfile = allSections[i].children.mainFrame.data.profile || 0;
        let frameType = $('.frameInput option[value="' + mainFrameProfile + '"]').data('type') || 0;
        if (state.extra_frame_lenght == 0 && frameType !== "Frame") {
            state.extra_frame_lenght = 20;//sash for frame
        }
        //draw mainXbar
        xBarPosition += 75;
        let mainxBar = new state.paper.Group();
        let leftBar = new state.paper.Path.Line(
            new state.paper.Point(
                allSections[i].bounds.x + state.extra_frame_lenght,
                xBarPosition
            ),
            new state.paper.Point(
                allSections[i].bounds.x + state.extra_frame_lenght,
                xBarPosition + 30
            )
        );
        let rightBar = new state.paper.Path.Line(
            new state.paper.Point(
                allSections[i].bounds.x -
                state.extra_frame_lenght +
                allSections[i].bounds.width,
                xBarPosition
            ),
            new state.paper.Point(
                allSections[i].bounds.x -
                state.extra_frame_lenght +
                allSections[i].bounds.width,
                xBarPosition + 30
            )
        );
        leftBar.strokeColor = state.mainBarColor;
        rightBar.strokeColor = state.mainBarColor;
        leftBar.strokeWidth = 2;
        rightBar.strokeWidth = 2;
        mainxBar.addChild(leftBar);
        mainxBar.addChild(rightBar);
        mainxBar.name = 'mXBar';
        state.dbG.addChild(mainxBar);
        let textX = allSections[i].bounds.centerX;
        text = new state.paper.PointText(
            new state.paper.Point(
                textX,
                xBarPosition + 30
            )
        );
        text.content =
            round2decimal(
                allSections[i].bounds.width -
                (state.extra_frame_lenght * 2)
            );
        if (state.extra_frame_lenght > 0) {
            text.content =
                round2decimal(
                    allSections[i].bounds.width -
                    (state.extra_frame_lenght * 2)
                ) +
                ' [' +
                round2decimal(
                    allSections[i].bounds.width
                ) +
                ']';
        }
        text.fillColor = state.mainBarColor;
        text.fontSize = state.DimensionBarTextSize1;
        text.justification = 'center';
        text.rotation = 0;
        text.name = 'mXBarT';
        text.data.section = allSections[i].id;
        let textHalfWidth =
            text.bounds.width / 2 + 5;
        let mainMiddleBarLeft =
            new state.paper.Path.Line(
                new state.paper.Point(
                    allSections[i].bounds.x +
                    state.extra_frame_lenght,
                    xBarPosition + 15
                ),
                new state.paper.Point(
                    textX - textHalfWidth,
                    xBarPosition + 15
                )
            );
        let mainMiddleBarRight =
            new state.paper.Path.Line(
                new state.paper.Point(
                    textX + textHalfWidth,
                    xBarPosition + 15
                ),
                new state.paper.Point(
                    allSections[i].bounds.x -
                    state.extra_frame_lenght +
                    allSections[i].bounds.width,
                    xBarPosition + 15
                )
            );
        mainMiddleBarLeft.strokeColor = state.mainBarColor;
        mainMiddleBarRight.strokeColor = state.mainBarColor;
        mainMiddleBarLeft.strokeWidth = 2;
        mainMiddleBarRight.strokeWidth = 2;
        mainxBar.addChild(mainMiddleBarLeft);
        mainxBar.addChild(mainMiddleBarRight);
        state.dbG.addChild(text);
        if (state.extra_frame_lenght > 0) {
            let mainxBar_extra = new state.paper.Path()
            mainxBar_extra.moveTo(new state.paper.Point(allSections[i].bounds.x, xBarPosition + 30))
            mainxBar_extra.lineTo(new state.paper.Point(allSections[i].bounds.x + state.extra_frame_lenght, xBarPosition + 30));
            mainxBar_extra.strokeColor = 'purple';
            mainxBar_extra.strokeWidth = 2;
            mainxBar_extra.name = 'mXBar_extra';
            state.dbG.addChild(mainxBar_extra);
            text = new state.paper.PointText(new state.paper.Point(state.extra_frame_lenght / 4, xBarPosition + 75));
            text.content = round2decimal(state.extra_frame_lenght);
            text.fillColor = 'purple';
            text.fontSize = 30;
            text.rotation = 0;
            text.name = 'mXBarT_extra';
            text.data.section = allSections[i].id;
            state.dbG.addChild(text);
            let mainxBar_extra2 = new state.paper.Path()
            mainxBar_extra2.moveTo(new state.paper.Point(allSections[i].bounds.x - state.extra_frame_lenght + allSections[i].bounds.width, xBarPosition + 30))
            mainxBar_extra2.lineTo(new state.paper.Point(allSections[i].bounds.x + allSections[i].bounds.width, xBarPosition + 30));
            mainxBar_extra2.strokeColor = 'purple';
            mainxBar_extra2.strokeWidth = 2;
            mainxBar_extra2.name = 'mXBar_extra';
            state.dbG.addChild(mainxBar_extra2);
            text = new state.paper.PointText(new state.paper.Point(allSections[i].bounds.x - state.extra_frame_lenght + allSections[i].bounds.width, xBarPosition + 75));
            text.content = round2decimal(state.extra_frame_lenght);
            text.fillColor = 'purple';
            text.fontSize = 30;
            text.rotation = 0;
            text.name = 'mXBarT_extra';
            text.data.section = allSections[i].id;
            state.dbG.addChild(text);
        }
        //draw hMullian bars
        for (let index = 0; index < hMulliansPositions.length; index++) {
            let previousY = allSections[i].bounds.y;
            if (index > 0) {
                previousY = hMulliansPositions[index - 1];
            }
            let textcontent =
                round2decimal(
                    Math.abs(
                        previousY -
                        hMulliansPositions[index]
                    )
                );
            if (textcontent > 0) {
                let newxBar = new state.paper.Group();
                let topBar = new state.paper.Path.Line(
                    new state.paper.Point(
                        yBarPosition,
                        previousY
                    ),
                    new state.paper.Point(
                        yBarPosition - 30,
                        previousY
                    )
                );
                let bottomBar = new state.paper.Path.Line(
                    new state.paper.Point(
                        yBarPosition,
                        hMulliansPositions[index]
                    ),
                    new state.paper.Point(
                        yBarPosition - 30,
                        hMulliansPositions[index]
                    )
                );
                topBar.strokeColor = state.otherBarColor;
                bottomBar.strokeColor = state.otherBarColor;
                topBar.strokeWidth = 2;
                bottomBar.strokeWidth = 2;
                newxBar.addChild(topBar);
                newxBar.addChild(bottomBar);
                newxBar.name = 'yBar';
                state.dbG.addChild(newxBar);
                let textY =
                    previousY +
                    (
                        Math.abs(
                            previousY -
                            hMulliansPositions[index]
                        ) / 2
                    );
                text = new state.paper.PointText(
                    new state.paper.Point(
                        yBarPosition - 15,
                        textY + 15
                    )
                );
                text.content = textcontent;
                text.fillColor = state.otherBarColor;
                text.fontSize = state.DimensionBarTextSize2;
                text.justification = 'center';
                text.rotation = -90;
                text.name = 'yBarT';
                text.data.section = allSections[i].id;
                text.data.position = hMulliansPositions[index];
                let textHalfHeight =
                    text.bounds.height / 2 + 5;
                let middleBarTop =
                    new state.paper.Path.Line(
                        new state.paper.Point(
                            yBarPosition - 15,
                            previousY
                        ),
                        new state.paper.Point(
                            yBarPosition - 15,
                            textY - textHalfHeight
                        )
                    );
                let middleBarBottom =
                    new state.paper.Path.Line(
                        new state.paper.Point(
                            yBarPosition - 15,
                            textY + textHalfHeight
                        ),
                        new state.paper.Point(
                            yBarPosition - 15,
                            hMulliansPositions[index]
                        )
                    );
                middleBarTop.strokeColor =
                    state.otherBarColor;
                middleBarBottom.strokeColor =
                    state.otherBarColor;
                middleBarTop.strokeWidth = 2;
                middleBarBottom.strokeWidth = 2;
                newxBar.addChild(middleBarTop);
                newxBar.addChild(middleBarBottom);
                state.dbG.addChild(text);
            }
        }
        let bottomDoorHeight = allSections[i]?.children.mainFrame?.data?.bottomdoor || 0;
        let extra_frame_lenght_yBottom = (bottomDoorHeight > 0) ? 0 : state.extra_frame_lenght;
        //draw mainYbars
        yBarPosition -= 75;
        let mainyBar = new state.paper.Group();
        let topBar = new state.paper.Path.Line(
            new state.paper.Point(
                yBarPosition,
                allSections[i].bounds.y + state.extra_frame_lenght
            ),
            new state.paper.Point(
                yBarPosition - 30,
                allSections[i].bounds.y + state.extra_frame_lenght
            )
        );
        let bottomBar = new state.paper.Path.Line(
            new state.paper.Point(
                yBarPosition,
                allSections[i].bounds.y +
                allSections[i].bounds.height -
                extra_frame_lenght_yBottom
            ),
            new state.paper.Point(
                yBarPosition - 30,
                allSections[i].bounds.y +
                allSections[i].bounds.height -
                extra_frame_lenght_yBottom
            )
        );
        topBar.strokeColor = state.mainBarColor;
        bottomBar.strokeColor = state.mainBarColor;
        topBar.strokeWidth = 2;
        bottomBar.strokeWidth = 2;
        mainyBar.addChild(topBar);
        mainyBar.addChild(bottomBar);
        mainyBar.name = 'mYBar';
        state.dbG.addChild(mainyBar);
        let textY = allSections[i].bounds.centerY;
        text = new state.paper.PointText(
            new state.paper.Point(
                yBarPosition - 15,
                textY + 15
            )
        );
        text.content =
            round2decimal(
                allSections[i].bounds.height -
                (state.extra_frame_lenght +
                    extra_frame_lenght_yBottom)
            );
        if (state.extra_frame_lenght > 0) {
            text.content =
                round2decimal(
                    allSections[i].bounds.height -
                    (state.extra_frame_lenght +
                        extra_frame_lenght_yBottom)
                ) +
                ' [' +
                round2decimal(
                    allSections[i].bounds.height
                ) +
                ']';
        }
        text.fillColor = state.mainBarColor;
        text.fontSize = state.DimensionBarTextSize1;
        text.justification = 'center';
        text.rotation = -90;
        text.name = 'mYBarT';
        text.data.section = allSections[i].id;
        let textHalfHeight =
            text.bounds.height / 2 + 5;
        let mainMiddleBarTop =
            new state.paper.Path.Line(
                new state.paper.Point(
                    yBarPosition - 15,
                    allSections[i].bounds.y +
                    state.extra_frame_lenght
                ),
                new state.paper.Point(
                    yBarPosition - 15,
                    textY - textHalfHeight
                )
            );
        let mainMiddleBarBottom =
            new state.paper.Path.Line(
                new state.paper.Point(
                    yBarPosition - 15,
                    textY + textHalfHeight
                ),
                new state.paper.Point(
                    yBarPosition - 15,
                    allSections[i].bounds.y +
                    allSections[i].bounds.height -
                    extra_frame_lenght_yBottom
                )
            );
        mainMiddleBarTop.strokeColor = state.mainBarColor;
        mainMiddleBarBottom.strokeColor = state.mainBarColor;
        mainMiddleBarTop.strokeWidth = 2;
        mainMiddleBarBottom.strokeWidth = 2;
        mainyBar.addChild(mainMiddleBarTop);
        mainyBar.addChild(mainMiddleBarBottom);
        state.dbG.addChild(text);
        if (state.extra_frame_lenght > 0) {
            let mainyBar_extra = new state.paper.Path()
            mainyBar_extra.moveTo(new state.paper.Point(yBarPosition - 30, allSections[i].bounds.y))
            mainyBar_extra.lineTo(new state.paper.Point(yBarPosition - 30, allSections[i].bounds.y + state.extra_frame_lenght))
            mainyBar_extra.strokeColor = 'purple';
            mainyBar_extra.strokeWidth = 2;
            mainyBar_extra.name = 'mYBar_extra';
            state.dbG.addChild(mainyBar_extra);
            text = new state.paper.PointText(new state.paper.Point(yBarPosition - 90, allSections[i].bounds.y + (state.extra_frame_lenght / 2)));
            text.content = state.extra_frame_lenght;
            text.fillColor = 'purple';
            text.fontSize = 30;
            text.rotation = -90;
            text.name = 'mYBarT_extra';
            text.data.section = allSections[i].id;
            state.dbG.addChild(text);
            if (extra_frame_lenght_yBottom > 0) {
                let mainyBar_extra2 = new state.paper.Path()
                mainyBar_extra2.moveTo(new state.paper.Point(yBarPosition - 30, allSections[i].bounds.y + allSections[i].bounds.height - extra_frame_lenght_yBottom))
                mainyBar_extra2.lineTo(new state.paper.Point(yBarPosition - 30, allSections[i].bounds.y + allSections[i].bounds.height))
                mainyBar_extra2.strokeColor = 'purple';
                mainyBar_extra2.strokeWidth = 2;
                mainyBar_extra2.name = 'mYBar_extra';
                state.dbG.addChild(mainyBar_extra2);
                text = new state.paper.PointText(new state.paper.Point(yBarPosition - 90, allSections[i].bounds.y + allSections[i].bounds.height - (state.extra_frame_lenght / 2)));
                text.content = state.extra_frame_lenght;
                text.fillColor = 'purple';
                text.fontSize = 30;
                text.rotation = -90;
                text.name = 'mYBarT_extra';
                text.data.section = allSections[i].id;
                state.dbG.addChild(text);
            }
        }
        yBarPosition -= 75;
    }
    let couplings = state.paper.project.activeLayer.getItems({
        name: "vCoupling"
    });
    for (let i = 0; i < couplings.length; i++) {
        xBarPosition = couplings[i].bounds.y + couplings[i].bounds.height + 30;
        let couple = couplings[i];
        let cBar = new state.paper.Group();
        let leftBar = new state.paper.Path.Line(
            new state.paper.Point(couple.bounds.x, xBarPosition),
            new state.paper.Point(couple.bounds.x, xBarPosition + 30)
        );
        let middleBar = new state.paper.Path.Line(
            new state.paper.Point(couple.bounds.x, xBarPosition + 15),
            new state.paper.Point(couple.bounds.x + couple.bounds.width, xBarPosition + 15)
        );
        let rightBar = new state.paper.Path.Line(
            new state.paper.Point(couple.bounds.x + couple.bounds.width, xBarPosition),
            new state.paper.Point(couple.bounds.x + couple.bounds.width, xBarPosition + 30)
        );
        leftBar.strokeColor = '#666';
        middleBar.strokeColor = '#666';
        rightBar.strokeColor = '#666';
        leftBar.strokeWidth = 2;
        middleBar.strokeWidth = 2;
        rightBar.strokeWidth = 2;
        cBar.addChild(leftBar);
        cBar.addChild(middleBar);
        cBar.addChild(rightBar);
        cBar.name = 'cXBar';
        state.dbG.addChild(cBar);
        text = new state.paper.PointText(new state.paper.Point(couple.bounds.centerX - 25, xBarPosition + 90));
        text.content = round2decimal(couple.bounds.width);
        text.fillColor = '#666';
        text.fontSize = state.DimensionBarTextSize2;
        text.rotation = 0;
        text.name = 'cXBarT';
        state.dbG.addChild(text);
    }
    couplings = state.paper.project.activeLayer.getItems({
        name: "hCoupling"
    });
    for (let i = 0; i < couplings.length; i++) {
        yBarPosition = -30;
        let couple = couplings[i];
        let cBar = new state.paper.Group();
        let topBar = new state.paper.Path.Line(
            new state.paper.Point(yBarPosition, couple.bounds.y),
            new state.paper.Point(yBarPosition - 30, couple.bounds.y)
        );
        let middleBar = new state.paper.Path.Line(
            new state.paper.Point(yBarPosition - 15, couple.bounds.y),
            new state.paper.Point(yBarPosition - 15, couple.bounds.y + couple.bounds.height)
        );
        let bottomBar = new state.paper.Path.Line(
            new state.paper.Point(yBarPosition, couple.bounds.y + couple.bounds.height),
            new state.paper.Point(yBarPosition - 30, couple.bounds.y + couple.bounds.height)
        );
        topBar.strokeColor = '#666';
        middleBar.strokeColor = '#666';
        bottomBar.strokeColor = '#666';
        topBar.strokeWidth = 2;
        middleBar.strokeWidth = 2;
        bottomBar.strokeWidth = 2;
        cBar.addChild(topBar);
        cBar.addChild(middleBar);
        cBar.addChild(bottomBar);
        cBar.name = 'cYBar';
        state.dbG.addChild(cBar);
        text = new state.paper.PointText(new state.paper.Point(yBarPosition - 130, couple.bounds.centerY + 20));
        text.content = round2decimal(couple.bounds.height);
        text.fillColor = '#666';
        text.fontSize = state.DimensionBarTextSize2;
        text.rotation = -90;
        text.name = 'cYBarT';
        state.dbG.addChild(text);
    }
    correctWindowDoorGLines();
    itemsDimensionText();
    layersLayout();
    $('.frameConfig').hide();
    $('.doorSashConfig').hide();
    $('.windowSashConfig').hide();
    $('.panelConfig').hide();
    $('.mullianConfig').hide();
    $('.accessoryConfig').hide();
    $('.laceConfig').hide();
    $('.glazingConfig').hide();
    $('.positionConfig').hide();
    $('.glassConfig').hide();
    $('.couplingConfig').hide();
    //do not put saveHistory here.
}