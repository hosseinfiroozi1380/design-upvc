// src/drawing/drawHandle.js
import state from "../core/state.js";
import {
    windowHandleSize,
    windowHandle2Size,
    doorHandleSize,
    doorHandle2Size
} from "../config/constants.js";
// draw handle for window and door
export function drawHandle(
    type,
    HandlePosition,
    handleCenterPoint,
    rotation,
    itemGroup
) {
    if (type === "window") {
        const handleScale = 1.2;
        let Handle = new state.paper.Path.Rectangle(
            new state.paper.Rectangle(
                [
                    handleCenterPoint.x - (windowHandleSize.width * handleScale) / 2,
                    handleCenterPoint.y - (windowHandleSize.height * handleScale) / 2 - 10
                ],
                [
                    windowHandleSize.width * handleScale,
                    windowHandleSize.height * handleScale * 1.5
                ]
            ),
            [10, 10]
        );
        Handle.rotate(rotation, handleCenterPoint);
        Handle.strokeColor = new state.paper.Color("#999999");
        Handle.fillColor = new state.paper.Color("#dddddd");
        Handle.name = "handle";
        itemGroup.addChild(Handle);
        Handle = new state.paper.Path.Rectangle(
            new state.paper.Rectangle(
                [
                    handleCenterPoint.x - (windowHandle2Size.width * handleScale) / 2,
                    handleCenterPoint.y - 1 * handleScale
                ],
                [
                    windowHandle2Size.width * handleScale,
                    windowHandle2Size.height * handleScale
                ]
            ),
            [10, 10]
        );
        Handle.rotate(rotation, handleCenterPoint);
        Handle.strokeColor = new state.paper.Color("#999999");
        Handle.fillColor = new state.paper.Color("#dddddd");
        Handle.name = "handleHand";
        itemGroup.addChild(Handle);
    }
    else if (type === "door") {

        const handleScale = 1.2;
    
        const backOffsetX =
            HandlePosition === "right" ? 10 : -10;
    
        const frontOffsetX =
            HandlePosition === "right" ? 17.5 : -17.5;
    
        // دستگیره پشت بزرگ
        let Handle = new state.paper.Path.Rectangle(
            new state.paper.Rectangle(
                [
                    handleCenterPoint.x -
                        (doorHandleSize.width * handleScale) / 2 +
                        backOffsetX,
    
                    handleCenterPoint.y -
                        (doorHandleSize.height * handleScale) / 2
                ],
                [
                    doorHandleSize.width * handleScale,
                    doorHandleSize.height * handleScale
                ]
            ),
            [8, 8]
        );
    
        Handle.rotate(rotation, handleCenterPoint);
        Handle.strokeColor = new state.paper.Color("#999999");
        Handle.fillColor = new state.paper.Color("#dddddd");
        Handle.name = "handle";
        itemGroup.addChild(Handle);
    
        // دستگیره جلو کوچک
        Handle = new state.paper.Path.Rectangle(
            new state.paper.Rectangle(
                [
                    handleCenterPoint.x -
                        (doorHandle2Size.width * handleScale) / 2 +
                        frontOffsetX,
    
                    handleCenterPoint.y -
                        doorHandleSize.height * handleScale / 6 - 15
                ],
                [
                    doorHandle2Size.width * handleScale,
                    doorHandle2Size.height * handleScale
                ]
            ),
            [8, 8]
        );
    
        Handle.rotate(
            ((HandlePosition === "right") ? 90 : 270) + rotation,
            [
                handleCenterPoint.x,
                handleCenterPoint.y -
                    doorHandleSize.height * handleScale / 6
            ]
        );
    
        Handle.strokeColor = new state.paper.Color("#999999");
        Handle.fillColor = new state.paper.Color("#dddddd");
        Handle.name = "handleHand";
        itemGroup.addChild(Handle);
    }
}