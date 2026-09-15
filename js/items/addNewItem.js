// src/items/addNewItem.js
import state from '../core/state.js';
import {
    addLace
} from './addLace.js';
import {
    addMullian
} from './addMullian.js';
import {
    addPanel
} from './addPanel.js';
import {
    addWindow
} from './addWindow.js';
import {
    addDoor
} from './addDoor.js';
import {
    addSlide
} from './addSlide.js';
import {
    mouseHelperHide
} from '../events/mouseHelperHide.js';
import {
    createDimensionBar
} from '../drawing/createDimensionBar.js';
import {
    showMessage
} from '../utils/showMessage.js';
import {
    saveHistory
} from '../services/saveHistory.js';
import {
    cancelAll
} from '../utils/cancelAll.js';
import {
    hideGLs
} from '../utils/hideGLs.js';

export function addNewItem(addNewItemType, flatToAdd, toAddPoint = false) {
    console.log("ADD NEW ITEM TYPE:", addNewItemType);
    console.log("FLAT:", flatToAdd);
    state.frameColor = state.unitData['profile_color_hex'];
    if (addNewItemType == "lace") {
        addLace(flatToAdd, Number($('.laceInput[data-id="lace"] option:not([disabled]):eq(1)').val()));
    } else {
        if (flatToAdd && (flatToAdd.name == "flat")) {
            if (addNewItemType == 'vMullian' || addNewItemType == 'hMullian') {
                if ((addNewItemType == 'vMullian' && flatToAdd.bounds.width > 120) || (addNewItemType == 'hMullian' && flatToAdd.bounds.height > 120)) {
                    if(state.shiftKeyPressed){
                        let centerPoint = new state.paper.Point(flatToAdd.bounds.x + flatToAdd.bounds.width / 2, flatToAdd.bounds.y + flatToAdd.bounds.height / 2);
                        addMullian(addNewItemType, flatToAdd, centerPoint, flatToAdd.parent);
                    } else {
                        addMullian(addNewItemType, flatToAdd, toAddPoint, flatToAdd.parent);
                    }
                } else {
                    showMessage('صفحه بیش از اندازه کوچک است');
                }
            } else if (addNewItemType == '2vMullian') {
                if (flatToAdd.bounds.width > 160) {
                    //find Points
                    let flatPartWidth = flatToAdd.bounds.width / 3;
                    let firstAddingPoint = new state.paper.Point(flatToAdd.bounds.x + flatPartWidth - state.frameSize / 6, flatToAdd.bounds.centerY);
                    let secondAddingPoint = new state.paper.Point(flatToAdd.bounds.x + flatPartWidth * 2 + state.frameSize / 6, flatToAdd.bounds.centerY);
                    
                    //add First Mullian
                    addMullian('vMullian', flatToAdd, firstAddingPoint, flatToAdd.parent);

                    //add Second Mullian
                    let allFlats =state.paper.project.activeLayer.getItems({name: "flat"});
                    $.each(allFlats, function(key, findNewFlat) {
                        if(findNewFlat.hitTest(secondAddingPoint)){
                            addMullian('vMullian', findNewFlat, secondAddingPoint, findNewFlat.parent);
                        }
                    });
                } else {
                    showMessage('صفحه بیش از اندازه کوچک است');
                }
            } else if (addNewItemType == '3vMullian') {
                if (flatToAdd.bounds.width > 240) {
                    //find Points
                    let flatPartWidth = flatToAdd.bounds.width / 4;
                    let firstAddingPoint = new state.paper.Point(flatToAdd.bounds.x + flatPartWidth - state.frameSize / 4, flatToAdd.bounds.centerY);
                    let secondAddingPoint = new state.paper.Point(flatToAdd.bounds.x + flatPartWidth * 2, flatToAdd.bounds.centerY);
                    let thirdAddingPoint = new state.paper.Point(flatToAdd.bounds.x + flatPartWidth * 3 + state.frameSize / 4, flatToAdd.bounds.centerY);

                    //add First Mullian
                    addMullian('vMullian', flatToAdd, firstAddingPoint, flatToAdd.parent);

                    //add Second Mullian
                    let allFlats =state.paper.project.activeLayer.getItems({name: "flat"});
                    $.each(allFlats, function(key, findNewFlat) {
                        if(findNewFlat.hitTest(secondAddingPoint)){
                            addMullian('vMullian', findNewFlat, secondAddingPoint, findNewFlat.parent);
                        }
                    });

                    //add Third Mullian
                    allFlats =state.paper.project.activeLayer.getItems({name: "flat"});
                    $.each(allFlats, function(key, findNewFlat) {
                        if(findNewFlat.hitTest(thirdAddingPoint)){
                            addMullian('vMullian', findNewFlat, thirdAddingPoint, findNewFlat.parent);
                        }
                    });
                } else {
                    showMessage('صفحه بیش از اندازه کوچک است');
                }
            } else if (addNewItemType == '2hMullian') {
                if (flatToAdd.bounds.height > 160) {
                    //find Points
                    let flatPartHeight = flatToAdd.bounds.height / 3;
                    let firstAddingPoint = new state.paper.Point(flatToAdd.bounds.centerX, flatToAdd.bounds.y + flatPartHeight - state.frameSize / 6);
                    let secondAddingPoint = new state.paper.Point(flatToAdd.bounds.centerX, flatToAdd.bounds.y + flatPartHeight * 2 + state.frameSize / 6);

                    //add First Mullian
                    addMullian('hMullian', flatToAdd, firstAddingPoint, flatToAdd.parent);

                    //add Second Mullian
                    let allFlats =state.paper.project.activeLayer.getItems({name: "flat"});
                    $.each(allFlats, function(key, findNewFlat) {
                        if(findNewFlat.hitTest(secondAddingPoint)){
                            addMullian('hMullian', findNewFlat, secondAddingPoint, findNewFlat.parent);
                        }
                    });
                } else {
                    showMessage('صفحه بیش از اندازه کوچک است');
                }

            } else if (addNewItemType == '3hMullian') {
                if (flatToAdd.bounds.height > 240) {
                    //find Points
                    let flatPartHeight = flatToAdd.bounds.height / 4;
                    let firstAddingPoint = new state.paper.Point(flatToAdd.bounds.centerX, flatToAdd.bounds.y + flatPartHeight - state.frameSize / 4);
                    let secondAddingPoint = new state.paper.Point(flatToAdd.bounds.centerX, flatToAdd.bounds.y + flatPartHeight * 2);
                    let thirdAddingPoint = new state.paper.Point(flatToAdd.bounds.centerX, flatToAdd.bounds.y + flatPartHeight * 3 + state.frameSize / 4);

                    //add First Mullian
                    addMullian('hMullian', flatToAdd, firstAddingPoint, flatToAdd.parent);

                    //add Second Mullian
                    let allFlats =state.paper.project.activeLayer.getItems({name: "flat"});
                    $.each(allFlats, function(key, findNewFlat) {
                        if(findNewFlat.hitTest(secondAddingPoint)){
                            addMullian('hMullian', findNewFlat, secondAddingPoint, findNewFlat.parent);
                        }
                    });

                    //add Third Mullian
                    allFlats =state.paper.project.activeLayer.getItems({name: "flat"});
                    $.each(allFlats, function(key, findNewFlat) {
                        if(findNewFlat.hitTest(thirdAddingPoint)){
                            addMullian('hMullian', findNewFlat, thirdAddingPoint, findNewFlat.parent);
                        }
                    });
                } else {
                    showMessage('صفحه بیش از اندازه کوچک است');
                }

            } else if (addNewItemType == 'fullhMullian') {
                let toAddCenterPosition = toAddPoint.y;
                if(state.shiftKeyPressed){
                    toAddCenterPosition = flatToAdd.bounds.y + flatToAdd.bounds.height / 2;
                }
                //first Draw a test Line for find future flats
                let from = new state.paper.Point(
                    state.paper.project.activeLayer.bounds.left,
                    toAddCenterPosition
                );
                
                let to = new state.paper.Point(
                    state.paper.project.activeLayer.bounds.right,
                    toAddCenterPosition
                );                let tempLine = new state.paper.Path.Line(from, to);
                tempLine.name = "temp";
                // tempLine.strokeColor = 'black';
                
                let allFlats =state.paper.project.activeLayer.getItems({name: "flat"});
                $.each(allFlats, function(key, flat) {
                    if(tempLine.intersects(flat)){
                        addMullian('hMullian', flat, new state.paper.Point(flat.bounds.centerX, toAddCenterPosition), flat.parent);
                        state.findFlat = true;
                        return;
                    }
                });
               tempLine.remove();

            } else if (addNewItemType == 'fullvMullian') {
                let toAddCenterPosition = toAddPoint.x;
                if(state.shiftKeyPressed){
                    toAddCenterPosition = flatToAdd.bounds.x + flatToAdd.bounds.width / 2;
                }
                //first Draw a test Line for find future flats
                let from = new state.paper.Point(toAddCenterPosition,state.paper.project.activeLayer.bounds.top);
                let to = new state.paper.Point(toAddCenterPosition,state.paper.project.activeLayer.bounds.bottom);
                let tempLine = new state.paper.Path.Line(from, to);
                tempLine.name = "temp";
                //tempLine.strokeColor = 'black';

                let allFlats =state.paper.project.activeLayer.getItems({name: "flat"});
                $.each(allFlats, function(key, flat) {
                    if(tempLine.intersects(flat)){
                        addMullian('vMullian', flat, new state.paper.Point(toAddCenterPosition, flat.bounds.centerY), flat.parent);
                        state.findFlat = true;
                        return;
                    }
                });
               tempLine.remove();

            } else if (addNewItemType == 'vPanel' || addNewItemType == 'hPanel') {
                if ((addNewItemType == 'vPanel' && flatToAdd.bounds.width > 120) || (addNewItemType == 'hPanel' && flatToAdd.bounds.height > 120)) {
                    addPanel(addNewItemType, flatToAdd, flatToAdd.parent);
                } else {
                    showMessage('صفحه بیش از اندازه کوچک است');
                }
            } else if (addNewItemType.indexOf('window_') !== -1) {
                if (flatToAdd.bounds.width > 120 && flatToAdd.bounds.height > 120) {
                    addWindow(addNewItemType, flatToAdd, flatToAdd.parent);
                } else {
                    showMessage('صفحه بیش از اندازه کوچک است');
                }
            } else if (addNewItemType.indexOf('door_') !== -1) {
                if (flatToAdd.bounds.width > 120 && flatToAdd.bounds.height > 120) {
                    addDoor(addNewItemType, flatToAdd, flatToAdd.parent);
                } else {
                    showMessage('صفحه بیش از اندازه کوچک است');
                }
            } else if (addNewItemType.indexOf('slide') !== -1) {
                if (flatToAdd.bounds.width > 200 && flatToAdd.bounds.height > 200) {
                    addSlide(flatToAdd, addNewItemType);
                } else {
                    showMessage('صفحه بیش از اندازه کوچک است');
                }
            }

           state.paper.project.deselectAll();
            cancelAll();
            createDimensionBar();
            saveHistory();
        } else {
            showMessage('لطفا یک صفحه را انتخاب کنید');
            hideGLs();
        }
    }

    if(!$('#glassBox').hasClass('closed')){
        $('#glassBox').addClass('closed');
        $('#toggleIcon').html('<i class="ti ti-chevron-left"></i>');
    }

   state.paper.project.deselectAll();
    mouseHelperHide();
}