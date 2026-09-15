// src/utils/animateHingedItem.js
import state from '../core/state.js';

export function animateHingedItem(cItem, hingeDirection) {
    let item = cItem.parent.clone();
    item.fillColor = '#00000006';
    let isDoor = item.getItem({
        name: function (value) {
            return value && (value.indexOf("door_") !== -1);
        }
    });
    let handleHand = item.getItem({
        name: function (value) {
            return value && (value.indexOf("handleHand") !== -1);
        }
    });
    let handleCircle = item.getItem({
        name: function (value) {
            return value && (value.indexOf("handleCircle") !== -1);
        }
    });
    return new Promise((resolve) => {
        const duration = 1000;
        const originalBounds = item.bounds.clone();
        const isLeft = hingeDirection === 'left';
        const shearDirection = isLeft ? -1 : 1;
        let handleDeg = isDoor
            ? (30 * shearDirection)
            : (hingeDirection === 'left' ? 90 : -90);
        let hingePoint = null;
        if (hingeDirection == "left") {
            hingePoint = new state.paper.Point(
                originalBounds.left,
                originalBounds.center.y
            );
        } else if (hingeDirection == "right") {
            hingePoint = new state.paper.Point(
                originalBounds.right,
                originalBounds.center.y
            );
        } else if (hingeDirection == "top") {
            hingePoint = new state.paper.Point(
                originalBounds.center.x,
                originalBounds.top
            );
        } else if (hingeDirection == "bottom") {
            hingePoint = new state.paper.Point(
                originalBounds.center.x,
                originalBounds.bottom
            );
        }
        async function animateHandle() {
            if (!handleHand || !handleCircle) {
                return;
            }
            return new Promise((handleResolve) => {
                const originalPivot = handleHand.pivot;
                handleHand.pivot =
                    !isDoor
                        ? handleCircle.bounds.center
                        : new state.paper.Point(
                            handleCircle.bounds.x,
                            handleCircle.bounds.y - 30
                        );
                handleHand.tween(
                    {
                        rotation: handleDeg
                    },
                    {
                        easing: 'easeInOutCubic',
                        duration: 300
                    }
                )
                .then(() => {
                    handleHand.pivot = originalPivot;
                    handleResolve();
                });
            });
        }
        let startTime = null;
        let phase = 'opening';
        let handleAnimationCompleted = false;
        function animate(currentTime) {
            if (!startTime) {
                if (!handleAnimationCompleted) {
                    return;
                }
                startTime = currentTime;
            }
            let elapsed = currentTime - startTime;
            let progress = Math.min(
                elapsed / duration,
                1
            );
            let currentShear =
                phase === 'opening'
                    ? -0.002 * shearDirection
                    : 0.002 * shearDirection;
            let currentScale =
                phase === 'opening'
                    ? 0.995
                    : 1.005;
            if (
                hingeDirection === 'left' ||
                hingeDirection === 'right'
            ) {
                item.shear(
                    new state.paper.Point(
                        0,
                        currentShear
                    ),
                    hingePoint
                );
                item.scale(
                    currentScale,
                    1,
                    hingePoint
                );
            } else {
                item.shear(
                    new state.paper.Point(
                        currentShear,
                        0
                    ),
                    hingePoint
                );
                item.scale(
                    1,
                    currentScale,
                    hingePoint
                );
            }
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else if (phase === 'opening') {
                phase = 'closing';
                startTime = null;
                requestAnimationFrame(animate);
            } else {
                item.remove();
                resolve();
            }
        }
        animateHandle()
            .then(() => {
                handleAnimationCompleted = true;
                requestAnimationFrame(animate);
            });
    });
}