// src/items/addSlide.js
import state from '../core/state.js';
import { addSlideFrame } from './addSlideFrame.js';
import { slidesAddHingeAndHandle } from './slidesAddHingeAndHandle.js';
import { addMullian } from './addMullian.js';
import { enableSave } from '../services/enableSave.js';
import { round2decimal } from '../utils/round2decimal.js';
import { showMessage } from '../utils/showMessage.js';
// add slide
export function addSlide(flatToAdd, config, pointsOfMullians = false, data = false, mullianData = false) { //data = {frame: data, flat: data] these are data for new windows frame and flat
    if (state.unitData.type == "Turn") {
        showMessage('این پروفیل کشویی نیست. عملیات امکان پذیر نمی باشد');
        return;
    }
    if (typeof config === 'string' || config instanceof String) {
        config = JSON.parse(config); //type, frames, position, slideSide
    } else if (data) {
        config = data.config
    } else {
        showMessage('No Config');
        return;
    }
    let position = config.position.split("");
    let slideSide = config.slideSide.split("");
    let testframeWidth = (data.profile) ? data.profile.profile_width : state.firstWindowSash_width;
    if (!testframeWidth) {
        showMessage('بنظر می رسد این پروفیل شامل سش مناسب نمی باشد. اگر این مورد اشتباه است به مدیریت جهت اصلاح اطلاع دهید.');
        return;
    }
    state.frameWidth = testframeWidth;
    if (config.type !== "slide" || state.unitData.shape !== "simple_rectangle") {
        showMessage('امکان اضافه کردن بازشو اسلایدی در اشکال غیرساده وجود ندارد');
        return
    }
    if (flatToAdd.parent.name !== "section" && flatToAdd.parent.parent.name !== "section") {
        showMessage('در این سطح امکان نصب پنجره کشویی وجود ندارد');
        return
    }
    //find frame is 0,1,2 slide type
    let frameSlideCount = $('.frameInput option[value="' + state.mainFrame.data.profile + '"]').data('slide');
    if (frameSlideCount == 1) { //نک ریل
        if (config.slide != 1) {
            showMessage('پروفیل فریم تک ریل است. تنها پنجره تک ریل می تواند نصب شود. عملیات لغو شد');
            return;
        }
    } else if (frameSlideCount == 2) { //جفت ریل
        if (config.slide != 2) {
            showMessage('پروفیل فریم جفت ریل است. تنها پنجره جفت ریل می تواند نصب شود. عملیات لغو شد');
            return;
        }
    } else {
        showMessage('خطا در شناسایی تعداد ریل های فریم. عملیات امکان پذیر نمی باشد');
        return;
    }
    let tempPoints = [];
    if (pointsOfMullians) {
        for (let j = 0; j < pointsOfMullians.length; j++) {
            tempPoints.push([pointsOfMullians[j], round2decimal(flatToAdd.bounds.centerY)]);
        }
        pointsOfMullians = tempPoints;
    }
    let baseGroup = new state.paper.Group();
    baseGroup.name = "baseGroup";
    let windowGroup = new state.paper.Group();
    windowGroup.name = "window_slide";
    windowGroup.data.config = {};
    windowGroup.data.config.type = 'slide';
    windowGroup.data.config.frames = config.frames;
    windowGroup.data.config.position = config.position;
    windowGroup.data.config.slideSide = config.slideSide;
    windowGroup.data.config.slide = config.slide;
    let flatToAddNew = flatToAdd.clone();
    flatToAddNew.name = "base";
    baseGroup.addChild(flatToAddNew);
    baseGroup.addChild(windowGroup);
    baseGroup.parent = flatToAdd.parent;
    //baseGroup.addChild(flatToAdd);
    let mulliansWidth = [2, 2, 2];
    if (frameSlideCount == 1) {
        if (mullianData) {
            mulliansWidth = [mullianData.profile_width, mullianData.profile_width, mullianData.profile_width];
        } else {
            mulliansWidth = [state.firstMullian_width, state.firstMullian_width, state.firstMullian_width];
        }
        //in 1 slide when 2 frame meet each other, act like 2 slide in mullianswidth
        if (config.frames == 4 && slideSide[0] != "n" && slideSide[1] != "n") {
            mulliansWidth[0] = 2;
        } else if (config.frames == 4 && slideSide[1] != "n" && slideSide[2] != "n") {
            mulliansWidth[1] = 2;
        }
    }
    //first add vMullians then frames : add mullian with 2 width that should be ignored in calculation
    if (config.frames == 2) {
        if (!pointsOfMullians) {
            pointsOfMullians = [];
            pointsOfMullians.push([round2decimal(flatToAdd.bounds.x + flatToAdd.bounds.width / 2), round2decimal(flatToAdd.bounds.centerY)]);
        }
        addMullian('vMullian', flatToAdd, new state.paper.Point(pointsOfMullians[0]), windowGroup, mullianData, mulliansWidth[0]);
    } else if (config.frames == 3) {
        if (!pointsOfMullians) {
            pointsOfMullians = [];
            pointsOfMullians.push([round2decimal(flatToAdd.bounds.x + flatToAdd.bounds.width / 3), round2decimal(flatToAdd.bounds.centerY)]);
            pointsOfMullians.push([round2decimal(flatToAdd.bounds.x + 2 * flatToAdd.bounds.width / 3), round2decimal(flatToAdd.bounds.centerY)]);
        }
        addMullian('vMullian', flatToAdd, new state.paper.Point(pointsOfMullians[0]), windowGroup, mullianData, mulliansWidth[0]);
        let allFlats = state.paper.project.activeLayer.getItems({ name: "flat" });
        $.each(allFlats, function (key, flat) {
            if (flat.hitTest(new state.paper.Point(pointsOfMullians[1]))) {
                addMullian('vMullian', flat, new state.paper.Point(pointsOfMullians[1]), windowGroup, mullianData, mulliansWidth[1]);
                return;
            }
        });
    } else if (config.frames == 4) {
        if (!pointsOfMullians) {
            pointsOfMullians = [];
            pointsOfMullians.push([round2decimal(flatToAdd.bounds.x + flatToAdd.bounds.width / 4), round2decimal(flatToAdd.bounds.centerY)]);
            pointsOfMullians.push([round2decimal(flatToAdd.bounds.x + 2 * flatToAdd.bounds.width / 4), round2decimal(flatToAdd.bounds.centerY)]);
            pointsOfMullians.push([round2decimal(flatToAdd.bounds.x + 3 * flatToAdd.bounds.width / 4), round2decimal(flatToAdd.bounds.centerY)]);
        }
        addMullian('vMullian', flatToAdd, new state.paper.Point(pointsOfMullians[0]), windowGroup, mullianData, mulliansWidth[0]);
        let allFlats = state.paper.project.activeLayer.getItems({ name: "flat" });
        $.each(allFlats, function (key, flat) {
            if (flat.hitTest(new state.paper.Point(pointsOfMullians[1]))) {
                addMullian('vMullian', flat, new state.paper.Point(pointsOfMullians[1]), windowGroup, mullianData, mulliansWidth[1]);
                return;
            }
        });
        allFlats = state.paper.project.activeLayer.getItems({ name: "flat" });
        $.each(allFlats, function (key, flat) {
            if (flat.hitTest(new state.paper.Point(pointsOfMullians[2]))) {
                addMullian('vMullian', flat, new state.paper.Point(pointsOfMullians[2]), windowGroup, mullianData, mulliansWidth[2]);
                return;
            }
        });
    }
    let items = windowGroup.getItems({
        name: function (value) {
            return ['vMullian', 'flat'].includes(value);
        }
    });
    $.each(items, function (key, item) {
        item.parent = windowGroup;
    });
    let baseGroups = windowGroup.getItems({ name: "baseGroup" });
    $.each(baseGroups, function (key, item) {
        item.remove();
    });
    //add Slide to widow flats
    let flats = windowGroup.getItems({ name: "flat" });
    flats.sort((a, b) => (a.bounds.leftCenter.x < b.bounds.leftCenter.x ? -1 : 0)); //sort from left to right
    let frame1, frame2, frame3, frame4, overlaps;
    let profileLab = 20;
    let mullianExtraSash_0 = state.frameWidth / 2;
    let mullianExtraSash_1 = state.frameWidth / 2;
    let mullianExtraSash_2 = state.frameWidth / 2;
    if (frameSlideCount == 1) {
        mullianExtraSash_0 = (mulliansWidth[0] == 2) ? 0 : (mulliansWidth[0] + state.firstEnterlock_width + profileLab);
        mullianExtraSash_1 = (mulliansWidth[1] == 2) ? 0 : (mulliansWidth[1] + state.firstEnterlock_width + profileLab);
        mullianExtraSash_2 = (mulliansWidth[2] == 2) ? 0 : (mulliansWidth[2] + state.firstEnterlock_width + profileLab);
    }
    state.firstEnterlock_sash_space = $('.enterlockInput option[data-profile_id="' + state.unitData.profile_id + '"]').data('sash_space') || 0;
    if (flats.length == 2) {
        //left
        if (frameSlideCount != 1 || (frameSlideCount == 1 && slideSide[0] != 'n')) {
            overlaps = {
                left: 8,
                right: mullianExtraSash_0,
                top: 8 + state.firstEnterlock_sash_space,
                bottom: 8 + state.firstEnterlock_sash_space
            }
            frame1 = addSlideFrame(flats[0], state.frameWidth, overlaps);
            flats[0].insertBelow(frame1);
            slidesAddHingeAndHandle(frame1, slideSide[0], frameSlideCount);
            frame1.data.movement = slideSide[0];
        }
        //right
        if (frameSlideCount != 1 || (frameSlideCount == 1 && slideSide[1] != 'n')) {
            overlaps = {
                left: mullianExtraSash_0,
                right: 8,
                top: 8 - state.firstEnterlock_sash_space,
                bottom: 8 - state.firstEnterlock_sash_space
            }
            frame2 = addSlideFrame(flats[1], state.frameWidth, overlaps);
            flats[1].insertBelow(frame2);
            slidesAddHingeAndHandle(frame2, slideSide[1], frameSlideCount);
            frame2.data.movement = slideSide[1];
        }
        if (frame1 && frame2 && position[0] == 'u') frame1.insertAbove(frame2);
    } else if (flats.length == 3) {
        //left
        if (frameSlideCount != 1 || (frameSlideCount == 1 && slideSide[0] != 'n')) {
            overlaps = {
                left: 8,
                right: (position[1] == position[0]) ? 0 : mullianExtraSash_0,
                top: 8 - state.firstEnterlock_sash_space,
                bottom: 8 - state.firstEnterlock_sash_space
            }
            frame1 = addSlideFrame(flats[0], state.frameWidth, overlaps);
            flats[0].insertBelow(frame1);
            slidesAddHingeAndHandle(frame1, slideSide[0], frameSlideCount);
            frame1.data.movement = slideSide[0];
        }
        //center
        if (frameSlideCount != 1 || (frameSlideCount == 1 && slideSide[1] != 'n')) {
            overlaps = {
                left: (position[1] == position[0]) ? 0 : mullianExtraSash_0,
                right: (position[1] == position[2]) ? 0 : mullianExtraSash_1,
                top: 8 - state.firstEnterlock_sash_space,
                bottom: 8 - state.firstEnterlock_sash_space
            }
            frame2 = addSlideFrame(flats[1], state.frameWidth, overlaps);
            flats[1].insertBelow(frame2);
            slidesAddHingeAndHandle(frame2, slideSide[1], frameSlideCount);
            frame2.data.movement = slideSide[1];
        }
        //right
        if (frameSlideCount != 1 || (frameSlideCount == 1 && slideSide[2] != 'n')) {
            overlaps = {
                left: (position[1] == position[2]) ? 0 : mullianExtraSash_1,
                right: 8,
                top: 8 - state.firstEnterlock_sash_space,
                bottom: 8 - state.firstEnterlock_sash_space
            }
            frame3 = addSlideFrame(flats[2], state.frameWidth, overlaps);
            flats[2].insertBelow(frame3);
            slidesAddHingeAndHandle(frame3, slideSide[2], frameSlideCount);
            frame3.data.movement = slideSide[2];
        }
        if (frame1 && frame2 && position[0] == 'u') frame1.insertAbove(frame2);
        if (frame2 && frame3 && position[1] == 'u') frame2.insertAbove(frame3);
    } else if (flats.length == 4) {
        //left
        if (frameSlideCount != 1 || (frameSlideCount == 1 && slideSide[0] != 'n')) {
            overlaps = {
                left: 8,
                right: (position[1] == position[0]) ? 0 : mullianExtraSash_0,
                top: 8 - state.firstEnterlock_sash_space,
                bottom: 8 - state.firstEnterlock_sash_space
            }
            frame1 = addSlideFrame(flats[0], state.frameWidth, overlaps);
            flats[0].insertBelow(frame1);
            slidesAddHingeAndHandle(frame1, slideSide[0], frameSlideCount);
            frame1.data.movement = slideSide[0];
        }
        //beside left
        if (frameSlideCount != 1 || (frameSlideCount == 1 && slideSide[1] != 'n')) {
            overlaps = {
                left: (position[1] == position[0]) ? 0 : mullianExtraSash_0,
                right: (position[1] == position[2]) ? 0 : mullianExtraSash_1,
                top: 8 - state.firstEnterlock_sash_space,
                bottom: 8 - state.firstEnterlock_sash_space
            }
            frame2 = addSlideFrame(flats[1], state.frameWidth, overlaps);
            flats[1].insertBelow(frame2);
            slidesAddHingeAndHandle(frame2, slideSide[1], frameSlideCount);
            frame2.data.movement = slideSide[1];
        }
        //beside right
        if (frameSlideCount != 1 || (frameSlideCount == 1 && slideSide[2] != 'n')) {
            overlaps = {
                left: (position[1] == position[2]) ? 0 : mullianExtraSash_1,
                right: (position[2] == position[3]) ? 0 : mullianExtraSash_2,
                top: 8 - state.firstEnterlock_sash_space,
                bottom: 8 - state.firstEnterlock_sash_space
            }
            frame3 = addSlideFrame(flats[2], state.frameWidth, overlaps);
            flats[2].insertBelow(frame3);
            slidesAddHingeAndHandle(frame3, slideSide[2], frameSlideCount);
            frame3.data.movement = slideSide[2];
        }
        //right
        if (frameSlideCount != 1 || (frameSlideCount == 1 && slideSide[3] != 'n')) {
            overlaps = {
                left: (position[3] == position[2]) ? 0 : mullianExtraSash_2,
                right: 8,
                top: 8 - state.firstEnterlock_sash_space,
                bottom: 8 - state.firstEnterlock_sash_space
            }
            frame4 = addSlideFrame(flats[3], state.frameWidth, overlaps);
            flats[3].insertBelow(frame4);
            slidesAddHingeAndHandle(frame4, slideSide[3], frameSlideCount);
            frame4.data.movement = slideSide[3];
        }
        if (frame1 && frame2 && position[0] == 'u') frame1.insertAbove(frame2);
        if (frame2 && frame3 && position[1] == 'u') frame2.insertAbove(frame3);
        if (frame3 && frame4 && position[2] == 'u') frame3.insertAbove(frame4);
    }
    enableSave();
}