window.onload = function () {

    var canvas = document.getElementById('myCanvas');
    paper.setup(canvas);

    //////////////Config//////////////////

    var tool = new paper.Tool();
    var unitData = {};
    var currentDesignID = 0;
    var tryingToDrag = false;
    var changeMullianPositionFlag = false;
    var changeWindowDoorPanelPositionFlag = false;
    var waitingToAddItemFlag = false;
    var mainSection, mainFrame, mainFlat, selectedItem, previousSelectedItem, addNewItemType, dbG, glG, vMGL, vMGLT, vMGRT, hMGL, hMGTT, hMGBT, calculations;
    var firstGlass, firstGlassColor, firstGlassGroup, firstFrame, firstDoorSash, firstWindowSash, firstAccessory, firstAccessoryType, firstAccessoryType, firstLace, firstPanel, firstMullian, firstOverhung, firstGlazing, firstCoupling, firstMullian_width, firstOverhung_width, firstCoupling_width, firstPanel_width, firstWindowSash_width, firstWindowSash_width, firstCornic, firstDoorSash_width, firstFrame_width, firstBottomDoor, firstThreshold, firstEnterlock, firstEnterlock_width, firstEnterlock_sash_space;
    var extra_frame_lenght;
    var flatHover;
    var mouseHelperClone;
    var removedDependenceMemory = [];
    var viewZoom = 0.3;
    var frameSize = 60;
    var panelSize = 120;
    var laceSize = 20;
    var frameSizeDoor = 80;
    var couplingSize = 80;
    var glassMarginInsideProfile = 5;
    var mullianExtend = 3;
    var overHungMinusLenght = 62;
    var weldSize = 3;
    var defaultOverlap = 8;
    var DimensionBarTextSize1 = 60;
    var DimensionBarTextSize2 = 45;
    var windowHingSize = new paper.Size(20, 70);
    var windowHandleSize = new paper.Size(25, 50);
    var windowHandle2Size = new paper.Size(16, 80);
    var doorHingSize = new paper.Size(20, 70);
    var doorHandleSize = new paper.Size(40, 120);
    var doorHandle2Size = new paper.Size(16, 90);
    var strokeColor = new paper.Color('#000000');
    var frameColor = new paper.Color('#ffffff');
    var tweenFillColor = new paper.Color('#f0ffe4');
    var olColor = new paper.Color('#ff9800');
    var mainBarColor = new paper.Color('#4fc3f7');
    var otherBarColor = new paper.Color('#4caf50');
    var flatColor = new paper.Color('#4fc3f7');
    var flatHoverColor = new paper.Color('#00000015');
    var panelColor = new paper.Color('#ffffff');
    var laceColor = new paper.Color('#999999');
    var glColor = new paper.Color('red');
    var shadowColor = new paper.Color('#999999');;
    var shadowBlur = 15;
    var history = [];
    var history_index = 0;
    var mulliansToRedraw = [];
    var othersToRedraw = [];
    var somethingChanged = false;
    var shiftKeyPressed = false;
    var ctrlKeyPressed = false;
    var deleteMode = false;
    var moveStepFactor = 5;
    var firstLayerLoad = true;
    let saveTimeout = null;
    let currentSaveRequest = null;
    let laceOverlap = 8;

    var debug = false;

    initPinchZoom();

    //////////////FORM//////////////////
    $("form#form1").submit(function (e) {

        e.preventDefault();
        var formData = {};
        $.each($('form#form1').serializeArray(), function (i, field) {
            formData[field.name] = field.value;
        });

        if (formData.profile_id == undefined || formData.profile_color == undefined || formData.accessory_id == undefined || formData.glass_id == undefined || formData.system == undefined || formData.quantity == undefined || formData['profile_id'] == "" || formData['profile_color'] == "" || formData['accessory_id'] == "" || formData['glass_id'] == "" || formData['system'] == "" || formData['quantity'] < 1) {
            showMessage('لطفا همه فیلدها را کامل کنید')
            return;
        }

        //save current unit and then create new one
        if (currentDesignID > 0) {
            saveDesign(currentDesignID).then(function (message) {
                if (typeof message !== "undefined") {
                    showMessage(message);
                }
            }).catch(function (error) {
                let errorMessage = "خطایی در ارتباط با سرور رخ داده است.";
                if (error.status === 0) {
                    errorMessage = "اتصال اینترنت خود را بررسی کنید!";
                } else if (error.responseJSON && error.responseJSON.message) {
                    errorMessage = error.responseJSON.message;
                }
                showMessage('ذخیره با خطا مواجه شد: ' + errorMessage);
            });
        }

        let itemWidth = parseInt(formData.itemWidth) - parseInt(formData.widthSpace);
        let itemHeight = parseInt(formData.itemHeight) - parseInt(formData.heightSpace);

        if (itemWidth < 300 || itemWidth > 6000 || itemHeight < 300 || itemHeight > 6000) {
            showMessage('ابعاد نباید کمتر از 300 و بزرگتر از 6000 میلیمتر باشد')
            return;
        }

        formData['Dimension'] = [itemWidth, itemHeight];
        formData['abcd'] = {
            a: parseInt($('#a').val()),
            b: parseInt($('#b').val()),
            c: parseInt($('#c').val()),
            d: parseInt($('#d').val())
        };

        paper.project.clear();
        drawFirstShape(formData);
    });//

    function drawFirstShape(formData, redraw = false, mainFrameData = false, section = false) {

        // unitData['name'] = (redraw ? unitData['name'] : (currentDesignID+1));
        unitData['name'] = (redraw ? unitData['name'] : (parseInt($('#countDesign').text()) + 1));
        unitData['location'] = (redraw ? unitData['location'] : "");
        unitData['visibility'] = formData.visibility ?? true;
        unitData['locked'] = formData.locked ?? false;
        unitData['quantity'] = formData.quantity;
        unitData['pattern_id'] = formData.pattern_id;
        unitData['profile_id'] = formData.profile_id;
        unitData['profile_color'] = formData.profile_color;
        unitData['profile_color_hex'] = formData.profile_color_hex ?? $('#profile_color option[value="' + formData.profile_color + '"]').data('hex');
        unitData['accessory_id'] = formData.accessory_id; // id of accessory company
        unitData['glass_id'] = formData.glass_id;
        unitData['system'] = formData.system ?? $('#profile_id option[value="' + formData.profile_id + '"]').data('system');
        unitData['type'] = formData.type ?? $('#profile_id option[value="' + formData.profile_id + '"]').data('type'); //Turn, Slide
        unitData['shape'] = formData.shape;
        unitData['Dimension'] = formData.Dimension;
        unitData['abcd'] = formData.abcd;

        defaultOverlap = (unitData['system'] == "Al") ? 6 : 8;
        mullianExtend = (unitData['system'] == "Al") ? 0 : 3;

        $('.layerName').val(unitData['name']);
        $('.location').val(unitData['location']);
        $('.layerQuantity').val(unitData['quantity']);

        updateLayerDetailsMenuOptions();

        //extra frame lenght
        let bottomDoorHeight = 0;
        extra_frame_lenght = parseFloat($('.frameInput option[value="' + firstFrame + '"]').data('extra_frame_lenght') || 0);
        let frameType = $('.frameInput option[value="' + firstFrame + '"]').data('type') || 0;
        if (mainFrameData) {
            extra_frame_lenght = parseFloat($('.frameInput option[value="' + mainFrameData.profile + '"]').data('extra_frame_lenght') || 0);
            frameType = $('.frameInput option[value="' + mainFrameData.profile + '"]').data('type') || 0;
            bottomDoorHeight = mainFrameData.bottomdoor;
        }

        if (extra_frame_lenght > 0) {
            mouseHelperSetColor('info', `${extra_frame_lenght}x2 میلیمتر بابت بال پرواز فریم به ابعاد اضافه شد`);
        }
        if (extra_frame_lenght == 0 && (frameType == "Window Sash" || frameType == "Door Sash")) {
            extra_frame_lenght = 20;
        }

        let extar_frame_with_bottomDoor_count = (bottomDoorHeight > 0) ? 1 : 2;

        let itemType = formData.shape;
        let itemWidth = parseFloat(Number(formData.Dimension[0]) + (Number(extra_frame_lenght) * 2));
        let itemHeight = parseFloat(Number(formData.Dimension[1]) + (Number(extra_frame_lenght) * extar_frame_with_bottomDoor_count));
        let a = formData.abcd.a;
        let b = formData.abcd.b;
        let c = formData.abcd.c;
        let d = formData.abcd.d;

        let startX = 0;
        let startY = 0;
        if (section) {
            startX = section.bounds.x;
            startY = section.bounds.y;
        }

        if (itemType == "simple_rectangle") {
            var tmpShape = new paper.Path();
            tmpShape.moveTo(new paper.Point(startX, startY));
            tmpShape.lineTo(new paper.Point(startX, startY + itemHeight));
            tmpShape.lineTo(new paper.Point(startX + itemWidth, startY + itemHeight));
            tmpShape.lineTo(new paper.Point(startX + itemWidth, startY));
            tmpShape.closed = true;
        }
        if (itemType == "Parallelogram_top") {
            var tmpShape = new paper.Path();
            tmpShape.moveTo(new paper.Point(a, 0));
            tmpShape.lineTo(new paper.Point(0, itemHeight));
            tmpShape.lineTo(new paper.Point(itemWidth, itemHeight));
            tmpShape.lineTo(new paper.Point(itemWidth - b, 0));
            tmpShape.closed = true;
        }
        if (itemType == "Parallelogram_bottom") {
            var tmpShape = new paper.Path();
            tmpShape.moveTo(new paper.Point(0, 0));
            tmpShape.lineTo(new paper.Point(a, itemHeight));
            tmpShape.lineTo(new paper.Point(itemWidth - b, itemHeight));
            tmpShape.lineTo(new paper.Point(itemWidth, 0));
            tmpShape.closed = true;
        }
        if (itemType == "Parallelogram_left") {
            var tmpShape = new paper.Path();
            tmpShape.moveTo(new paper.Point(0, 0));
            tmpShape.lineTo(new paper.Point(a, itemHeight));
            tmpShape.lineTo(new paper.Point(itemWidth, itemHeight));
            tmpShape.lineTo(new paper.Point(itemWidth - b, 0));
            tmpShape.closed = true;
        }
        if (itemType == "Parallelogram_right") {
            var tmpShape = new paper.Path();
            tmpShape.moveTo(new paper.Point(b, 0));
            tmpShape.lineTo(new paper.Point(0, itemHeight));
            tmpShape.lineTo(new paper.Point(itemWidth - a, itemHeight));
            tmpShape.lineTo(new paper.Point(itemWidth, 0));
            tmpShape.closed = true;
        }
        if (itemType == "Parallelogram_mo_left") {
            var tmpShape = new paper.Path();
            tmpShape.moveTo(new paper.Point(0, 0));
            tmpShape.lineTo(new paper.Point(0, itemHeight - a));
            tmpShape.lineTo(new paper.Point(itemWidth, itemHeight));
            tmpShape.lineTo(new paper.Point(itemWidth, itemHeight - b));
            tmpShape.closed = true;
        }
        if (itemType == "Parallelogram_mo_right") {
            var tmpShape = new paper.Path();
            tmpShape.moveTo(new paper.Point(0, b));
            tmpShape.lineTo(new paper.Point(0, itemHeight));
            tmpShape.lineTo(new paper.Point(itemWidth, itemHeight - a));
            tmpShape.lineTo(new paper.Point(itemWidth, 0));
            tmpShape.closed = true;
        }
        if (itemType == "triangle") {
            var tmpShape = new paper.Path();
            tmpShape.moveTo(new paper.Point(a, 0));
            tmpShape.lineTo(new paper.Point(0, itemHeight));
            tmpShape.lineTo(new paper.Point(itemWidth, itemHeight));
            tmpShape.closed = true;
        }
        if (itemType == "polygon") {
            var tmpShape = new paper.Path.RegularPolygon({
                center: [itemWidth / 2, itemHeight / 2],
                sides: a,
                radius: itemWidth / 2
            });
            tmpShape.closed = true;
        }
        if (itemType == "circle") {
            var tmpShape = new paper.Path.Ellipse(new paper.Point(itemWidth / 2, itemHeight / 2), new paper.Size(itemWidth, itemHeight));
            tmpShape.closed = true;
        }
        if (itemType == "half_circle") {
            var tmpShape = new paper.Path();
            tmpShape.moveTo(new paper.Point(0, itemHeight));
            tmpShape.lineTo(new paper.Point(itemWidth, itemHeight));
            tmpShape.arcTo(new paper.Point(itemWidth / 2, 0), new paper.Point(0, itemHeight));
            tmpShape.closed = true;
        }
        if (itemType == "half_circle_reverse") {
            var tmpShape = new paper.Path();
            tmpShape.moveTo(new paper.Point(itemWidth, 0));
            tmpShape.lineTo(new paper.Point(0, 0));
            tmpShape.arcTo(new paper.Point(itemWidth / 2, itemHeight), new paper.Point(itemWidth, 0));
            tmpShape.closed = true;
        }
        if (itemType == "quarter_circle_left") {
            var tmpShape = new paper.Path();
            tmpShape.moveTo(new paper.Point(0, itemHeight));
            tmpShape.lineTo(new paper.Point(itemWidth, itemHeight));
            tmpShape.lineTo(new paper.Point(itemWidth, 0));
            tmpShape.arcTo(new paper.Point(itemWidth / 2, itemHeight / 4), new paper.Point(0, itemHeight));
            tmpShape.closed = true;
        }
        if (itemType == "quarter_circle_right") {
            var tmpShape = new paper.Path();
            tmpShape.moveTo(new paper.Point(0, 0));
            tmpShape.lineTo(new paper.Point(0, itemHeight));
            tmpShape.lineTo(new paper.Point(itemWidth, itemHeight));
            tmpShape.arcTo(new paper.Point(itemWidth / 2, itemHeight / 4), new paper.Point(0, 0));
            tmpShape.closed = true;
        }
        if (itemType == "round_rectangle") {
            var tmpShape = new paper.Path();
            tmpShape.moveTo(new paper.Point(0, a));
            tmpShape.lineTo(new paper.Point(0, itemHeight - c));
            tmpShape.arcTo(new paper.Point(c / 2, itemHeight - (c / 4)), new paper.Point(c, itemHeight));
            tmpShape.lineTo(new paper.Point(itemWidth - d, itemHeight));
            tmpShape.arcTo(new paper.Point(itemWidth - (d / 2), itemHeight - (d / 4)), new paper.Point(itemWidth, itemHeight - d));
            tmpShape.lineTo(new paper.Point(itemWidth, b));
            tmpShape.arcTo(new paper.Point(itemWidth - (b / 2), (b / 4)), new paper.Point(itemWidth - b, 0));
            tmpShape.lineTo(new paper.Point(a, 0));
            tmpShape.arcTo(new paper.Point(a / 2, a / 4), new paper.Point(0, a));
            tmpShape.closed = true;
        }
        if (itemType == "arc_rectangle") {
            var tmpShape = new paper.Path();
            tmpShape.moveTo(new paper.Point(0, a));
            tmpShape.lineTo(new paper.Point(0, itemHeight));
            tmpShape.lineTo(new paper.Point(itemWidth, itemHeight));
            tmpShape.lineTo(new paper.Point(itemWidth, b));
            tmpShape.arcTo(new paper.Point(itemWidth / 2, 0), new paper.Point(0, a));
            tmpShape.closed = true;
        }
        if (itemType == "arc_triangle") {
            var tmpShape = new paper.Path();
            tmpShape.moveTo(new paper.Point(0, itemHeight));
            tmpShape.lineTo(new paper.Point(itemWidth, itemHeight));
            tmpShape.arcTo(new paper.Point(itemWidth / 2 + itemWidth / 4, itemHeight / 2 - itemHeight / 4), new paper.Point(itemWidth / 2, 0));
            tmpShape.arcTo(new paper.Point(itemWidth / 4, itemHeight / 2 - itemHeight / 4), new paper.Point(0, itemHeight));
            tmpShape.closed = true;
        }

        let glassColor = $('#glass_id option[value="' + unitData.glass_id + '"]').data('color');
        flatColor = new paper.Color(glassColor);
        frameColor = unitData['profile_color_hex'];

        updateLayerDetailsMenuOptions();
        buildFrame(tmpShape, false, mainFrameData);
        $('.closeModal').trigger('click');

        if (!redraw) {
            saveDesign().then(function (message) {
                if (typeof message !== "undefined") {
                    showMessage(message);
                }
            }).catch(function (error) {
                let errorMessage = "خطایی در ارتباط با سرور رخ داده است.";
                if (error.status === 0) {
                    errorMessage = "اتصال اینترنت خود را بررسی کنید!";
                } else if (error.responseJSON && error.responseJSON.message) {
                    errorMessage = error.responseJSON.message;
                }
                showMessage('ذخیره با خطا مواجه شد: ' + errorMessage);
            });

            filterAutomateCreationBtns();
        } else {
            enableSave();
        }
    }//

    //////////////FIRST LOAD//////////////////
    if (savedImport !== null) {
        savedImport = savedImport;
        currentDesignID = savedImport['id'];
        unitData = JSON.parse(savedImport['data']);
        importToProject(savedImport['design']);
        $('.layerName').val(unitData['name']);
        $('.location').val(unitData['location']);
        $('.layerQuantity').val(unitData['quantity']);
        loadLayerList();
        $('.preloadPage').addClass('d-none');
    } else {
        $('#ofcAddNew').offcanvas('show');
        $('.preloadPage').addClass('d-none');
    }//

    //////////////EVENTS//////////////////
    tool.onMouseDown = function (event) {

        $('[data-bs-toggle="tooltip"]').tooltip('hide');

        if (unitData.locked) {
            showMessage('یونیت قفل است. لطفا ابتدا قفل را بردارید');
            return;
        }

        layersLayout();

        selectedItem = false;
        paper.project.deselectAll();
        paper.project.activeLayer.selected = false;

        if (waitingToAddItemFlag) {
            glG.sendToBack();
        }

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

        if (event.item) {
            if (event.item.hasChildren()) {
                recuringSelectItem(event.item, event.point);
            } else {
                event.item.selected = true;
                selectedItem = event.item;
            }

            if (debug) {
                console.log(selectedItem);
            }

            //deletemode
            if (deleteMode && selectedItem) {
                $('.dellItem').trigger('click');
                return;
            }

            $('.layersLi').removeClass('text-danger');
            if (selectedItem) {
                $('.layer_' + selectedItem.id).addClass('text-danger');
            }
            //showgl should be after selectedItem
            showGLs();
            if (selectedItem.name == "mainFrame") {
                $('.frameConfig').show();
                $(".frameWidthInput").val(round2decimal(selectedItem.parent.bounds.width));
                $(".frameHeightInput").val(round2decimal(selectedItem.parent.bounds.height));
                $(".frameInput").val(selectedItem.data.profile);
                $(".cornicInput").val(selectedItem.data.cornic);
                $(".bottomdoorStat").val((selectedItem.data.bottomdoor > 0) ? 1 : 0);
                $(".bottomdoorValue").val(selectedItem.data.bottomdoor);
                $(".thresholdInput").val(selectedItem.data.threshold);
                $(".cornic_checkbox").prop("checked", false);
                let cornics = paper.project.activeLayer.getItem({
                    name: "cornic"
                });
                if (cornics) {
                    for (let i = 0; i < cornics.children.length; i++) {
                        $("#cornic_" + cornics.children[i].name).prop("checked", true);
                    }
                }
            } else if (selectedItem.name == "flat") {
                $('.glazingConfig').show();
                $('.glassConfig').show();
                $(".glassInput").val(selectedItem.data.glass);
                $(".glazingInput").val(selectedItem.data.glazing);
            } else if (selectedItem.name == "doorFrame") {
                rebuildAccessoryMenu(selectedItem.parent.name, selectedItem.data.accessory);
                $('.doorSashConfig').show();
                $('.accessoryConfig').show();
                $('.laceConfig').show();
                $(".doorSashInput").val(selectedItem.data.profile);
                $(".doorSashLock").val(selectedItem.data.lock);
                $(".accessoryInput").val(selectedItem.data.accessory);
                $(".accessoryTypeInput").val(selectedItem.data.accessoryType);
                $(".lockTypeInput").val(selectedItem.data.lockType);
                $(".laceInput").val(selectedItem.data.lace);
            } else if (selectedItem.name == "windowFrame") {
                if (event.modifiers.shift) {
                    event.preventDefault();
                    $('.toggleSashType').trigger('click');
                }
                rebuildAccessoryMenu(selectedItem.parent.name, selectedItem.data.accessory);
                $('.windowSashConfig').show();
                $('.accessoryConfig').show();
                $('.laceConfig').show();
                $(".windowSashInput").val(selectedItem.data.profile);
                $(".doorSashLock").val(selectedItem.data.lock);
                $(".accessoryInput").val(selectedItem.data.accessory);
                $(".accessoryTypeInput").val(selectedItem.data.accessoryType);
                $(".lockTypeInput").val(selectedItem.data.lockType);
                $(".laceInput").val(selectedItem.data.lace);
            } else if (selectedItem.name == "vCoupling" || selectedItem.name == "hCoupling") {
                $('.couplingConfig').show();
                $(".couplingInput").val(selectedItem.data.profile);
            } else if (selectedItem.name == "vPanel" || selectedItem.name == "hPanel") {
                $('.panelConfig').show();
                $('.glazingConfig').show();
                $(".panelInput").val(selectedItem.data.profile);
                $(".glazingInput").val(selectedItem.data.glazing);
            } else if (selectedItem.name == "vMullian" || selectedItem.name == "hMullian") {
                $('.mullianConfig').show();
                $('.positionConfig').show();
                if (selectedItem.name == "vMullian") {
                    $('.positionConfigInput').val(round2decimal(selectedItem.bounds.left + frameSize / 2));
                } else {
                    $('.positionConfigInput').val(round2decimal(selectedItem.bounds.top + +frameSize / 2));
                }
                $(".mullianInput").val(selectedItem.data.profile);
            } else if (["mXBarT", "mYBarT"].includes(selectedItem.name)) {
                let sectionID = selectedItem.data.section;
                let section = paper.project.activeLayer.getItem({
                    id: sectionID
                });
                let mXBarT, mYBarT;
                let dbG = paper.project.activeLayer.getItem({
                    name: "dbG"
                });
                for (let n = 0; n < dbG.children.length; n++) {
                    if (dbG.children[n].name == "mXBarT" && dbG.children[n].data.section == sectionID) {
                        mXBarT = dbG.children[n];
                    }
                    if (dbG.children[n].name == "mYBarT" && dbG.children[n].data.section == sectionID) {
                        mYBarT = dbG.children[n];
                    }
                }
                let mXBarT_Text = parseInt(mXBarT.content.match(/\d+/)[0]);
                let mYBarT_Text = parseInt(mYBarT.content.match(/\d+/)[0]);

                Swal.fire({
                    title: "اندازه جدید:",
                    html: '<div class="row"><div class="col-6"><label>عرض:</label><input id="mXBarT-input" class="swal2-input" type="number" value="' + mXBarT_Text + '"></div>' +
                        '<div class="col-6"><label>ارتفاع:</label><input id="mYBarT-input" class="swal2-input" type="number" value="' + mYBarT_Text + '"></div></div>',
                    preConfirm: function () {
                        return new Promise(function (resolve) {
                            resolve([
                                $('#mXBarT-input').val(),
                                $('#mYBarT-input').val()
                            ])
                        })
                    },
                    onOpen: function () {
                        $('#mXBarT-input').focus();
                        $('#mYBarT-input, #mXBarT-input').on('keypress', function (e) {
                            if (e.which === 13) { // 13 = Enter key
                                e.preventDefault();
                                Swal.clickConfirm();
                            }
                        });
                    },
                }).then((result) => {
                    if (result.value) {
                        reDrawMainFrame(section, result.value)
                    }
                });
            } else if (selectedItem.name == "vMGLT") {
                Swal.fire({
                    title: "اندازه جدید:",
                    input: 'number',
                    inputPlaceholder: vMGLT.content
                }).then((result) => {
                    if (result.value) {
                        selectedItem = previousSelectedItem;
                        changeMullianPosition(new paper.Point(Number(result.value), selectedItem.bounds.centerY));
                        hideGLs();
                    }
                });
            } else if (selectedItem.name == "vMGRT") {
                Swal.fire({
                    title: "اندازه جدید:",
                    input: 'number',
                    inputPlaceholder: vMGRT.content
                }).then((result) => {
                    if (result.value) {
                        selectedItem = previousSelectedItem;
                        changeMullianPosition(new paper.Point((mainFrame.bounds.x + mainFrame.bounds.width - result.value), selectedItem.bounds.centerY));
                        hideGLs();
                    }
                });
            } else if (selectedItem.name == "hMGTT") {
                Swal.fire({
                    title: "اندازه جدید:",
                    input: 'number',
                    inputPlaceholder: hMGTT.content
                }).then((result) => {
                    if (result.value) {
                        selectedItem = previousSelectedItem;
                        changeMullianPosition(new paper.Point(selectedItem.bounds.centerX, Number(result.value)));
                        hideGLs();
                    }
                });
            } else if (selectedItem.name == "hMGBT") {
                Swal.fire({
                    title: "اندازه جدید:",
                    input: 'number',
                    inputPlaceholder: hMGBT.content
                }).then((result) => {
                    if (result.value) {
                        selectedItem = previousSelectedItem;
                        changeMullianPosition(new paper.Point((selectedItem.bounds.centerX, mainFrame.bounds.y + mainFrame.bounds.height - result.value)));
                        hideGLs();
                    }
                });
            } else if (selectedItem.name == "xBarT") {
                Swal.fire({
                    title: "اندازه جدید:",
                    input: 'number',
                    inputPlaceholder: selectedItem.content
                }).then((result) => {
                    if (result.value) {
                        changeMullianPositionByNumber({
                            from: selectedItem.data.position,
                            to: selectedItem.data.position + (result.value - selectedItem.content),
                            label: selectedItem.content,
                            mullianType: "vMullian",
                            sectionID: selectedItem.data.section
                        });
                    }
                });
            } else if (selectedItem.name == "yBarT") {
                Swal.fire({
                    title: "اندازه جدید:",
                    input: 'number',
                    inputPlaceholder: selectedItem.content
                }).then((result) => {
                    if (result.value) {
                        changeMullianPositionByNumber({
                            from: selectedItem.data.position,
                            to: selectedItem.data.position + (result.value - selectedItem.content),
                            label: selectedItem.content,
                            mullianType: "hMullian",
                            sectionID: selectedItem.data.section
                        });
                    }
                });
            }
            //show details on itemDetails
            itemDetailsBar(selectedItem);
        } else {
            paper.project.deselectAll();
            paper.project.activeLayer.selected = false;
            selectedItem = false;
            $('.itemDetails').html('');
        }
    }//
    tool.onMouseUp = function (event) {
        $(".unitOptions").removeClass('position-fixed unitOptionsExtra');
        $(".unitOptions").css({ 'left': 'auto', 'top': 'auto' });
        if (changeMullianPositionFlag) {
            changeMullianPositionFlag = false;
            changeMullianPosition(new paper.Point(Math.ceil(event.point.x / moveStepFactor) * moveStepFactor, Math.ceil(event.point.y / moveStepFactor) * moveStepFactor));
            hideGLs();
        } else if (changeWindowDoorPanelPositionFlag) {
            changeWindowDoorPanelPositionFlag = false;
            changeWindowDoorPanelPosition(new paper.Point(Math.ceil(event.point.x / moveStepFactor) * moveStepFactor, Math.ceil(event.point.y / moveStepFactor) * moveStepFactor));
            hideGLs();
        } else if (waitingToAddItemFlag) {
            waitingToAddItemFlag = false;
            addNewItem(addNewItemType, selectedItem, new paper.Point(Math.ceil(event.point.x / moveStepFactor) * moveStepFactor, Math.ceil(event.point.y / moveStepFactor) * moveStepFactor))
            paper.project.activeLayer.selected = false;
            selectedItem = false;
        } else if (tryingToDrag) {
            tryingToDrag = false;
            hideGLs();
        }
        document.body.style.cursor = "default";
        mouseHelperHide();
    }//
    tool.onMouseMove = function (event) {
        if (waitingToAddItemFlag || changeMullianPositionFlag || changeWindowDoorPanelPositionFlag) {
            showGLs(event);
        }
        $('.mousePosition').html('<span class="small ms-1">x:' + Math.round(event.point.x) + ' y:' + Math.round(event.point.y) + '</span>');
    };//
    tool.onMouseDrag = function (event) {
        if (event.modifiers.alt && selectedItem && !deleteMode) {
            if (selectedItem.name == "vMullian" || selectedItem.name == "hMullian") {
                tryingToDrag = true;
                showGLs(event);
                changeMullianPositionFlag = true;
            } else if (["windowFrame", "doorFrame", "vPanel", "hPanel"].includes(selectedItem.name)) {
                tryingToDrag = true;
                showGLs(event);
                changeWindowDoorPanelPositionFlag = true;
            } else {
                paper.view.center = event.downPoint.subtract(event.point).add(paper.view.center);
            }
        } else {
            paper.view.center = event.downPoint.subtract(event.point).add(paper.view.center);
        }
    };//
    tool.onKeyDown = function (event) {
        let ofcAddNew = $('#ofcAddNew').css('visibility');

        if (ofcAddNew !== 'visible' && !$('input').is(':focus')) {
            if (event.key == "escape") {
                cancelAll();
            }
            if (event.modifiers.shift && event.key == "v") {
                event.preventDefault();
                $('.vMullianEualling').trigger('click');
            }
            if (event.modifiers.shift && event.key == "h") {
                event.preventDefault();
                $('.hMullianEualling').trigger('click');
            }
            if (event.modifiers.control && event.key == "s") {
                event.preventDefault();
                $('#saveProject:visible').trigger('click');
            }
            if (event.modifiers.control && event.key == "z") {
                $('.undo:visible').trigger('click');
            }
            if (event.modifiers.control && event.key == "y") {
                $('.redo:visible').trigger('click');
            }
            if (event.key == "delete") {
                $('.dellItem').trigger('click');
            }
            if (event.key == "u") {
                $(".addNewLayer:visible").trigger('click');
            }
            if (event.key == "m") {
                $("button[data-bs-target='#ofcMullian']:visible").trigger('click');
            }
            if (event.key == "w") {
                $("button[data-bs-target='#ofcWindow']:visible").trigger('click');
            }
            if (event.key == "d") {
                $("button[data-bs-target='#ofcDoor']:visible").trigger('click');
            }
            if (event.key == "s" && !event.modifiers.control) {
                $("button[data-bs-target='#ofcSlide']:visible").trigger('click');
            }
            if (event.key == "p") {
                $("button[data-bs-target='#ofcPanel']:visible").trigger('click');
            }
            if (event.key == "o") {
                $("button[data-bs-target='#ofcCoupling']:visible").trigger('click');
            }
            if (event.modifiers.shift) {
                shiftKeyPressed = true;
            }
            if (event.modifiers.control) {
                ctrlKeyPressed = true;
            }
        }

    }//
    tool.onKeyUp = function (event) {
        shiftKeyPressed = false;
        ctrlKeyPressed = false;
    }//
    $('#myCanvas').mousewheel(function (event) {
        var oldZoom = paper.view.zoom;
        var newZoom = event.deltaY > 0 ? oldZoom * 1.1 : oldZoom / 1.1;
        paper.view.zoom = newZoom;
        $('#rangeInput').val(paper.view.zoom);
    });//

    //////////////FUNCTIONS//////////////////

    //change layer by click layer on sideMenu
    async function changeLayerById(designID) {
        //save previous works
        await saveDesign(currentDesignID).then(function (message) {
            if (typeof message !== "undefined") {
                showMessage(message);
            }
        }).catch(function (error) {
            let errorMessage = "خطایی در ارتباط با سرور رخ داده است.";
            if (error.status === 0) {
                errorMessage = "اتصال اینترنت خود را بررسی کنید!";
            } else if (error.responseJSON && error.responseJSON.message) {
                errorMessage = error.responseJSON.message;
            }
            showMessage('ذخیره با خطا مواجه شد: ' + errorMessage);
        });
        Swal.fire({
            title: '<i class="ti ti-refresh icon icon-lg icon-rotate"></i>',
            text: "در حال دریافت اطلاعات...",
            footer: "شکیبا باشید",
            showConfirmButton: false,
            allowOutsideClick: false,
            //timer: 5000,
        });

        //load new design
        $.ajax({
            url: loadDesignRoute,
            type: "POST",
            data: {
                _token: $('meta[name="csrf-token"]').attr('content'),
                designID: designID
            },
            cache: false,
            success: function (dataResult) {
                currentDesignID = dataResult['id'];
                unitData = JSON.parse(dataResult['data']);
                frameColor = unitData['profile_color_hex'];
                importToProject(dataResult['design']);
                $('.layerName').val(unitData['name']);
                $('.location').val(unitData['location']);
                $('.layerQuantity').val(unitData['quantity']);
                Swal.close()
                history = [];
                history_index = 0;
                loadLayerList();
            },
            error: function (error) {
                Swal.close()
                let errorMessage = "خطایی در ارتباط با سرور رخ داده است.";
                if (error.status === 0) {
                    errorMessage = "اتصال اینترنت خود را بررسی کنید!";
                } else if (error.responseJSON && error.responseJSON.message) {
                    errorMessage = error.responseJSON.message;
                }
                showMessage(errorMessage);
            }
        });
        cancelAll();
    }//

    //build main frame
    function buildFrame(tmpShape, newFrameSize = false, mainFrameData = false) {
        let testframeSize = firstFrame_width;
        if (!testframeSize) {
            showMessage('بنظر می رسد این پروفیل شامل فریم نمی باشد. اگر این مورد اشتباه است به مدیریت جهت اصلاح اطلاع دهید.');
            return;
        }
        frameSize = testframeSize;
        frameColor = unitData['profile_color_hex'];

        mainSection = new paper.Group();
        mainSection.name = "section";

        if (newFrameSize) frameSize = newFrameSize;
        if (mainFrameData) frameSize = mainFrameData.profile_width;

        //Create Flat by offset main shape
        mainFlat = PaperOffset.offset(tmpShape, -frameSize);
        mainFlat.fillColor = "#4fc3f724";
        mainFlat.name = 'mainFlat';
        mainSection.addChild(mainFlat);

        //botomdoor
        if (mainFrameData.bottomdoor > 0) {
            let scaleY = (mainFlat.bounds.height + frameSize - mainFrameData.bottomdoor) / mainFlat.bounds.height;
            mainFlat.scale(1, scaleY);
            mainFlat.bounds.y = frameSize;
        }

        let firstFlat = mainFlat.clone();
        firstFlat.fillColor = flatColor;
        firstFlat.name = 'flat';
        setDefaultData(firstFlat, 'flat');
        mainSection.addChild(firstFlat);

        //Create Frame
        mainFrame = tmpShape.subtract(mainFlat);
        mainFrame.children[0].name = "mainFlat";
        mainFrame.children[1].name = "mainFlat";
        mainFrame.strokeColor = strokeColor;
        mainFrame.fillColor = frameColor;
        mainFrame.name = 'mainFrame';
        setDefaultData(mainFrame, 'mainFrame');
        if (mainFrameData) {
            mainFrame.data = mainFrameData;
        }

        $.each(mainFrame.children[0].segments, function (key, value) {
            let nearestPoint = mainFrame.children[1].getNearestPoint(value.point);
            if (nearestPoint) {
                let fromPoint = value.point;
                let toPoint = nearestPoint;
                let frameCutLine = new paper.Path.Line({
                    from: (mainFrameData.bottomdoor > 0 && fromPoint.y == mainFrame.bounds.height) ? [toPoint.x, fromPoint.y] : fromPoint,
                    to: toPoint,
                    name: 'frameCutLine'
                });
                mainFrame.addChild(frameCutLine);
            }
        });

        mainSection.addChild(mainFrame);

        mainFlat.remove()
        tmpShape.remove()

        createGLs();
        createDimensionBar();
        setZoom();

        return mainSection;
    }//

    //Mullian guidelines
    function createGLs() {
        let previousGlG = paper.project.activeLayer.getItem({
            name: "glG"
        });
        if (previousGlG) {
            previousGlG.remove();
        }
        glG = new paper.Group();
        glG.name = "glG";

        vMGL = new paper.Path.Line(new paper.Point(mainSection.bounds.x, mainSection.bounds.y), new paper.Point(mainSection.bounds.x, mainSection.bounds.y + mainSection.bounds.height));
        vMGL.strokeColor = glColor;
        vMGL.strokeWidth = 5;
        vMGL.fillColor = glColor;
        vMGL.name = 'vMGL';
        glG.addChild(vMGL);

        vMGLT = new paper.PointText(new paper.Point(mainSection.bounds.x, mainSection.bounds.y - 150));
        vMGLT.content = 0;
        vMGLT.fillColor = glColor;
        vMGLT.fontSize = 60;
        vMGLT.name = 'vMGLT';
        glG.addChild(vMGLT);

        vMGRT = new paper.PointText(new paper.Point(mainSection.bounds.x, mainSection.bounds.y - 150));
        vMGRT.content = 0;
        vMGRT.fillColor = glColor;
        vMGRT.fontSize = 60;
        vMGRT.name = 'vMGRT';
        glG.addChild(vMGRT);

        hMGL = new paper.Path.Line(new paper.Point(mainSection.bounds.x, mainSection.bounds.y), new paper.Point(mainSection.bounds.x + mainSection.bounds.width, mainSection.bounds.y));
        hMGL.strokeColor = glColor;
        hMGL.strokeWidth = 5;
        hMGL.fillColor = glColor;
        hMGL.name = 'hMGL';
        glG.addChild(hMGL);

        hMGTT = new paper.PointText(new paper.Point(mainSection.bounds.x - 150, mainSection.bounds.y));
        hMGTT.content = 0;
        hMGTT.fillColor = glColor;
        hMGTT.fontSize = 60;
        hMGTT.name = 'hMGTT';
        glG.addChild(hMGTT);

        hMGBT = new paper.PointText(new paper.Point(mainSection.bounds.x - 150, mainSection.bounds.y));
        hMGBT.content = 0;
        hMGBT.fillColor = glColor;
        hMGBT.fontSize = 60;
        hMGBT.name = 'hMGBT';
        glG.addChild(hMGBT);

        glG.visible = false;

    }//

    function cancelAll() {
        paper.project.deselectAll();
        waitingToAddItemFlag = false;
        paper.project.activeLayer.selected = false;
        selectedItem = false;
        deleteMode = false;
        $('.dellItem').removeClass('text-danger');
        mouseHelperHide();
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
        hideGLs();
    }//

    function showGLs(event) {
        if (flatHover) flatHover.remove();
        if (mouseHelperClone) mouseHelperClone.remove();

        //find section base on event point
        let selectedSection;
        let allSections = paper.project.activeLayer.getItems({
            name: "section"
        });
        if (allSections.length == 1) {
            selectedSection = allSections[0];
        } else {
            selectedSection = mainSection;
            let toCheckPoint;
            if (event) {
                toCheckPoint = event.point;
            } else {
                toCheckPoint = selectedItem.bounds.center;
            }
            $.each(allSections, function (s, sec) {
                if (sec.contains(toCheckPoint)) {
                    selectedSection = sec;
                    return;
                }
            });
        }

        hMGL.bounds.width = selectedSection.bounds.width;
        vMGL.bounds.height = selectedSection.bounds.height;
        glG.visible = true;
        vMGL.visible = true;
        vMGLT.visible = true;
        vMGRT.visible = true;
        hMGL.visible = true;
        hMGTT.visible = true;
        hMGBT.visible = true;
        glG.bringToFront();
        vMGL.bringToFront();
        vMGLT.bringToFront();
        vMGRT.bringToFront();
        hMGL.bringToFront();
        hMGTT.bringToFront();
        hMGBT.bringToFront();

        if (event) {
            let hitFlat = false;
            let flats = paper.project.activeLayer.getItems({ name: "flat" });
            $.each(flats, function (key, flat) {
                if (flat.hitTest(event.point)) {
                    hitFlat = flat;
                    return;
                }
            });
            if (hitFlat) {
                flatHover = hitFlat.clone();
                flatHover.fillColor = flatHoverColor;
                if (waitingToAddItemFlag) {
                    mouseHelperSetColor('info', 'محل نصب را مشخص نمایید');
                } else {
                    mouseHelperSetColor('info', 'بگیرید و به مکان مورد نظر بکشید');
                    mouseHelperClone = (['vMullian', 'hMullian'].includes(selectedItem.name)) ? selectedItem.clone() : selectedItem.parent.clone();
                    mouseHelperClone.scale(0.5);
                    mouseHelperClone.parent = paper.project.activeLayer;
                    mouseHelperClone.position = new paper.Point(event.point.x, event.point.y);
                }
                document.body.style.cursor = "grabbing";
            } else {
                mouseHelperSetColor('warning', '<i class="ti ti-trash icon"></i>');
                document.body.style.cursor = "removing";
            }
        }

        moveStepFactor = shiftKeyPressed ? 1 : 5;

        if ((event && waitingToAddItemFlag && (addNewItemType == "vMullian" || addNewItemType == "fullvMullian")) || (selectedItem && selectedItem.name == "vMullian")) {
            let itemXCenter = event ? Math.ceil(event.point.x / moveStepFactor) * moveStepFactor : selectedItem.bounds.centerX;
            hMGL.position = new paper.Point(selectedSection.bounds.centerX, selectedSection.bounds.y + frameSize);
            vMGL.position = new paper.Point(itemXCenter, selectedSection.bounds.centerY);
            vMGLT.position = new paper.Point((selectedSection.bounds.x + itemXCenter) / 2, selectedSection.bounds.y - 50);
            vMGLT.content = round2decimal(itemXCenter - selectedSection.bounds.x);
            vMGRT.position = new paper.Point(itemXCenter + (selectedSection.bounds.x + selectedSection.bounds.width - itemXCenter) / 2, selectedSection.bounds.y - 50);
            vMGRT.content = round2decimal(selectedSection.bounds.x + selectedSection.bounds.width - itemXCenter);
            hMGTT.visible = false;
            hMGBT.visible = false;
        } else if ((event && waitingToAddItemFlag && (addNewItemType == "hMullian" || addNewItemType == "fullhMullian")) || (selectedItem && selectedItem.name == "hMullian")) {
            let itemYCenter = event ? Math.ceil(event.point.y / moveStepFactor) * moveStepFactor : selectedItem.bounds.centerY;
            vMGL.position = new paper.Point(selectedSection.bounds.x + selectedSection.bounds.width - frameSize, selectedSection.bounds.centerY);
            hMGL.position = new paper.Point(selectedSection.bounds.centerX, itemYCenter);
            hMGTT.position = new paper.Point(selectedSection.bounds.x + selectedSection.bounds.width + 60, itemYCenter / 2);
            hMGTT.content = round2decimal(itemYCenter);
            hMGBT.position = new paper.Point(selectedSection.bounds.x + selectedSection.bounds.width + 60, itemYCenter + (selectedSection.bounds.height - itemYCenter) / 2);
            hMGBT.content = round2decimal(selectedSection.bounds.height - itemYCenter);
            vMGLT.visible = false;
            vMGRT.visible = false;
        } else if (event && waitingToAddItemFlag) {
            let itemXCenter = event.point.x;
            let itemYCenter = event.point.y;
            vMGL.position = new paper.Point(itemXCenter, selectedSection.bounds.centerY);
            vMGLT.position = new paper.Point(itemXCenter / 2, selectedSection.bounds.y - 100);
            vMGLT.content = round2decimal(itemXCenter);
            vMGRT.position = new paper.Point(itemXCenter + (selectedSection.bounds.width - itemXCenter) / 2, selectedSection.bounds.y - 100);
            vMGRT.content = round2decimal(selectedSection.bounds.width - itemXCenter);
            hMGL.position = new paper.Point(selectedSection.bounds.centerX, itemYCenter);
            hMGTT.position = new paper.Point(selectedSection.bounds.x + selectedSection.bounds.width + 60, itemYCenter / 2);
            hMGTT.content = round2decimal(itemYCenter);
            hMGBT.position = new paper.Point(selectedSection.bounds.x + selectedSection.bounds.width + 60, itemYCenter + (selectedSection.bounds.height - itemYCenter) / 2);
            hMGBT.content = round2decimal(selectedSection.bounds.height - itemYCenter);
            hMGTT.visible = false;
            hMGBT.visible = false;
            vMGLT.visible = false;
            vMGRT.visible = false;
            if (addNewItemType == "lace") {
                mouseHelperSetColor('info', 'فریم یک بازشو را انتخاب کنید');
            } else {
                mouseHelperSetColor('info', 'محل نصب را مشخص نمایید');
            }
        } else if (selectedItem && selectedItem.name == "gl") {
            vMGL.visible = false;
            vMGLT.visible = false;
            vMGRT.visible = false;
            hMGL.visible = false;
            hMGTT.visible = false;
            hMGBT.visible = false;
            selectedItem.visible = true;
        } else {
            vMGL.visible = false;
            vMGLT.visible = false;
            vMGRT.visible = false;
            hMGL.visible = false;
            hMGTT.visible = false;
            hMGBT.visible = false;
        }

    }//

    function hideGLs() {
        glG.visible = false;
        selectedItem = false;
        paper.project.activeLayer.selected = false;
        if (flatHover) flatHover.remove();
        if (mouseHelperClone) mouseHelperClone.remove();
        mouseHelperHide();
    }//

    //addNewItem
    function addNewItem(addNewItemType, flatToAdd, toAddPoint = false) {
        frameColor = unitData['profile_color_hex'];
        if (addNewItemType == "lace") {
            addLace(flatToAdd, Number($('.laceInput[data-id="lace"] option:not([disabled]):eq(1)').val()));
        } else {
            if (flatToAdd && (flatToAdd.name == "flat")) {
                if (addNewItemType == 'vMullian' || addNewItemType == 'hMullian') {
                    if ((addNewItemType == 'vMullian' && flatToAdd.bounds.width > 120) || (addNewItemType == 'hMullian' && flatToAdd.bounds.height > 120)) {
                        if (shiftKeyPressed) {
                            let centerPoint = new paper.Point(flatToAdd.bounds.x + flatToAdd.bounds.width / 2, flatToAdd.bounds.y + flatToAdd.bounds.height / 2);
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
                        let firstAddingPoint = new paper.Point(flatToAdd.bounds.x + flatPartWidth - frameSize / 6, flatToAdd.bounds.centerY);
                        let secondAddingPoint = new paper.Point(flatToAdd.bounds.x + flatPartWidth * 2 + frameSize / 6, flatToAdd.bounds.centerY);

                        //add First Mullian
                        addMullian('vMullian', flatToAdd, firstAddingPoint, flatToAdd.parent);

                        //add Second Mullian
                        let allFlats = paper.project.activeLayer.getItems({ name: "flat" });
                        $.each(allFlats, function (key, findNewFlat) {
                            if (findNewFlat.hitTest(secondAddingPoint)) {
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
                        let firstAddingPoint = new paper.Point(flatToAdd.bounds.x + flatPartWidth - frameSize / 4, flatToAdd.bounds.centerY);
                        let secondAddingPoint = new paper.Point(flatToAdd.bounds.x + flatPartWidth * 2, flatToAdd.bounds.centerY);
                        let thirdAddingPoint = new paper.Point(flatToAdd.bounds.x + flatPartWidth * 3 + frameSize / 4, flatToAdd.bounds.centerY);

                        //add First Mullian
                        addMullian('vMullian', flatToAdd, firstAddingPoint, flatToAdd.parent);

                        //add Second Mullian
                        let allFlats = paper.project.activeLayer.getItems({ name: "flat" });
                        $.each(allFlats, function (key, findNewFlat) {
                            if (findNewFlat.hitTest(secondAddingPoint)) {
                                addMullian('vMullian', findNewFlat, secondAddingPoint, findNewFlat.parent);
                            }
                        });

                        //add Third Mullian
                        allFlats = paper.project.activeLayer.getItems({ name: "flat" });
                        $.each(allFlats, function (key, findNewFlat) {
                            if (findNewFlat.hitTest(thirdAddingPoint)) {
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
                        let firstAddingPoint = new paper.Point(flatToAdd.bounds.centerX, flatToAdd.bounds.y + flatPartHeight - frameSize / 6);
                        let secondAddingPoint = new paper.Point(flatToAdd.bounds.centerX, flatToAdd.bounds.y + flatPartHeight * 2 + frameSize / 6);

                        //add First Mullian
                        addMullian('hMullian', flatToAdd, firstAddingPoint, flatToAdd.parent);

                        //add Second Mullian
                        let allFlats = paper.project.activeLayer.getItems({ name: "flat" });
                        $.each(allFlats, function (key, findNewFlat) {
                            if (findNewFlat.hitTest(secondAddingPoint)) {
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
                        let firstAddingPoint = new paper.Point(flatToAdd.bounds.centerX, flatToAdd.bounds.y + flatPartHeight - frameSize / 4);
                        let secondAddingPoint = new paper.Point(flatToAdd.bounds.centerX, flatToAdd.bounds.y + flatPartHeight * 2);
                        let thirdAddingPoint = new paper.Point(flatToAdd.bounds.centerX, flatToAdd.bounds.y + flatPartHeight * 3 + frameSize / 4);

                        //add First Mullian
                        addMullian('hMullian', flatToAdd, firstAddingPoint, flatToAdd.parent);

                        //add Second Mullian
                        let allFlats = paper.project.activeLayer.getItems({ name: "flat" });
                        $.each(allFlats, function (key, findNewFlat) {
                            if (findNewFlat.hitTest(secondAddingPoint)) {
                                addMullian('hMullian', findNewFlat, secondAddingPoint, findNewFlat.parent);
                            }
                        });

                        //add Third Mullian
                        allFlats = paper.project.activeLayer.getItems({ name: "flat" });
                        $.each(allFlats, function (key, findNewFlat) {
                            if (findNewFlat.hitTest(thirdAddingPoint)) {
                                addMullian('hMullian', findNewFlat, thirdAddingPoint, findNewFlat.parent);
                            }
                        });
                    } else {
                        showMessage('صفحه بیش از اندازه کوچک است');
                    }

                } else if (addNewItemType == 'fullhMullian') {
                    let toAddCenterPosition = toAddPoint.y;
                    if (shiftKeyPressed) {
                        toAddCenterPosition = flatToAdd.bounds.y + flatToAdd.bounds.height / 2;
                    }
                    //first Draw a test Line for find future flats
                    let from = new paper.Point(paper.project.activeLayer.bounds.left, toAddCenterPosition);
                    let to = new paper.Point(paper.project.activeLayer.bounds.right, toAddCenterPosition);
                    let tempLine = new state.paper.Path.Line(from, to);
                    tempLine.name = "temp";
                    // tempLine.strokeColor = 'black';

                    let allFlats = paper.project.activeLayer.getItems({ name: "flat" });
                    $.each(allFlats, function (key, flat) {
                        if (tempLine.intersects(flat)) {
                            addMullian('hMullian', flat, new paper.Point(flat.bounds.centerX, toAddCenterPosition), flat.parent);
                            findFlat = true;
                            return;
                        }
                    });
                    tempLine.remove();

                } else if (addNewItemType == 'fullvMullian') {
                    let toAddCenterPosition = toAddPoint.x;
                    if (shiftKeyPressed) {
                        toAddCenterPosition = flatToAdd.bounds.x + flatToAdd.bounds.width / 2;
                    }
                    //first Draw a test Line for find future flats
                    let from = new paper.Point(toAddCenterPosition, paper.project.activeLayer.bounds.top);
                    let to = new paper.Point(toAddCenterPosition, paper.project.activeLayer.bounds.bottom);
                    let tempLine = new state.paper.Path.Line(from, to);
                    tempLine.name = "temp";
                    //tempLine.strokeColor = 'black';

                    let allFlats = paper.project.activeLayer.getItems({ name: "flat" });
                    $.each(allFlats, function (key, flat) {
                        if (tempLine.intersects(flat)) {
                            addMullian('vMullian', flat, new paper.Point(toAddCenterPosition, flat.bounds.centerY), flat.parent);
                            findFlat = true;
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

                paper.project.deselectAll();
                cancelAll();
                createDimensionBar();
                saveHistory();
            } else {
                showMessage('لطفا یک صفحه را انتخاب کنید');
                hideGLs();
            }
        }

        if (!$('#glassBox').hasClass('closed')) {
            $('#glassBox').addClass('closed');
            $('#toggleIcon').html('<i class="ti ti-chevron-left"></i>');
        }

        paper.project.deselectAll();
        mouseHelperHide();
    }//

    //add mullian function
    function addMullian(addNewItemType, flatToAdd, toAddPoint = false, toAddGroup = false, data = false, frameWidth = false) { //data = mullian data
        let testframeSize = (frameWidth) ? frameWidth : firstMullian_width;
        testframeSize = (data) ? data.profile_width : testframeSize;
        if (!testframeSize) {
            showMessage('بنظر می رسد این پروفیل شامل مولین نمی باشد. اگر این مورد اشتباه است به مدیریت جهت اصلاح اطلاع دهید.');
            return;
        }
        frameSize = testframeSize;
        frameColor = unitData['profile_color_hex'];

        let stratPoint, tempMullian;
        if (addNewItemType == 'vMullian') {
            if (toAddPoint) {
                stratPoint = new paper.Point(round2decimal(toAddPoint.x - frameSize / 2), flatToAdd.bounds.y)
            } else {
                stratPoint = new paper.Point(round2decimal(flatToAdd.bounds.x + (flatToAdd.width / 2) - (frameSize / 2)), flatToAdd.bounds.y)
            }
            //create tempMullian
            tempMullian = new paper.Path.Rectangle(stratPoint, new paper.Size(frameSize, flatToAdd.bounds.height));
            tempMullian.closed = true;
        } else {
            if (toAddPoint) {
                stratPoint = new paper.Point(flatToAdd.bounds.x, round2decimal(toAddPoint.y - frameSize / 2))
            } else {
                stratPoint = new paper.Point(flatToAdd.bounds.x, round2decimal(flatToAdd.bounds.y + (flatToAdd.bounds.height / 2) - (frameSize / 2)))
            }
            //create tempMullian
            tempMullian = new paper.Path.Rectangle(stratPoint, new paper.Size(flatToAdd.bounds.width, frameSize));
            tempMullian.closed = true;
        }

        //create mullian
        let mullian = flatToAdd.intersect(tempMullian);
        mullian.strokeColor = strokeColor;
        mullian.fillColor = frameColor;
        let tween = mullian.tweenTo({
            fillColor: tweenFillColor
        }, 250);
        tween.then(function () {
            mullian.tweenTo({
                fillColor: frameColor
            }, 250);
        });
        mullian.name = addNewItemType;
        setDefaultData(mullian, 'mullian');
        if (data) {
            mullian.data = data;
        }
        mullian.data.profile_width = frameSize;

        //create and spilit flat
        let tmpFlat = flatToAdd.subtract(tempMullian, {
            insert: false
        });
        tempMullian.remove();

        if (tmpFlat.hasChildren() && tmpFlat.children.length == 2) {
            let flat1 = new paper.Path(tmpFlat.children[0].getPathData());
            flat1.fillColor = flatToAdd.fillColor;
            flat1.name = 'flat';
            setDefaultData(flat1, 'flat');
            flat1.data.glass = flatToAdd.data.glass;
            flat1.data.glazing = flatToAdd.data.glazing;

            let flat2 = new paper.Path(tmpFlat.children[1].getPathData());
            flat2.fillColor = flatToAdd.fillColor;
            flat2.name = 'flat';
            setDefaultData(flat2, 'flat');
            flat2.data.glass = flatToAdd.data.glass;
            flat2.data.glazing = flatToAdd.data.glazing;

            flatToAdd.name = "base";
            let baseGroup = new paper.Group();
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
        enableSave();
        return mullian;
    }//

    //add Lace
    function addLace(selectedItem, laceID = 0) { // lace ID is components lace id for frame
        if (selectedItem.name == "windowFrame" || selectedItem.name == "doorFrame") {
            let hasLace = selectedItem.parent.getItem({ name: 'lace' });
            if (!hasLace) {
                let panelGroup = new paper.Group();
                panelGroup.name = "lace";
                let fromPosition = selectedItem.bounds.x + laceSize;
                let toPosition = selectedItem.bounds.x + selectedItem.bounds.width;
                for (let index = fromPosition; index < toPosition; index += laceSize) {
                    let tempPanelLines = new paper.Path();
                    tempPanelLines.moveTo(index, selectedItem.bounds.y);
                    tempPanelLines.lineTo(index, selectedItem.bounds.y + selectedItem.bounds.height);
                    tempPanelLines.strokeColor = laceColor;
                    let intersections = selectedItem.getIntersections(tempPanelLines);
                    tempPanelLines.remove();
                    if (intersections.length > 1) {
                        let panelLine = new paper.Path();
                        panelLine.moveTo(intersections[0].point);
                        panelLine.lineTo(intersections[1].point);
                        panelLine.strokeColor = laceColor;
                        panelLine.name = 'laceLine';
                        panelGroup.addChild(panelLine);
                    }
                }
                let fromPosition2 = selectedItem.bounds.y + laceSize;
                let toPosition2 = selectedItem.bounds.y + selectedItem.bounds.height;
                for (let index = fromPosition2; index < toPosition2; index += laceSize) {
                    let tempPanelLines = new paper.Path();
                    tempPanelLines.moveTo(selectedItem.bounds.x, index);
                    tempPanelLines.lineTo(selectedItem.bounds.x + selectedItem.bounds.width, index);
                    tempPanelLines.strokeColor = laceColor;
                    let intersections = selectedItem.getIntersections(tempPanelLines);
                    tempPanelLines.remove();
                    if (intersections.length > 1) {
                        var panelLine = new paper.Path();
                        panelLine.moveTo(intersections[0].point);
                        panelLine.lineTo(intersections[1].point);
                        panelLine.strokeColor = laceColor;
                        panelLine.name = 'laceLine';
                        panelGroup.addChild(panelLine);
                    }
                }
                selectedItem.parent.addChild(panelGroup);
                selectedItem.data.lace = laceID;
                enableSave();
            }
        } else {
            showMessage('لطفا سش یک بازشو را برای اضافه کردن توری انتخاب کنید')
        }
    }//

    //remove Lace
    function removeLace(selectedItem) {
        if (selectedItem) {
            let lace = selectedItem.parent.getItem({ name: "lace" });
            selectedItem.data.lace = 0;
            if (lace) lace.remove();
            enableSave();
        }
    }//

    //add Panel
    function addPanel(addNewItemType, flatToAdd, toAddGroup = false, data = false) {

        panelColor = unitData['profile_color_hex'];
        panelSize = (data) ? data.profile_width : firstPanel_width;

        if (!panelSize) {
            showMessage('بنظر می رسد این پروفیل شامل پنل نمی باشد. اگر این مورد اشتباه است به مدیریت جهت اصلاح اطلاع دهید.');
            return;
        }

        let panelGroup = new paper.Group();
        panelGroup.name = addNewItemType;
        setDefaultData(panelGroup, 'panel');
        if (data) {
            panelGroup.data = data;
        }
        panelGroup.data.profile_width = panelSize;

        //panelBase
        let panelBase = flatToAdd.clone();
        panelBase.name = "panelBase";
        panelBase.fillColor = panelColor;
        panelGroup.addChild(panelBase);

        //panel margin
        glassMarginInsideProfile = findGlassMargin(flatToAdd.parent.name);
        let panelFlat = PaperOffset.offset(flatToAdd, -glassMarginInsideProfile);

        if (addNewItemType == 'vPanel') {
            let fromPosition = panelFlat.bounds.topLeft;
            let toPosition = panelFlat.bounds.topRight;
            for (let index = fromPosition.x; index < toPosition.x; index += panelSize) {
                let tempPanelItem = new paper.Path.Rectangle(new paper.Point(index, fromPosition.y), new paper.Size(panelSize, panelFlat.bounds.height));
                let panelItem = panelFlat.intersect(tempPanelItem);
                panelItem.strokeColor = strokeColor;
                panelItem.fillColor = panelColor;
                panelItem.name = "panelItem";
                panelItem.data.profile_width = panelSize;
                panelGroup.addChild(panelItem);
                tempPanelItem.remove();
            }
        } else if (addNewItemType == 'hPanel') {
            let fromPosition = panelFlat.bounds.topLeft;
            let toPosition = panelFlat.bounds.bottomLeft;
            for (let index = fromPosition.y; index < toPosition.y; index += panelSize) {
                let tempPanelItem = new paper.Path.Rectangle(new paper.Point(fromPosition.x, index), new paper.Size(panelFlat.bounds.width, panelSize));
                let panelItem = panelFlat.intersect(tempPanelItem);
                panelItem.strokeColor = strokeColor;
                panelItem.fillColor = panelColor;
                panelItem.name = "panelItem";
                panelItem.data.profile_width = panelSize;
                panelGroup.addChild(panelItem);
                tempPanelItem.remove();
            }
        }
        panelFlat.remove();

        if (toAddGroup) {
            toAddGroup.addChild(panelGroup);
        }

        flatToAdd.name = "base";
        let baseGroup = new paper.Group();
        baseGroup.name = "baseGroup";
        baseGroup.addChild(flatToAdd);
        baseGroup.addChild(panelGroup);

        if (toAddGroup) {
            toAddGroup.addChild(baseGroup);
        }
        enableSave();
    }//

    //add Window function
    function addWindow(addNewItemType, flatToAdd, toAddGroup = false, data = false, overlap = defaultOverlap) { //data = {profile: data, flat: data, flatFillColor] these are data for new windows frame and flat
        if (unitData.type == "Slide") {
            showMessage('این پروفیل لولایی نیست. عملیات امکان پذیر نمی باشد');
            return;
        }

        let testframeSize = (data.profile) ? data.profile.profile_width : firstWindowSash_width;
        if (!testframeSize) {
            showMessage('بنظر می رسد این پروفیل شامل سش پنجره نمی باشد. اگر این مورد اشتباه است به مدیریت جهت اصلاح اطلاع دهید.');
            return;
        }
        frameSize = testframeSize;
        frameColor = unitData['profile_color_hex'];

        rebuildAccessoryMenu(addNewItemType);

        if (addNewItemType.indexOf('french') !== -1) {
            //first add overhung
            let overhung = addMullian('vMullian', flatToAdd, flatToAdd.bounds.center, flatToAdd.parent, null, firstOverhung_width);
            overhung.data.profile = firstOverhung;
            overhung.data.profile_width = firstOverhung_width;
            overhung.data.overhung = 1;
            //find two flats
            let flats = paper.project.activeLayer.getItems({
                name: "flat"
            });
            let flat1, flat2;
            $.each(flats, function (fk, flt) {
                if (flt.hitTest(new paper.Point(overhung.bounds.centerX - 150, overhung.bounds.centerY))) {
                    flat1 = flt;
                } else if (flt.hitTest(new paper.Point(overhung.bounds.centerX + 150, overhung.bounds.centerY))) {
                    flat2 = flt;
                }
            });
            if (flat1 && flat2) {
                if (addNewItemType == 'window_french_simple_right') {
                    addWindow("window_simple_right_noHandle", flat1, flat1.parent);
                    addWindow("window_simple_left", flat2, flat2.parent);
                } else if (addNewItemType == 'window_french_simple_left') {
                    addWindow("window_simple_right", flat1, flat1.parent);
                    addWindow("window_simple_left_noHandle", flat2, flat2.parent);
                } else if (addNewItemType == 'window_french_dual_right') {
                    addWindow("window_simple_right_noHandle", flat1, flat1.parent);
                    addWindow("window_dual_left", flat2, flat2.parent);
                } else if (addNewItemType == 'window_french_dual_left') {
                    addWindow("window_dual_right", flat1, flat1.parent);
                    addWindow("window_simple_left_noHandle", flat2, flat2.parent);
                }
            } else {
                deleteItem(overhung);
            }
        } else {
            let flatToAddNew = PaperOffset.offset(flatToAdd, overlap);
            let WindowsGroup = new paper.Group();
            let windowsFlat = PaperOffset.offset(flatToAddNew, -frameSize);
            windowsFlat.fillColor = flatColor;
            windowsFlat.name = "flat";
            setDefaultData(windowsFlat, windowsFlat.name);
            if (data.flat) {
                windowsFlat.data = data.flat;
            }
            if (data.flatFillColor) {
                windowsFlat.fillColor = data.flatFillColor;
            }
            let windowsFrame = flatToAddNew.subtract(windowsFlat);
            windowsFrame.strokeColor = strokeColor;
            windowsFrame.fillColor = frameColor;
            windowsFrame.name = "windowFrame";
            windowsFrame.shadowColor = shadowColor;
            windowsFrame.shadowBlur = shadowBlur;
            setDefaultData(windowsFrame, windowsFrame.name);
            if (data.profile) {
                windowsFrame.data = data.profile;
            }
            windowsFrame.data.profile_width = frameSize;
            let tween = windowsFrame.tweenTo({
                fillColor: tweenFillColor
            }, 250);
            tween.then(function () {
                windowsFrame.tweenTo({
                    fillColor: frameColor
                }, 250);
            });

            for (let index = 0; index < windowsFrame.children.length; index++) {
                windowsFrame.children[index].name = 'wframeInOut';
            }

            $.each(windowsFrame.children[0].segments, function (key, value) {
                if (value.handleIn.angle == 0 && value.handleOut.angle == 0) { //arcs has angle more than zero
                    let nearestPoint = windowsFrame.children[1].getNearestPoint(value.point);
                    if (nearestPoint) {
                        let frameCutLine = new paper.Path.Line({
                            from: value.point,
                            to: nearestPoint,
                            name: 'frameCutLine'
                        });
                        windowsFrame.addChild(frameCutLine);
                    }
                }
            });

            WindowsGroup.name = addNewItemType;
            WindowsGroup.addChild(windowsFrame);
            WindowsGroup.addChild(windowsFlat);

            addLockTypeText(windowsFrame);

            let HingePosition = false;
            let HandlePosition = false;
            let olType = false;
            if (addNewItemType == 'window_simple') {
                HingePosition = false;
                HandlePosition = false;
                olType = false;
            } else if (addNewItemType == 'window_simple_right') {
                HingePosition = "left";
                HandlePosition = "right";
                olType = 'normal';
            } else if (addNewItemType == 'window_simple_left') {
                HingePosition = "right";
                HandlePosition = "left";
                olType = 'normal';
            } else if (addNewItemType == 'window_simple_top') {
                HingePosition = "bottom";
                HandlePosition = "top";
                olType = 'normal';
            } else if (addNewItemType == 'window_simple_bottom') {
                HingePosition = "top";
                HandlePosition = "bottom";
                olType = 'normal';
            } else if (addNewItemType == 'window_dual_right') {
                HingePosition = false;
                HandlePosition = "right";
                olType = 'dual';
            } else if (addNewItemType == 'window_dual_left') {
                HingePosition = false;
                HandlePosition = "left";
                olType = 'dual';
            } else if (addNewItemType == 'window_radial_right') {
                HingePosition = false;
                HandlePosition = "right";
                olType = 'radial';
            } else if (addNewItemType == 'window_radial_left') {
                HingePosition = false;
                HandlePosition = "left";
                olType = 'radial';
            } else if (addNewItemType == 'window_radial_top') {
                HingePosition = false;
                HandlePosition = "top";
                olType = 'radial';
            } else if (addNewItemType == 'window_radial_bottom') {
                HingePosition = false;
                HandlePosition = "bottom";
                olType = 'radial';
            } else if (addNewItemType == 'window_volkswagen_right') {
                HingePosition = false;
                HandlePosition = "right";
                olType = 'volkswagen';
            } else if (addNewItemType == 'window_volkswagen_left') {
                HingePosition = false;
                HandlePosition = "left";
                olType = 'volkswagen';
            } else if (addNewItemType == "window_simple_right_noHandle") {
                HingePosition = "left";
                HandlePosition = "invisible";
                olType = 'normal';
            } else if (addNewItemType == "window_simple_left_noHandle") {
                HingePosition = "right";
                HandlePosition = "invisible";
                olType = 'normal';
            }
            addHingeAndHandle("window", flatToAddNew, WindowsGroup, HingePosition, HandlePosition, olType);

            flatToAdd.name = "base";
            let baseGroup = new paper.Group();
            baseGroup.name = "baseGroup";
            baseGroup.addChild(flatToAdd);
            baseGroup.addChild(WindowsGroup);

            if (toAddGroup) {
                toAddGroup.addChild(baseGroup);
            }

            flatToAddNew.remove();
            enableSave();
            return WindowsGroup;
        }

    }//

    //add Door function
    function addDoor(addNewItemType, flatToAdd, toAddGroup = false, data = false, overlap = defaultOverlap) { //data = {profile: data, flat: data, flatFillColor]

        if (unitData.type == "Slide") {
            showMessage('این پروفیل لولایی نیست. عملیات امکان پذیر نمی باشد');
            return;
        }

        rebuildAccessoryMenu(addNewItemType);

        let testframeSizeDoor = (data.profile) ? data.profile.profile_width : firstDoorSash_width;
        if (!testframeSizeDoor) {
            showMessage('بنظر می رسد این پروفیل شامل سش درب نمی باشد. اگر این مورد اشتباه است به مدیریت جهت اصلاح اطلاع دهید.');
            return;
        }

        frameSizeDoor = testframeSizeDoor;
        frameColor = unitData['profile_color_hex'];

        if (addNewItemType.indexOf('french') !== -1) {
            //first add overhung
            let overhung = addMullian('vMullian', flatToAdd, flatToAdd.bounds.center, flatToAdd.parent, null, firstOverhung_width);
            overhung.data.profile = firstOverhung;
            overhung.data.profile_width = firstOverhung_width;
            overhung.data.overhung = 1;
            //find two flats
            let flats = paper.project.activeLayer.getItems({
                name: "flat"
            });
            let flat1, flat2;
            $.each(flats, function (fk, flt) {
                if (flt.hitTest(new paper.Point(overhung.bounds.centerX - 150, overhung.bounds.centerY))) {
                    flat1 = flt;
                } else if (flt.hitTest(new paper.Point(overhung.bounds.centerX + 150, overhung.bounds.centerY))) {
                    flat2 = flt;
                }
            });
            if (flat1 && flat2) {
                if (addNewItemType == 'door_french_simple_right') {
                    addDoor("door_simple_right_noHandle", flat1, flat1.parent);
                    addDoor("door_simple_left", flat2, flat2.parent);
                } else if (addNewItemType == 'door_french_simple_left') {
                    addDoor("door_simple_right", flat1, flat1.parent);
                    addDoor("door_simple_left_noHandle", flat2, flat2.parent);
                } else if (addNewItemType == 'door_french_dual_right') {
                    addDoor("door_simple_right_noHandle", flat1, flat1.parent);
                    addDoor("door_dual_left", flat2, flat2.parent);
                } else if (addNewItemType == 'door_french_dual_left') {
                    addDoor("door_dual_right", flat1, flat1.parent);
                    addDoor("door_simple_left_noHandle", flat2, flat2.parent);
                }
            } else {
                deleteItem(overhung);
            }
        } else {

            let flatToAddNew = PaperOffset.offset(flatToAdd, overlap);
            let WindowsGroup = new paper.Group();
            let windowsFlat = PaperOffset.offset(flatToAddNew, -frameSizeDoor);
            windowsFlat.fillColor = flatColor;
            windowsFlat.name = "flat";
            setDefaultData(windowsFlat, windowsFlat.name);
            if (data.flat) {
                windowsFlat.data = data.flat;
            }
            if (data.flatFillColor) {
                windowsFlat.fillColor = data.flatFillColor;
            }
            let windowsFrame = flatToAddNew.subtract(windowsFlat);
            windowsFrame.strokeColor = strokeColor;
            windowsFrame.fillColor = frameColor;
            windowsFrame.name = "doorFrame";
            windowsFrame.shadowColor = shadowColor;
            windowsFrame.shadowBlur = shadowBlur;
            setDefaultData(windowsFrame, windowsFrame.name);
            if (data.profile) {
                windowsFrame.data = data.profile;
            }
            windowsFrame.data.profile_width = frameSizeDoor;
            let tween = windowsFrame.tweenTo({
                fillColor: tweenFillColor
            }, 250);
            tween.then(function () {
                windowsFrame.tweenTo({
                    fillColor: frameColor
                }, 250);
            });

            for (let index = 0; index < windowsFrame.children.length; index++) {
                windowsFrame.children[index].name = 'dframeInOut';
            }

            $.each(windowsFrame.children[0].segments, function (key, value) {
                if (value.handleIn.angle == 0 && value.handleOut.angle == 0) { //arcs has angle more than zero
                    let nearestPoint = windowsFrame.children[1].getNearestPoint(value.point);
                    if (nearestPoint) {
                        let frameCutLine = new paper.Path.Line({
                            from: value.point,
                            to: nearestPoint,
                            name: 'frameCutLine'
                        });
                        windowsFrame.addChild(frameCutLine);
                    }
                }
            });

            WindowsGroup.name = addNewItemType;
            WindowsGroup.addChild(windowsFrame);
            WindowsGroup.addChild(windowsFlat);

            addLockTypeText(windowsFrame);

            let HingePosition = false;
            let HandlePosition = false;
            let olType = false;
            if (addNewItemType == 'door_simple_right') {
                HingePosition = "left";
                HandlePosition = "right";
                olType = 'normal';
            } else if (addNewItemType == 'door_simple_left') {
                HingePosition = "right";
                HandlePosition = "left";
                olType = 'normal';
            } else if (addNewItemType == 'door_dual_right') {
                HingePosition = "left";
                HandlePosition = "right";
                olType = 'dual';
            } else if (addNewItemType == 'door_dual_left') {
                HingePosition = "right";
                HandlePosition = "left";
                olType = 'dual';
            } else if (addNewItemType == "door_simple_right_noHandle") {
                HingePosition = "left";
                HandlePosition = "invisible";
                olType = 'normal';
            } else if (addNewItemType == "door_simple_left_noHandle") {
                HingePosition = "right";
                HandlePosition = "invisible";
                olType = 'normal';
            }
            addHingeAndHandle("door", flatToAddNew, WindowsGroup, HingePosition, HandlePosition, olType);

            flatToAdd.name = "base";
            let baseGroup = new paper.Group();
            baseGroup.name = "baseGroup";
            baseGroup.addChild(flatToAdd);
            baseGroup.addChild(WindowsGroup);

            if (toAddGroup) {
                toAddGroup.addChild(baseGroup);
            }

            flatToAddNew.remove();
            enableSave();
            return WindowsGroup;
        }
    }//

    //add Cornic
    function addCornic(positions, height) {
        frameColor = unitData['profile_color_hex'];

        if (unitData.shape == "simple_rectangle" && height > 0) {
            let cornic = paper.project.activeLayer.getItem({
                name: "cornic"
            });
            cornic ? cornic.remove() : false;
            let cornicInnert = paper.project.activeLayer.getItem({
                name: "mainFlat"
            });
            let group = new paper.Group();
            group.name = "cornic";
            let cornicOuter = PaperOffset.offset(cornicInnert, height);
            cornicOuter.name = "cornicOuter";
            cornicOuter.fillColor = frameColor;
            cornicOuter.strokeColor = strokeColor;
            group.addChild(cornicOuter);

            if (positions.top) {
                let cornicItem = new paper.Path();
                cornicItem.add([cornicInnert.bounds.topLeft.x, cornicInnert.bounds.topLeft.y]);
                cornicItem.add([cornicInnert.bounds.topRight.x, cornicInnert.bounds.topRight.y]);
                if (positions.right) {
                    cornicItem.add([cornicOuter.bounds.topRight.x, cornicOuter.bounds.topRight.y]);
                } else {
                    cornicItem.add([cornicInnert.bounds.topRight.x, cornicInnert.bounds.topRight.y - height]);
                }
                if (positions.left) {
                    cornicItem.add([cornicOuter.bounds.topLeft.x, cornicOuter.bounds.topLeft.y]);
                } else {
                    cornicItem.add([cornicInnert.bounds.topLeft.x, cornicInnert.bounds.topLeft.y - height]);
                }
                cornicItem.add([cornicInnert.bounds.topLeft.x, cornicInnert.bounds.topLeft.y]);
                cornicItem.name = "top";
                cornicItem.fillColor = frameColor;
                cornicItem.strokeColor = strokeColor;
                group.addChild(cornicItem);
            }
            if (positions.right) {
                let cornicItem = new paper.Path();
                cornicItem.add([cornicInnert.bounds.topRight.x, cornicInnert.bounds.topRight.y]);
                cornicItem.add([cornicInnert.bounds.bottomRight.x, cornicInnert.bounds.bottomRight.y]);
                if (positions.bottom) {
                    cornicItem.add([cornicOuter.bounds.bottomRight.x, cornicOuter.bounds.bottomRight.y]);
                } else {
                    cornicItem.add([cornicInnert.bounds.bottomRight.x + height, cornicInnert.bounds.bottomRight.y]);
                }
                if (positions.top) {
                    cornicItem.add([cornicOuter.bounds.topRight.x, cornicOuter.bounds.topRight.y]);
                } else {
                    cornicItem.add([cornicInnert.bounds.topRight.x + height, cornicInnert.bounds.topRight.y]);
                }
                cornicItem.add([cornicInnert.bounds.topRight.x, cornicInnert.bounds.topRight.y]);
                cornicItem.name = "right";
                cornicItem.fillColor = frameColor;
                cornicItem.strokeColor = strokeColor;
                group.addChild(cornicItem);
            }
            if (positions.bottom) {
                let cornicItem = new paper.Path();
                cornicItem.add([cornicInnert.bounds.bottomLeft.x, cornicInnert.bounds.bottomLeft.y]);
                cornicItem.add([cornicInnert.bounds.bottomRight.x, cornicInnert.bounds.bottomRight.y]);
                if (positions.right) {
                    cornicItem.add([cornicOuter.bounds.bottomRight.x, cornicOuter.bounds.bottomRight.y]);
                } else {
                    cornicItem.add([cornicInnert.bounds.bottomRight.x, cornicInnert.bounds.bottomRight.y + height]);
                }
                if (positions.left) {
                    cornicItem.add([cornicOuter.bounds.bottomLeft.x, cornicOuter.bounds.bottomLeft.y]);
                } else {
                    cornicItem.add([cornicInnert.bounds.bottomLeft.x, cornicInnert.bounds.bottomLeft.y + height]);
                }
                cornicItem.add([cornicInnert.bounds.bottomLeft.x, cornicInnert.bounds.bottomLeft.y]);
                cornicItem.name = "bottom";
                cornicItem.fillColor = frameColor;
                cornicItem.strokeColor = strokeColor;
                group.addChild(cornicItem);
            }
            if (positions.left) {
                let cornicItem = new paper.Path();
                cornicItem.add([cornicInnert.bounds.topLeft.x, cornicInnert.bounds.topLeft.y]);
                cornicItem.add([cornicInnert.bounds.bottomLeft.x, cornicInnert.bounds.bottomLeft.y]);
                if (positions.bottom) {
                    cornicItem.add([cornicOuter.bounds.bottomLeft.x, cornicOuter.bounds.bottomLeft.y]);
                } else {
                    cornicItem.add([cornicInnert.bounds.bottomLeft.x - height, cornicInnert.bounds.bottomRight.y]);
                }
                if (positions.top) {
                    cornicItem.add([cornicOuter.bounds.topLeft.x, cornicOuter.bounds.topLeft.y]);
                } else {
                    cornicItem.add([cornicInnert.bounds.topLeft.x - height, cornicInnert.bounds.topLeft.y]);
                }
                cornicItem.add([cornicInnert.bounds.topLeft.x, cornicInnert.bounds.topLeft.y]);
                cornicItem.name = "left";
                cornicItem.fillColor = frameColor;
                cornicItem.strokeColor = strokeColor;
                group.addChild(cornicItem);
                let mainFrame = paper.project.activeLayer.getItem({
                    name: "mainFrame"
                });
                mainFrame.data.cornic = height;
            }
            cornicOuter.remove();
            enableSave();
        }
    }//
    //Remove Cornic
    function removeCornic() {
        let cornic = paper.project.activeLayer.getItem({
            name: "cornic"
        });
        if (cornic) {
            cornic.remove();
            $('#cornic_top').prop('checked', false);
            $('#cornic_right').prop('checked', false);
            $('#cornic_bottom').prop('checked', false);
            $('#cornic_left').prop('checked', false);
            let mainFrame = paper.project.activeLayer.getItem({
                name: "mainFrame"
            });
            mainFrame.data.cornic = 0;
            enableSave();
            return true;
        } else {
            return false;
        }
    }//

    //addRemoveBottomdoor
    function addRemoveBottomdoor(action, height = false) { //action: add,remove
        if (action == "add" && Number(height) > 0) {
            selectedItem.data.bottomdoor = Number(height);
            reDrawItem(selectedItem);
        } else if (action = "remove") {
            selectedItem.data.bottomdoor = 0;
            reDrawItem(selectedItem);
        }
        $("#configMenuDropDown").trigger('click');
    }//

    function foundHingeCount(length) {
        let out = 2;
        if (length >= 1000) {
            out = 3;
        }
        if (length >= 1700) {
            out = 4;
        }
        if (length >= 2100) {
            out = 5;
        }
        return out;
    }//

    //addHingeAndHandle
    function addHingeAndHandle(winOrDoor, flatToAdd, itemGroup, HingePosition, HandlePosition, olType) {

        let hingePositions = [];
        hingePositions['right'] = [];
        hingePositions['left'] = [];
        hingePositions['top'] = [];
        hingePositions['bottom'] = [];
        let handlePositions = [];
        let minSpace = 120;

        for (let index = 0; index < flatToAdd.curves.length; index++) {
            let curve = flatToAdd.curves[index];
            if (curve.isStraight() && curve.length > 30) { //some tiny straight curve is in start and end of arcs
                let hingeCount = foundHingeCount(curve.length);
                let angle = angleTwoPoint(curve.bounds.center, flatToAdd.bounds.center);
                let side = findSidePositionByAngle(angle);

                if (side) { //side = bottom, left, top, right
                    if (hingeCount == 2) {
                        hingePositions[side][0] = curve.getLocationAt(minSpace).point;
                        hingePositions[side][1] = curve.getLocationAt(curve.length - minSpace).point;
                    } else if (hingeCount == 3) {
                        hingePositions[side][0] = curve.getLocationAt(minSpace).point;
                        hingePositions[side][1] = curve.getLocationAt(minSpace + 350).point;
                        if (HingePosition == "left") {
                            hingePositions[side][1] = curve.getLocationAt(curve.length - minSpace - 350).point;
                        }
                        // hingePositions[side][1] = curve.getLocationAt(curve.length/2).point;
                        hingePositions[side][2] = curve.getLocationAt(curve.length - minSpace).point;
                    } else if (hingeCount == 4) {
                        hingePositions[side][0] = curve.getLocationAt(minSpace).point;
                        hingePositions[side][1] = curve.getLocationAt(minSpace + 350).point;
                        // hingePositions[side][2] = curve.getLocationAt(minSpace + 700).point;
                        // hingePositions[side][1] = curve.getLocationAt(curve.length - minSpace - 700).point;
                        hingePositions[side][2] = curve.getLocationAt(curve.length - minSpace - 350).point;
                        hingePositions[side][3] = curve.getLocationAt(curve.length - minSpace).point;
                    } else if (hingeCount >= 5) {
                        hingePositions[side][0] = curve.getLocationAt(minSpace).point;
                        hingePositions[side][1] = curve.getLocationAt(minSpace + 350).point;
                        hingePositions[side][2] = curve.getLocationAt(curve.length / 2).point;
                        hingePositions[side][3] = curve.getLocationAt(curve.length - minSpace - 350).point;
                        hingePositions[side][4] = curve.getLocationAt(curve.length - minSpace).point;
                    }
                    handlePositions[side] = flatToAdd.curves[index].bounds.center;
                }
            }
        }

        //draw hinges
        $.each(["left", "right", "top", "bottom"], function (key, pos) {
            if ([pos].includes(HingePosition)) {
                $.each(hingePositions[pos], function (key, hingeCenterPoint) {
                    let Tangant = flatToAdd.getTangentAt(flatToAdd.getOffsetOf(hingeCenterPoint));
                    let rotation = 90;
                    if (Tangant) {
                        drawHinge(winOrDoor, hingeCenterPoint, (rotation + Tangant.angle), itemGroup)
                    } else {
                        showMessage('خطای فنی نصب لولا در موقعیت نامناسب! لولا نصب نشد.');
                        errorInDraw = true;
                    }
                });
            }
        });

        //draw hanlde
        $.each(["left", "right", "top", "bottom"], function (key, pos) {
            if ([pos].includes(HandlePosition)) {
                let handlePos = handlePositions[pos];
                let handlePosNew = handlePos;
                let displacement = (winOrDoor == "door") ? frameSize / 2 + 8 : frameSize / 2 + 0;
                if (handlePos) {
                    if (pos == "left") {
                        handlePosNew = new paper.Point(handlePos.x + displacement, handlePos.y);
                    } else if (pos == "right") {
                        handlePosNew = new paper.Point(handlePos.x - displacement, handlePos.y);
                    } else if (pos == "top") {
                        handlePosNew = new paper.Point(handlePos.x, handlePos.y + displacement);
                    } else if (pos == "bottom") {
                        handlePosNew = new paper.Point(handlePos.x, handlePos.y - displacement);
                    }
                    Tangant = flatToAdd.getTangentAt(flatToAdd.getOffsetOf(handlePos));
                    let rotation = (pos == "right") ? 270 : 90;
                    drawHandle(winOrDoor, HandlePosition, handlePosNew, (rotation + Tangant.angle), itemGroup);
                } else {
                    showMessage('خطای فنی نصب دستگیره در موقعیت نامناسب! دستگیره نصب نشد.');
                    errorInDraw = true;
                }
            }
        });

        //draw opening lines
        if (olType) {
            drawOpeningLines(olType, HandlePosition, handlePositions, HingePosition, hingePositions, itemGroup);
        }

    }//

    //draw hinge for window and door
    function drawHinge(type, centerPoint, rotation, itemGroup) {
        let hingeSize = (type == "window") ? windowHingSize : doorHingSize;

        let Hinge = new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(centerPoint.x - hingeSize.width / 2, centerPoint.y - hingeSize.height / 2), hingeSize), [10, 10]);
        Hinge.rotate(rotation, centerPoint);
        Hinge.strokeColor = strokeColor;
        Hinge.fillColor = frameColor;
        Hinge.name = "hinge";
        itemGroup.addChild(Hinge);

        Hinge = new paper.Path.Line([centerPoint.x - hingeSize.width / 2, centerPoint.y - hingeSize.height / 4], [centerPoint.x + hingeSize.width / 2, centerPoint.y - hingeSize.height / 4]);
        Hinge.rotate(rotation, centerPoint);
        Hinge.strokeColor = strokeColor;
        Hinge.fillColor = frameColor;
        Hinge.name = "hingeLine";
        itemGroup.addChild(Hinge);

        Hinge = new paper.Path.Line([centerPoint.x - hingeSize.width / 2, centerPoint.y + hingeSize.height / 4], [centerPoint.x + hingeSize.width / 2, centerPoint.y + hingeSize.height / 4]);
        Hinge.rotate(rotation, centerPoint);
        Hinge.strokeColor = strokeColor;
        Hinge.fillColor = frameColor;
        Hinge.name = "hingeLine";
        itemGroup.addChild(Hinge);
    }//

    //draw handle for window and door
    function drawHandle(type, HandlePosition, handleCenterPoint, rotation, itemGroup) {
        if (type == "window") {
            let Handle = new paper.Path.Rectangle(new paper.Rectangle([handleCenterPoint.x - windowHandleSize.width / 2, handleCenterPoint.y - windowHandleSize.height / 2], windowHandleSize), [10, 10]);
            Handle.rotate(rotation, handleCenterPoint);
            Handle.strokeColor = strokeColor;
            Handle.fillColor = frameColor;
            Handle.name = "handle";
            itemGroup.addChild(Handle);
            Handle = new paper.Path.Rectangle(new paper.Rectangle([handleCenterPoint.x - windowHandle2Size.width / 2, handleCenterPoint.y - 10], windowHandle2Size), [10, 10]);
            Handle.rotate(rotation, handleCenterPoint);
            Handle.strokeColor = strokeColor;
            Handle.fillColor = frameColor;
            Handle.name = "handleHand";
            itemGroup.addChild(Handle);
            Handle = new paper.Path.Circle(handleCenterPoint, 5);
            Handle.fillColor = strokeColor;
            Handle.name = "handleCircle";
            itemGroup.addChild(Handle);
        } else if (type == "door") {
            let Handle = new paper.Path.Rectangle(new paper.Rectangle([handleCenterPoint.x - doorHandleSize.width / 2, handleCenterPoint.y - (doorHandleSize.height / 2)], doorHandleSize), [10, 20]);
            Handle.rotate(rotation, handleCenterPoint);
            Handle.strokeColor = strokeColor;
            Handle.fillColor = frameColor;
            Handle.name = "handle";
            itemGroup.addChild(Handle);
            Handle = new paper.Path.Rectangle(new paper.Rectangle([handleCenterPoint.x - doorHandle2Size.width / 2, handleCenterPoint.y - doorHandleSize.height / 6 - 10], doorHandle2Size), [10, 10]);
            Handle.rotate(((HandlePosition == "right") ? 90 : 270) + rotation, [handleCenterPoint.x, handleCenterPoint.y - doorHandleSize.height / 6]);
            Handle.strokeColor = strokeColor;
            Handle.fillColor = frameColor;
            Handle.name = "handleHand";
            itemGroup.addChild(Handle);
            Handle = new paper.Path.Circle([handleCenterPoint.x, handleCenterPoint.y + doorHandleSize.height / 10], 6);
            Handle.rotate(((HandlePosition == "right") ? 90 : 270) + rotation, Handle.bounds.center);
            Handle.fillColor = strokeColor;
            Handle.name = "handleCircle";
            itemGroup.addChild(Handle);
            Handle = new paper.Path.Rectangle(new paper.Rectangle([handleCenterPoint.x - 3, handleCenterPoint.y + doorHandleSize.height / 8], [6, 12]), [2, 2]);
            Handle.rotate(rotation, Handle.bounds.center);
            Handle.fillColor = strokeColor;
            Handle.name = "handleCircle";
            itemGroup.addChild(Handle);
        }

    }//

    //draw opening line for window and door
    function drawOpeningLines(olType, handlePosition, handlePositions, hingePsition, hingePositions, itemGroup) {
        if (handlePosition == "invisible") {
            switch (hingePsition) {
                case "left":
                    handlePosition = "right"
                    break;
                case "right":
                    handlePosition = "left"
                    break;
                case "top":
                    handlePosition = "bottom"
                    break;
                case "bottom":
                    handlePosition = "top"
                    break;
                default:
                //
            }
        }
        if (["normal"].includes(olType)) {
            olPath = new paper.Path();
            olPath.moveTo(hingePositions[hingePsition][0] ?? itemGroup.bounds.center);
            olPath.lineTo(handlePositions[handlePosition] ?? itemGroup.bounds.center);
            olPath.lineTo(hingePositions[hingePsition][hingePositions[hingePsition].length - 1] ?? itemGroup.bounds.center);
            olPath.strokeColor = olColor;
            olPath.strokeWidth = 2;
            olPath.name = 'ol';
            itemGroup.addChild(olPath);
        } else if (["dual"].includes(olType)) {
            if (handlePosition == "left") { //handlePosition left
                olPath = new paper.Path();
                olPath.moveTo(itemGroup.bounds.topRight);
                olPath.lineTo(itemGroup.bounds.leftCenter);
                olPath.lineTo(itemGroup.bounds.bottomRight);
                olPath.strokeColor = olColor;
                olPath.strokeWidth = 2;
                olPath.name = 'ol';
                itemGroup.addChild(olPath);
            } else { //handlePosition right
                olPath = new paper.Path();
                olPath.moveTo(itemGroup.bounds.topLeft);
                olPath.lineTo(itemGroup.bounds.rightCenter);
                olPath.lineTo(itemGroup.bounds.bottomLeft);
                olPath.strokeColor = olColor;
                olPath.strokeWidth = 2;
                olPath.name = 'ol';
                itemGroup.addChild(olPath);
            }
            olPath = new paper.Path();
            olPath.moveTo(itemGroup.bounds.bottomLeft);
            olPath.lineTo(itemGroup.bounds.topCenter);
            olPath.lineTo(itemGroup.bounds.bottomRight);
            olPath.strokeColor = olColor;
            olPath.strokeWidth = 2;
            olPath.name = 'ol';
            itemGroup.addChild(olPath);
        } else if (["radial"].includes(olType)) {
            olPath = new paper.Path();
            olPath.moveTo(handlePositions['bottom'] ?? itemGroup.bounds.center);
            olPath.lineTo(handlePositions['left'] ?? itemGroup.bounds.center);
            olPath.lineTo(handlePositions['top'] ?? itemGroup.bounds.center);
            olPath.lineTo(handlePositions['right'] ?? itemGroup.bounds.center);
            olPath.lineTo(handlePositions['bottom'] ?? itemGroup.bounds.center);
            olPath.strokeColor = olColor;
            olPath.strokeWidth = 2;
            olPath.name = 'ol';
            itemGroup.addChild(olPath);
        } else if (["volkswagen"].includes(olType)) {
            if (handlePosition == "left") {
                olPath = new paper.Path();
                olPath.moveTo(handlePositions["left"] ?? itemGroup.bounds.center);
                olPath.lineTo(handlePositions['top'] ?? itemGroup.bounds.center);
                olPath.lineTo([handlePositions['top']['x'], handlePositions['left']['y']] ?? itemGroup.bounds.center);
                olPath.lineTo(handlePositions['right']);
                olPath.lineTo([handlePositions['right']['x'] - 100, handlePositions['right']['y'] - 100] ?? itemGroup.bounds.center);
                olPath.strokeColor = olColor;
                olPath.strokeWidth = 2;
                olPath.name = 'ol';
                itemGroup.addChild(olPath);
            } else if (handlePosition == "right") {
                olPath = new paper.Path();
                olPath.moveTo(handlePositions["right"] ?? itemGroup.bounds.center);
                olPath.lineTo(handlePositions['top'] ?? itemGroup.bounds.center);
                olPath.lineTo([handlePositions['top']['x'], handlePositions['right']['y']] ?? itemGroup.bounds.center);
                olPath.lineTo(handlePositions['left']);
                olPath.lineTo([handlePositions['left']['x'] + 100, handlePositions['left']['y'] - 100] ?? itemGroup.bounds.center);
                olPath.strokeColor = olColor;
                olPath.strokeWidth = 2;
                olPath.name = 'ol';
                itemGroup.addChild(olPath);
            }
        }
    }//

    function correctWindowDoorGLines() {
        let allWindows = paper.project.activeLayer.getItems({
            name: function (value) {
                return value && (value.indexOf("window_") !== -1 || value.indexOf("door_") !== -1);
            }
        });
        $.each(allWindows, function (key, item) {
            $.each(item.children, function (s, child) {
                if (child.name == "baseGroup") {
                    child.sendToBack();
                }
            });
            $.each(item.children, function (v, child) {
                if (["windowFrame", "doorFrame"].includes(child.name)) {
                    child.sendToBack();
                }
            });
        });
    }//

    //addHingeAndHandle - SLIDES
    function slidesAddHingeAndHandle(frameToAdd, direction, slideCount = 1) {
        let overlap = (slideCount == 2) ? 32 : 50;
        if (direction == "l") {
            //add Opening Line
            let from = [frameToAdd.bounds.rightCenter.x - frameToAdd.bounds.width / 5, frameToAdd.bounds.rightCenter.y + frameToAdd.bounds.height / 3];
            let to = [frameToAdd.bounds.leftCenter.x + frameToAdd.bounds.width / 5, frameToAdd.bounds.leftCenter.y + frameToAdd.bounds.height / 3];
            let olPath = new state.paper.Path.Line(from, to);
            olPath.strokeColor = olColor;
            olPath.strokeWidth = 2;
            olPath.name = 'ol';
            frameToAdd.addChild(olPath);
            from = [to[0] + 100, to[1] - 100];
            olPath = new state.paper.Path.Line(from, to);
            olPath.strokeColor = olColor;
            olPath.strokeWidth = 2;
            olPath.name = 'ol';
            frameToAdd.addChild(olPath);
            from = [to[0] + 100, to[1] + 100];
            olPath = new state.paper.Path.Line(from, to);
            olPath.strokeColor = olColor;
            olPath.strokeWidth = 2;
            olPath.name = 'ol';
            frameToAdd.addChild(olPath);
            //add Handle
            let flatN = frameToAdd.getItem({ name: "flat" });
            if (flatN) {
                let flatToAddNew = PaperOffset.offset(flatN, overlap);
                addHingeAndHandle("window", flatToAddNew, frameToAdd, false, "right", false);
                flatToAddNew.remove();
            }
        } else if (direction == "r") {
            //add Opening Line
            let from = [frameToAdd.bounds.leftCenter.x + frameToAdd.bounds.width / 5, frameToAdd.bounds.leftCenter.y + frameToAdd.bounds.height / 3];
            let to = [frameToAdd.bounds.rightCenter.x - frameToAdd.bounds.width / 5, frameToAdd.bounds.rightCenter.y + frameToAdd.bounds.height / 3];
            let olPath = new state.paper.Path.Line(from, to);
            olPath.strokeColor = olColor;
            olPath.strokeWidth = 2;
            olPath.name = 'ol';
            frameToAdd.addChild(olPath);
            from = [to[0] - 100, to[1] - 100];
            olPath = new state.paper.Path.Line(from, to);
            olPath.strokeColor = olColor;
            olPath.strokeWidth = 2;
            olPath.name = 'ol';
            frameToAdd.addChild(olPath);
            from = [to[0] - 100, to[1] + 100];
            olPath = new state.paper.Path.Line(from, to);
            olPath.strokeColor = olColor;
            olPath.strokeWidth = 2;
            olPath.name = 'ol';
            frameToAdd.addChild(olPath);
            //add Handle
            let flatN = frameToAdd.getItem({ name: "flat" });
            if (flatN) {
                let flatToAddNew = PaperOffset.offset(flatN, overlap);
                addHingeAndHandle("window", flatToAddNew, frameToAdd, false, "left", false);
                flatToAddNew.remove();
            }
        }
    }//

    //add frame for slide windows
    function addSlideFrame(flatToAdd, frameSize, overlaps, data = false) { //ex.: overlaps = {left: 8, right: 30, top: 8, bottom: 8}
        let from = new paper.Point(flatToAdd.bounds.x - overlaps.left, flatToAdd.bounds.y - overlaps.top);
        let to = new paper.Point(flatToAdd.bounds.bottomRight.x + overlaps.right, flatToAdd.bounds.bottomRight.y + overlaps.bottom);

        let testframeSize = firstWindowSash_width;
        if (!testframeSize) {
            showMessage('بنظر می رسد این پروفیل شامل سش مناسب نمی باشد. اگر این مورد اشتباه است به مدیریت جهت اصلاح اطلاع دهید.');
            return;
        }
        frameSize = testframeSize;
        frameColor = unitData['profile_color_hex'];

        let flatToAddNew = new paper.Path.Rectangle(from, to);
        let windowsFlat = PaperOffset.offset(flatToAddNew, -frameSize);
        windowsFlat.fillColor = flatColor;
        windowsFlat.name = "flat";
        rebuildAccessoryMenu('slide');
        setDefaultData(windowsFlat, windowsFlat.name);
        if (data.flat) {
            windowsFlat.data = data.flat;
        }
        let windowsFrame = flatToAddNew.subtract(windowsFlat);
        windowsFrame.strokeColor = strokeColor;
        windowsFrame.fillColor = frameColor;
        windowsFrame.name = "windowFrame";
        windowsFrame.shadowColor = shadowColor;
        windowsFrame.shadowBlur = shadowBlur;
        setDefaultData(windowsFrame, windowsFrame.name);
        if (data.profile) {
            windowsFrame.data = data.profile;
        }
        windowsFrame.data.profile_width = frameSize;
        windowsFrame.data.profile_width = frameSize;
        let tween = windowsFrame.tweenTo({
            fillColor: tweenFillColor
        }, 250);
        tween.then(function () {
            windowsFrame.tweenTo({
                fillColor: frameColor
            }, 250);
        });
        $.each(windowsFrame.children[0].segments, function (key, value) {
            windowsFrame.moveTo(value.point);
            var nearestPoint = windowsFrame.children[1].getNearestPoint(value.point);
            if (nearestPoint) {
                windowsFrame.lineTo(nearestPoint);
            }
        });

        for (let index = 0; index < windowsFrame.children.length; index++) {
            windowsFrame.children[index].name = 'wframeInOut';
        }


        let WindowsGroup = new paper.Group();
        WindowsGroup.name = "slide";
        WindowsGroup.addChild(windowsFrame);
        WindowsGroup.addChild(windowsFlat);
        WindowsGroup.parent = flatToAdd.parent;

        flatToAdd.name = "base";
        flatToAddNew.name = "base";
        flatToAddNew.remove();
        flatToAdd.remove();

        return WindowsGroup;
    }//

    //add slide
    function addSlide(flatToAdd, config, pointsOfMullians = false, data = false, mullianData = false) { //data = {frame: data, flat: data] these are data for new windows frame and flat
        if (unitData.type == "Turn") {
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

        let testframeWidth = (data.profile) ? data.profile.profile_width : firstWindowSash_width;
        if (!testframeWidth) {
            showMessage('بنظر می رسد این پروفیل شامل سش مناسب نمی باشد. اگر این مورد اشتباه است به مدیریت جهت اصلاح اطلاع دهید.');
            return;
        }
        frameWidth = testframeWidth;

        if (config.type !== "slide" || unitData.shape !== "simple_rectangle") {
            showMessage('امکان اضافه کردن بازشو اسلایدی در اشکال غیرساده وجود ندارد');
            return
        }

        if (flatToAdd.parent.name !== "section" && flatToAdd.parent.parent.name !== "section") {
            showMessage('در این سطح امکان نصب پنجره کشویی وجود ندارد');
            return
        }

        //find frame is 0,1,2 slide type
        let frameSlideCount = $('.frameInput option[value="' + mainFrame.data.profile + '"]').data('slide');
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

        let baseGroup = new paper.Group();
        baseGroup.name = "baseGroup";

        let windowGroup = new paper.Group();
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
                mulliansWidth = [firstMullian_width, firstMullian_width, firstMullian_width];
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
            addMullian('vMullian', flatToAdd, new paper.Point(pointsOfMullians[0]), windowGroup, mullianData, mulliansWidth[0]);
        } else if (config.frames == 3) {
            if (!pointsOfMullians) {
                pointsOfMullians = [];
                pointsOfMullians.push([round2decimal(flatToAdd.bounds.x + flatToAdd.bounds.width / 3), round2decimal(flatToAdd.bounds.centerY)]);
                pointsOfMullians.push([round2decimal(flatToAdd.bounds.x + 2 * flatToAdd.bounds.width / 3), round2decimal(flatToAdd.bounds.centerY)]);
            }
            addMullian('vMullian', flatToAdd, new paper.Point(pointsOfMullians[0]), windowGroup, mullianData, mulliansWidth[0]);
            let allFlats = paper.project.activeLayer.getItems({ name: "flat" });
            $.each(allFlats, function (key, flat) {
                if (flat.hitTest(new paper.Point(pointsOfMullians[1]))) {
                    addMullian('vMullian', flat, new paper.Point(pointsOfMullians[1]), windowGroup, mullianData, mulliansWidth[1]);
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
            addMullian('vMullian', flatToAdd, new paper.Point(pointsOfMullians[0]), windowGroup, mullianData, mulliansWidth[0]);
            let allFlats = paper.project.activeLayer.getItems({ name: "flat" });
            $.each(allFlats, function (key, flat) {
                if (flat.hitTest(new paper.Point(pointsOfMullians[1]))) {
                    addMullian('vMullian', flat, new paper.Point(pointsOfMullians[1]), windowGroup, mullianData, mulliansWidth[1]);
                    return;
                }
            });
            allFlats = paper.project.activeLayer.getItems({ name: "flat" });
            $.each(allFlats, function (key, flat) {
                if (flat.hitTest(new paper.Point(pointsOfMullians[2]))) {
                    addMullian('vMullian', flat, new paper.Point(pointsOfMullians[2]), windowGroup, mullianData, mulliansWidth[2]);
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

        let mullianExtraSash_0 = frameWidth / 2;
        let mullianExtraSash_1 = frameWidth / 2;
        let mullianExtraSash_2 = frameWidth / 2;
        if (frameSlideCount == 1) {
            mullianExtraSash_0 = (mulliansWidth[0] == 2) ? 0 : (mulliansWidth[0] + firstEnterlock_width + profileLab);
            mullianExtraSash_1 = (mulliansWidth[1] == 2) ? 0 : (mulliansWidth[1] + firstEnterlock_width + profileLab);
            mullianExtraSash_2 = (mulliansWidth[2] == 2) ? 0 : (mulliansWidth[2] + firstEnterlock_width + profileLab);
        }

        firstEnterlock_sash_space = $('.enterlockInput option[data-profile_id="' + unitData.profile_id + '"]').data('sash_space') || 0;
        if (flats.length == 2) {
            //left
            if (frameSlideCount != 1 || (frameSlideCount == 1 && slideSide[0] != 'n')) {
                overlaps = {
                    left: 8,
                    right: mullianExtraSash_0,
                    top: 8 + firstEnterlock_sash_space,
                    bottom: 8 + firstEnterlock_sash_space
                }

                frame1 = addSlideFrame(flats[0], frameWidth, overlaps);
                flats[0].insertBelow(frame1);
                slidesAddHingeAndHandle(frame1, slideSide[0], frameSlideCount);
                frame1.data.movement = slideSide[0];
            }
            //right
            if (frameSlideCount != 1 || (frameSlideCount == 1 && slideSide[1] != 'n')) {
                overlaps = {
                    left: mullianExtraSash_0,
                    right: 8,
                    top: 8 - firstEnterlock_sash_space,
                    bottom: 8 - firstEnterlock_sash_space
                }
                frame2 = addSlideFrame(flats[1], frameWidth, overlaps);
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
                    top: 8 - firstEnterlock_sash_space,
                    bottom: 8 - firstEnterlock_sash_space
                }
                frame1 = addSlideFrame(flats[0], frameWidth, overlaps);
                flats[0].insertBelow(frame1);
                slidesAddHingeAndHandle(frame1, slideSide[0], frameSlideCount);
                frame1.data.movement = slideSide[0];
            }
            //center
            if (frameSlideCount != 1 || (frameSlideCount == 1 && slideSide[1] != 'n')) {
                overlaps = {
                    left: (position[1] == position[0]) ? 0 : mullianExtraSash_0,
                    right: (position[1] == position[2]) ? 0 : mullianExtraSash_1,
                    top: 8 - firstEnterlock_sash_space,
                    bottom: 8 - firstEnterlock_sash_space
                }
                frame2 = addSlideFrame(flats[1], frameWidth, overlaps);
                flats[1].insertBelow(frame2);
                slidesAddHingeAndHandle(frame2, slideSide[1], frameSlideCount);
                frame2.data.movement = slideSide[1];
            }
            //right
            if (frameSlideCount != 1 || (frameSlideCount == 1 && slideSide[2] != 'n')) {
                overlaps = {
                    left: (position[1] == position[2]) ? 0 : mullianExtraSash_1,
                    right: 8,
                    top: 8 - firstEnterlock_sash_space,
                    bottom: 8 - firstEnterlock_sash_space
                }
                frame3 = addSlideFrame(flats[2], frameWidth, overlaps);
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
                    top: 8 - firstEnterlock_sash_space,
                    bottom: 8 - firstEnterlock_sash_space
                }
                frame1 = addSlideFrame(flats[0], frameWidth, overlaps);
                flats[0].insertBelow(frame1);
                slidesAddHingeAndHandle(frame1, slideSide[0], frameSlideCount);
                frame1.data.movement = slideSide[0];
            }
            //beside left
            if (frameSlideCount != 1 || (frameSlideCount == 1 && slideSide[1] != 'n')) {
                overlaps = {
                    left: (position[1] == position[0]) ? 0 : mullianExtraSash_0,
                    right: (position[1] == position[2]) ? 0 : mullianExtraSash_1,
                    top: 8 - firstEnterlock_sash_space,
                    bottom: 8 - firstEnterlock_sash_space
                }
                frame2 = addSlideFrame(flats[1], frameWidth, overlaps);
                flats[1].insertBelow(frame2);
                slidesAddHingeAndHandle(frame2, slideSide[1], frameSlideCount);
                frame2.data.movement = slideSide[1];
            }
            //beside right
            if (frameSlideCount != 1 || (frameSlideCount == 1 && slideSide[2] != 'n')) {
                overlaps = {
                    left: (position[1] == position[2]) ? 0 : mullianExtraSash_1,
                    right: (position[2] == position[3]) ? 0 : mullianExtraSash_2,
                    top: 8 - firstEnterlock_sash_space,
                    bottom: 8 - firstEnterlock_sash_space
                }
                frame3 = addSlideFrame(flats[2], frameWidth, overlaps);
                flats[2].insertBelow(frame3);
                slidesAddHingeAndHandle(frame3, slideSide[2], frameSlideCount);
                frame3.data.movement = slideSide[2];
            }
            //right
            if (frameSlideCount != 1 || (frameSlideCount == 1 && slideSide[3] != 'n')) {
                overlaps = {
                    left: (position[3] == position[2]) ? 0 : mullianExtraSash_2,
                    right: 8,
                    top: 8 - firstEnterlock_sash_space,
                    bottom: 8 - firstEnterlock_sash_space
                }
                frame4 = addSlideFrame(flats[3], frameWidth, overlaps);
                flats[3].insertBelow(frame4);
                slidesAddHingeAndHandle(frame4, slideSide[3], frameSlideCount);
                frame4.data.movement = slideSide[3];
            }

            if (frame1 && frame2 && position[0] == 'u') frame1.insertAbove(frame2);
            if (frame2 && frame3 && position[1] == 'u') frame2.insertAbove(frame3);
            if (frame3 && frame4 && position[2] == 'u') frame3.insertAbove(frame4);
        }
        enableSave();
    }//

    function rebuildAccessoryMenu(addNewItemType, accessory_id = false) {
        if (!accessory_id) {
            accessory_id = unitData.accessory_id
        }
        let openingType = 'window';
        if (addNewItemType.indexOf('door') !== -1) {
            openingType = 'door';
        }
        let opening = 'simple';
        if (addNewItemType.indexOf('_top') !== -1) {
            opening = 'top';
        } else if (addNewItemType.indexOf('_bottom') !== -1) {
            opening = 'bottom';
        } else if (addNewItemType.indexOf('dual') !== -1) {
            opening = 'dual';
        } else if (addNewItemType.indexOf('radial') !== -1) {
            opening = 'radial';
        } else if (addNewItemType.indexOf('volkswagen') !== -1) {
            opening = 'volkswagen';
        } else if (addNewItemType.indexOf('french_simple') !== -1) {
            opening = 'french_simple';
        } else if (addNewItemType.indexOf('french_dual') !== -1) {
            opening = 'french_dual';
        } else if (addNewItemType.indexOf('accordion') !== -1) {
            opening = 'accordion';
        } else if (addNewItemType.indexOf('slide') !== -1) {
            opening = 'slide';
            if (addNewItemType.indexOf('lift&slide') !== -1) {
                opening = 'lift&slide';
            }
        }
        $('.accessoryTypeInput[data-id="accessoryType"] option').hide();
        $('.accessoryTypeInput[data-id="accessoryType"] option').attr("disabled", true);
        $('.accessoryTypeInput[data-id="accessoryType"] option[data-accessoryCompany=' + accessory_id + '][data-type=' + openingType + '][data-system=' + unitData.system + '][data-opening=' + opening + ']').show();
        $('.accessoryTypeInput[data-id="accessoryType"] option[data-accessoryCompany=' + accessory_id + '][data-type=' + openingType + '][data-system=' + unitData.system + '][data-opening=' + opening + ']').attr("disabled", false);
    }//

    //changeMullianPosition
    function changeMullianPosition(newPoint) {
        if (selectedItem) {
            if (selectedItem.parent.name == "window_slide") {
                let wslide = paper.project.activeLayer.getItem({ name: "window_slide" });
                let mullianData = selectedItem.data;
                if (wslide) {
                    //find position of other mullians
                    let vMullians = wslide.getItems({ name: "vMullian" });
                    let pointsOfMullians = [];
                    if (vMullians.length > 0) {
                        $.each(vMullians, function (key, mullian) {
                            if (Math.round(mullian.bounds.centerX) == Math.round(selectedItem.bounds.centerX)) {
                                pointsOfMullians.push(newPoint.x);
                            } else {
                                pointsOfMullians.push(mullian.bounds.centerX);
                            }
                        });
                        pointsOfMullians.sort((a, b) => (a < b ? -1 : 0)); //sort min to max

                        deleteItem(wslide);

                        let flats = paper.project.activeLayer.getItems({ name: "flat" });
                        $.each(flats, function (key, flat) {
                            if (flat.hitTest(wslide.bounds.center)) {
                                addSlide(flat, false, pointsOfMullians, wslide.data, mullianData);
                                return;
                            }
                        });
                        createDimensionBar();
                        return;
                    }
                }
            } else {
                if (ctrlKeyPressed) {
                    let allFlats = paper.project.activeLayer.getItems({ name: "flat" });
                    $.each(allFlats, function (key, flat) {
                        if (flat.hitTest(newPoint)) {
                            addMullian(selectedItem.name, flat, newPoint, flat.parent, selectedItem.data);
                            return;
                        }
                    });
                } else {
                    let newMullian;
                    let selectedItemCopy = selectedItem;
                    let memory = deleteItem(selectedItem);
                    let allFlats = paper.project.activeLayer.getItems({ name: "flat" });
                    $.each(allFlats, function (key, flat) {
                        if (flat.hitTest(newPoint)) {
                            newMullian = addMullian(selectedItemCopy.name, flat, newPoint, flat.parent, selectedItemCopy.data);
                            return;
                        }
                    });
                    enableSave();
                    reDrawMullianChildsOnDelete(memory);
                    createDimensionBar();
                    saveHistory();
                    cancelAll();
                    return newMullian;
                }

            }
        }
    }//

    //change mullian position by xBar and yBar changes
    function changeMullianPositionByNumber(arg) { //arg = {from,to,label,mullianType, sectionID}
        let from = Number(arg.from);
        let to = Number(arg.to);
        let label = Number(arg.label);
        let mullianType = arg.mullianType;
        let section = paper.project.activeLayer.getItem({ id: arg.sectionID });

        if (from != to) {
            if ((mullianType == "vMullian" && from == section.bounds.width) || (mullianType == "hMullian" && from == section.bounds.height)) { //last item
                let allMullians = paper.project.activeLayer.getItems({
                    name: mullianType
                });
                $.each(allMullians, function (key, mullian) {
                    let contactPoint = (mullianType == "vMullian") ? new paper.Point(from - label, mullian.bounds.centerY) : new paper.Point(mullian.bounds.centerX, from - label);
                    if (mullian.hitTest(contactPoint)) {
                        mullian.selected = true;
                        selectedItem = mullian;
                        let desirePoint = (mullianType == "vMullian") ? new paper.Point(mullian.bounds.centerX + from - to, mullian.bounds.centerY) : new paper.Point(mullian.bounds.centerX, mullian.bounds.centerY + from - to);
                        changeMullianPosition(desirePoint);
                        return;
                    }
                });
            } else { //other item
                let allMullians = paper.project.activeLayer.getItems({
                    name: mullianType
                });
                $.each(allMullians, function (key, mullian) {
                    let center = (mullianType == "vMullian") ? mullian.bounds.centerX : mullian.bounds.centerY;
                    if (round2decimal(center) == round2decimal(from)) {
                        mullian.selected = true;
                        selectedItem = mullian;
                        let desirePoint = (mullianType == "vMullian") ? new paper.Point(to, mullian.bounds.centerY) : new paper.Point(mullian.bounds.centerX, to);
                        changeMullianPosition(desirePoint);
                        return;
                    }
                });
            }
        }
    }//

    function getBaseGroupItems(baseGroup) {
        if (baseGroup) {
            $.each(baseGroup.children, function (key1, item) {
                if (['vMullian', 'hMullian'].includes(item.name)) {
                    mulliansToRedraw.push(item);
                } else if (item.name.indexOf("window_") !== -1 || item.name.indexOf("door_") !== -1 || item.name.indexOf("Panel") !== -1) {
                    othersToRedraw.push(item);
                } else if (item.name == "baseGroup") {
                    getBaseGroupItems(item)
                }
            });
        }
    }//

    function reDrawMullianChildsOnDelete(memory, newOffset = false) {

        if (!memory || memory.length < 0) {
            return;
        }

        $.each(memory, function (key, item) {
            if (['vMullian', 'hMullian'].includes(item.name)) {
                mulliansToRedraw.push(item);
                othersToRedraw.push(item);
            } else if (item.name == "window_slide") {
                let flats = paper.project.activeLayer.getItems({ name: 'flat' });
                $.each(flats, function (key2, flat) {
                    if (flat.hitTest(item.bounds.center)) {
                        addSlide(flat, false, false, item.data)
                        return;
                    }
                });
            } else if (item.name == "baseGroup") {
                getBaseGroupItems(item)
            }
        });


        //first reDraw Mullians except in slide
        $.each(mulliansToRedraw, function (key, item) {
            if (item.parent.name == "window_slide") {
                return true;
            }
            let flats = paper.project.activeLayer.getItems({ name: "flat" });
            $.each(flats, function (k, flat) {
                let testPoint = item.bounds.center;
                if (newOffset) testPoint = new paper.Point(testPoint.x + newOffset.x, testPoint.y + newOffset.y);
                if (selectedItem.name == "vMullian") {
                    if (item.bounds.centerX > selectedItem.bounds.centerX) { //item was in right mullain side
                        testPoint = [item.bounds.rightCenter.x - 10, item.bounds.rightCenter.y];
                    } else {
                        testPoint = [item.bounds.leftCenter.x + 10, item.bounds.rightCenter.y];
                    }
                } else if (selectedItem.name == "hMullian") {
                    if (item.bounds.centerY > selectedItem.bounds.centerY) { //item was in below mullain side
                        testPoint = [item.bounds.bottomCenter.x, item.bounds.bottomCenter.y - 10];
                    } else {
                        testPoint = [item.bounds.topCenter.x, item.bounds.topCenter.y + 10];
                    }
                }
                if (flat.hitTest(testPoint)) {
                    addMullian(item.name, flat, item.bounds.center, flat.parent, item.data);
                    return;
                }
            });
        });
        mulliansToRedraw = [];


        //then reDraw Others except Panel
        $.each(othersToRedraw, function (key, item) {
            if (item.name.indexOf("window_") !== -1 || item.name.indexOf("door_") !== -1) {
                let flats = paper.project.activeLayer.getItems({ name: "flat" });
                $.each(flats, function (k, flat) {
                    let testPoint = item.bounds.center;
                    if (newOffset) testPoint = new paper.Point(testPoint.x + newOffset.x, testPoint.y + newOffset.y);
                    if (selectedItem.name == "vMullian") {
                        if (item.bounds.centerX > selectedItem.bounds.centerX) { //item was in right mullain side
                            testPoint = [item.bounds.rightCenter.x - 100, item.bounds.rightCenter.y]; //100 for framesize back
                        } else {
                            testPoint = [item.bounds.leftCenter.x + 100, item.bounds.rightCenter.y];
                        }
                    } else if (selectedItem.name == "hMullian") {
                        if (item.bounds.centerY > selectedItem.bounds.centerY) { //item was in below mullain side
                            testPoint = [item.bounds.bottomCenter.x, item.bounds.bottomCenter.y - 100]; //100 for framesize back
                        } else {
                            testPoint = [item.bounds.topCenter.x, item.bounds.topCenter.y + 100];
                        }
                    }
                    if (flat.hitTest(testPoint)) {
                        let openingFlatData = false;
                        let openingFlatFillColor = false;
                        for (let k = 0; k < item.children.length; k++) {
                            if (item.children[k].name == "flat") {
                                openingFlatData = item.children[k].data;
                                openingFlatFillColor = item.children[k].fillColor;
                                break;
                            }
                        }
                        let window;
                        if (item.name.indexOf("window_") !== -1) {
                            window = addWindow(item.name, flat, flat.parent, {
                                profile: item.children[0].data,
                                flat: openingFlatData,
                                flatFillColor: openingFlatFillColor
                            });
                        } else if (item.name.indexOf("door_") !== -1) {
                            window = addDoor(item.name, flat, flat.parent, {
                                profile: item.children[0].data,
                                flat: openingFlatData,
                                flatFillColor: openingFlatFillColor
                            });
                        }
                        //add child property
                        let otherProperty = item.getItems({
                            name: function (value) {
                                return ['vMullian', 'hMullian', 'vPanel', 'hPanel'].includes(value);
                            }
                        })
                        $.each(otherProperty, function (s, itemp) {
                            if (itemp.name.indexOf("Mullian") !== -1) {
                                let flatsi = paper.project.activeLayer.getItems({ name: "flat" });
                                $.each(flatsi, function (k, flt) {
                                    let testPoint = itemp.bounds.center;
                                    if (newOffset) testPoint = new paper.Point(testPoint.x + newOffset.x, testPoint.y + newOffset.y);
                                    if (selectedItem.name == "vMullian") {
                                        if (itemp.bounds.centerX > selectedItem.bounds.centerX) { //item was in right mullain side
                                            testPoint = [itemp.bounds.rightCenter.x - 10, itemp.bounds.rightCenter.y];
                                        } else {
                                            testPoint = [itemp.bounds.leftCenter.x + 10, itemp.bounds.rightCenter.y];
                                        }
                                    } else if (selectedItem.name == "hMullian") {
                                        if (itemp.bounds.centerY > selectedItem.bounds.centerY) { //item was in below mullain side
                                            testPoint = [itemp.bounds.bottomCenter.x, itemp.bounds.bottomCenter.y - 10];
                                        } else {
                                            testPoint = [itemp.bounds.topCenter.x, itemp.bounds.topCenter.y + 10];
                                        }
                                    }
                                    if (flt.hitTest(testPoint)) {
                                        addMullian(itemp.name, flt, itemp.bounds.center, flt.parent, itemp.data, false);
                                        return;
                                    }
                                });
                            }
                        });
                        $.each(otherProperty, function (s, itemp) {
                            if (itemp.name.indexOf("Panel") !== -1) {
                                let flatsi = paper.project.activeLayer.getItems({ name: "flat" });
                                $.each(flatsi, function (k, flt) {
                                    let testPoint = itemp.bounds.center;
                                    if (newOffset) testPoint = new paper.Point(testPoint.x + newOffset.x, testPoint.y + newOffset.y);
                                    if (selectedItem.name == "vMullian") {
                                        if (itemp.bounds.centerX > selectedItem.bounds.centerX) { //item was in right mullain side
                                            testPoint = [itemp.bounds.rightCenter.x - 100, itemp.bounds.rightCenter.y];
                                        } else {
                                            testPoint = [itemp.bounds.leftCenter.x + 100, itemp.bounds.rightCenter.y];
                                        }
                                    } else if (selectedItem.name == "hMullian") {
                                        if (itemp.bounds.centerY > selectedItem.bounds.centerY) { //item was in below mullain side
                                            testPoint = [itemp.bounds.bottomCenter.x, itemp.bounds.bottomCenter.y - 100];
                                        } else {
                                            testPoint = [itemp.bounds.topCenter.x, itemp.bounds.topCenter.y + 100];
                                        }
                                    }
                                    if (flt.hitTest(testPoint)) {
                                        addPanel(itemp.name, flt, flt.parent, itemp.data);
                                        return;
                                    }
                                });
                            }
                        });
                        return;
                    }
                });
            }
        });

        //then reDraw Panel
        $.each(othersToRedraw, function (key, item) {
            if (item.name.indexOf("Panel") !== -1) {
                let flats = paper.project.activeLayer.getItems({ name: "flat" });
                $.each(flats, function (k, flat) {
                    let testPoint = item.bounds.center;
                    if (newOffset) testPoint = new paper.Point(testPoint.x + newOffset.x, testPoint.y + newOffset.y);
                    if (selectedItem.name == "vMullian") {
                        if (item.bounds.centerX > selectedItem.bounds.centerX) { //item was in right mullain side
                            testPoint = [item.bounds.rightCenter.x - 100, item.bounds.rightCenter.y]; //100 for framesize back
                        } else {
                            testPoint = [item.bounds.leftCenter.x + 100, item.bounds.rightCenter.y];
                        }
                    } else if (selectedItem.name == "hMullian") {
                        if (item.bounds.centerY > selectedItem.bounds.centerY) { //item was in below mullain side
                            testPoint = [item.bounds.bottomCenter.x, item.bounds.bottomCenter.y - 100]; //100 for framesize back
                        } else {
                            testPoint = [item.bounds.topCenter.x, item.bounds.topCenter.y + 100];
                        }
                    }
                    if (flat.hitTest(testPoint)) {
                        addPanel(item.name, flat, flat.parent, item.data);
                        return;
                    }
                });
            }
        });
        othersToRedraw = [];

        removedDependenceMemory = [];
        enableSave();
    }//

    //redraw mainFrame
    function reDrawMainFrame(section, changeSize = false) { // changeSize is array [width, height]
        if (changeSize) {
            if (Number(changeSize[0]) < 200 || Number(changeSize[1]) < 200 || Number(changeSize[0]) > 6000 || Number(changeSize[1]) > 6000) {
                showMessage('لطفا ابعاد معتبری وارد نمایید. حداقل 200 حداکثر 6000 میلیمتر');
                return false;
            }
        }
        if (!section) {
            section = paper.project.activeLayer.getItem({ name: 'section' });
        }
        for (let i = 0; i < section.children.length; i++) {
            if (section.children[i].name == "mainFrame") {
                mainFrame = section.children[i];
                break;
            }
        }
        frameSize = mainFrame.data.profile_width;
        frameColor = unitData['profile_color_hex'];
        if (changeSize) {
            newWidth = Number(changeSize[0]);
            newHeight = Number(changeSize[1]);
            unitData['Dimension'] = changeSize;
        } else {
            newWidth = section.bounds.width;
            newHeight = section.bounds.height;
        }

        section.remove();
        drawFirstShape(unitData, true, mainFrame.data, section); //redraw set to true

        let windowsMullianMemory = [];
        //redraw Mullians first except in slide
        if (unitData.type != "Slide") {
            let mullians = section.getItems({
                name: function (value) {
                    return ['vMullian', 'hMullian'].includes(value);
                }
            });
            $.each(mullians, function (key, mullian) {
                if (mullian.parent.parent.name.indexOf("window_") !== -1 || mullian.parent.parent.name.indexOf("door_") !== -1) {
                    windowsMullianMemory.push(mullian);
                    return;
                }
                let flats = paper.project.activeLayer.getItems({ name: "flat" });
                $.each(flats, function (key2, flat) {
                    if (flat.hitTest(mullian.bounds.center)) {
                        if (mullian.bounds.width > 3) {
                            addMullian(mullian.name, flat, mullian.bounds.center, flat.parent, mullian.data, false);
                            return;
                        }
                    }
                });
            });

        }

        //redraw Others except Panel
        let others = section.getItems({
            name: function (value) {
                return value.indexOf("window_") !== -1 || value.indexOf("door_") !== -1;
            }
        });
        $.each(others, function (key, item) {
            let flats = paper.project.activeLayer.getItems({ name: "flat" });
            $.each(flats, function (key2, flat) {
                if (flat.hitTest(item.bounds.center)) {
                    if (item.name.indexOf("window_") !== -1) {
                        let openingFlatData = false;
                        let openingFlatFillColor = false;
                        for (let k = 0; k < item.children.length; k++) {
                            if (item.children[k].name == "flat") {
                                openingFlatData = item.children[k].data;
                                openingFlatFillColor = item.children[k].fillColor;
                                break;
                            }
                        }
                        if (item.name == "window_slide") {
                            addSlide(flat, false, false, item.data);
                            return;
                        }
                        let window = addWindow(item.name, flat, flat.parent, {
                            profile: item.children[0].data,
                            flat: openingFlatData,
                            flatFillColor: openingFlatFillColor
                        })
                        $.each(windowsMullianMemory, function (key3, mullian) {
                            let windowFlats = window.getItems({ name: "flat" });
                            $.each(windowFlats, function (key4, windowFlat) {
                                if (windowFlat.hitTest(mullian.bounds.center)) {
                                    addMullian(mullian.name, windowFlat, mullian.bounds.center, windowFlat.parent, mullian.data, false);
                                    return;
                                }
                            });
                        });
                    } else if (item.name.indexOf("door_") !== -1) {
                        let openingFlatData = false;
                        let openingFlatFillColor = false;
                        for (let k = 0; k < item.children.length; k++) {
                            if (item.children[k].name == "flat") {
                                openingFlatData = item.children[k].data;
                                openingFlatFillColor = item.children[k].fillColor;
                                break;
                            }
                        }
                        let window = addDoor(item.name, flat, flat.parent, {
                            profile: item.children[0].data,
                            flat: openingFlatData,
                            flatFillColor: openingFlatFillColor
                        })
                        $.each(windowsMullianMemory, function (key3, mullian) {
                            let windowFlats = window.getItems({ name: "flat" });
                            $.each(windowFlats, function (key4, windowFlat) {
                                if (windowFlat.hitTest(mullian.bounds.center)) {
                                    addMullian(mullian.name, windowFlat, mullian.bounds.center, windowFlat.parent, mullian.data, false);
                                    return;
                                }
                            });
                        });
                    }
                    return;
                }
            });
        });

        //redraw Panel
        let panels = section.getItems({
            name: function (value) {
                return value.indexOf("Panel") !== -1;
            }
        });
        $.each(panels, function (key, item) {
            let flats = paper.project.activeLayer.getItems({ name: "flat" });
            $.each(flats, function (key2, flat) {
                if (flat.hitTest(item.bounds.center)) {
                    addPanel(item.name, flat, flat.parent, item.data)
                    return;
                }
            });
        });

        createDimensionBar();
        setZoom();
        filterAutomateCreationBtns();
    }//

    //redraw Frame, Door, Window after profile changes has diffrent width
    function reDrawItem(item, newProfileWidth = false) {
        if (item.name == "mainFrame") {
            reDrawMainFrame(item.parent);
        } else if (item.name == "windowFrame" || item.name == "doorFrame") {
            let itemParent = item.parent;
            let memory = deleteItem(itemParent);
            let flats = paper.project.activeLayer.getItems({ name: "flat" });
            $.each(flats, function (key, flat) {
                if (flat.hitTest(itemParent.bounds.center)) {
                    let openingFlatData = false;
                    let openingFlatFillColor = false;
                    for (let k = 0; k < itemParent.children.length; k++) {
                        if (itemParent.children[k].name == "flat") {
                            openingFlatData = itemParent.children[k].data;
                            openingFlatFillColor = itemParent.children[k].fillColor;
                            break;
                        }
                    }
                    if (item.name == "windowFrame") {
                        addWindow(itemParent.name, flat, flat.parent, {
                            profile: itemParent.children[0].data,
                            flat: openingFlatData,
                            flatFillColor: openingFlatFillColor
                        })
                    } else if (item.name == "doorFrame") {
                        addDoor(itemParent.name, flat, flat.parent, {
                            profile: itemParent.children[0].data,
                            flat: openingFlatData,
                            flatFillColor: openingFlatFillColor
                        })
                    }
                    //redraw basgroup items of memory
                    reDrawMullianChildsOnDelete(memory)
                    return;
                }
            });
        } else if (item.name == "vPanel" || item.name == "hPanel") {
            deleteItem(item);
            let flats = paper.project.activeLayer.getItems({ name: "flat" });
            $.each(flats, function (key, flat) {
                if (flat.hitTest(item.bounds.center)) {
                    addPanel(item.name, flat, flat.parent, item.data)
                    return;
                }
            });
        } else if (item.name == "vMullian" || item.name == "hMullian") {
            let newMullian = changeMullianPosition(new paper.Point(item.bounds.centerX + 1, item.bounds.centerY + 1));
            // selectedItem = newMullian;
            // changeMullianPosition(new paper.Point(selectedItem.bounds.centerX - 1, selectedItem.bounds.centerY - 1));
        } else if (item.name == "vCoupling") {
            let movement = Number(newProfileWidth) - item.bounds.width;
            let vCoupling = paper.project.activeLayer.getItems({
                name: "vCoupling"
            });
            let hCoupling = paper.project.activeLayer.getItems({
                name: "hCoupling"
            });
            let sections = paper.project.activeLayer.getItems({
                name: "section"
            });
            for (let n = 0; n < vCoupling.length; n++) {
                if (vCoupling[n].id == item.id) {
                    item.segments[2].point.x = item.segments[2].point.x + movement; // upper right point
                    item.segments[3].point.x = item.segments[3].point.x + movement; // lower right point
                }
                if (vCoupling[n].bounds.topLeft.x > item.bounds.topLeft.x) {
                    vCoupling[n].position.x += movement;
                }
            }
            for (let n = 0; n < hCoupling.length; n++) {
                if (hCoupling[n].bounds.topLeft.x > item.bounds.topLeft.x) {
                    hCoupling[n].position.x += movement;
                }
            }
            for (let n = 0; n < sections.length; n++) {
                if (sections[n].bounds.topLeft.x > item.bounds.topLeft.x) {
                    sections[n].position.x += movement;
                }
            }
        } else if (item.name == "hCoupling") {
            let movement = Number(newProfileWidth) - item.bounds.height;
            let vCoupling = paper.project.activeLayer.getItems({
                name: "vCoupling"
            });
            let hCoupling = paper.project.activeLayer.getItems({
                name: "hCoupling"
            });
            let sections = paper.project.activeLayer.getItems({
                name: "section"
            });
            for (let n = 0; n < vCoupling.length; n++) {
                if (vCoupling[n].bounds.topLeft.y > item.bounds.topLeft.y) {
                    vCoupling[n].position.y += movement;
                }
            }
            for (let n = 0; n < hCoupling.length; n++) {
                if (hCoupling[n].id == item.id) {
                    item.segments[0].point.y = item.segments[0].point.y + movement; // lower left point
                    item.segments[3].point.y = item.segments[3].point.y + movement; // lower right point
                }
                if (hCoupling[n].bounds.topLeft.y > item.bounds.topLeft.y) {
                    hCoupling[n].position.y += movement;
                }
            }
            for (let n = 0; n < sections.length; n++) {
                if (sections[n].bounds.topLeft.y > item.bounds.topLeft.y) {
                    sections[n].position.y += movement;
                }
            }
        }
        $("#configMenuDropDown").trigger('click');
        createDimensionBar();
        paper.project.deselectAll();
    }//

    //delete items
    function deleteItem(toDeleteItem) {

        enableSave();

        if (['vMullian', 'hMullian'].includes(toDeleteItem.name)) {

            //slide windows
            if (unitData.type == "Slide") {
                if (toDeleteItem.parent.name == "window_slide") {
                    deleteItem(toDeleteItem.parent);
                    hideGLs();
                    return;
                } else {
                    let wslide = paper.project.activeLayer.getItem({ name: "window_slide" });

                    if (wslide) {
                        removedDependenceMemory.push(wslide);
                        deleteItem(wslide);
                    }
                    deleteItem(toDeleteItem.parent);
                    hideGLs();
                    return removedDependenceMemory;
                }
            }

            let findedBase = toDeleteItem.parent.getItem({
                name: "base"
            });

            if (findedBase) {
                //remeber depencies
                $.each(toDeleteItem.parent.children, function (key, item) {
                    if (item.id !== toDeleteItem.id) {
                        removedDependenceMemory.push(item);
                    }
                });

                //clone and delete item prent
                let baseToFlat = findedBase.clone();
                baseToFlat.moveAbove(findedBase.parent);
                baseToFlat.name = "flat";
                findedBase.parent.remove();

                vMGL.visible = false;
                vMGLT.visible = false;
                vMGRT.visible = false;
                hMGL.visible = false;
                hMGTT.visible = false;
                hMGBT.visible = false;
                createDimensionBar();
                return removedDependenceMemory;
            } else {
                showMessage('پنل حذف پیدا نشد!');
            }

        } else if (toDeleteItem.name.indexOf('Panel') !== -1 || toDeleteItem.name.indexOf('window_') !== -1 || toDeleteItem.name.indexOf('door_') !== -1) {
            let findedBase = toDeleteItem.parent.getItem({
                name: "base"
            });
            if (findedBase) {

                //remeber depencies
                $.each(toDeleteItem.children, function (key, item) {
                    removedDependenceMemory.push(item);
                });

                let baseToFlat = findedBase.clone();
                baseToFlat.moveAbove(findedBase.parent);
                baseToFlat.name = "flat";
                findedBase.parent.remove();

                return removedDependenceMemory;
            }
        } else if (toDeleteItem.name == "baseGroup") {
            let findedBase = toDeleteItem.getItem({
                name: "base"
            });
            if (findedBase) {
                let baseToFlat = findedBase.clone();
                baseToFlat.moveAbove(findedBase.parent);
                baseToFlat.name = "flat";
                toDeleteItem.remove();
            }
        } else if (toDeleteItem.name == "windowFrame" || toDeleteItem.name == "doorFrame") {
            if (toDeleteItem.parent.name == "slide") {
                deleteItem(toDeleteItem.parent.parent.parent);
            } else {
                let findedBase = toDeleteItem.parent.parent.getItem({
                    name: "base"
                });
                if (findedBase) {
                    //remeber depencies
                    $.each(toDeleteItem.parent.children, function (key, item) {
                        removedDependenceMemory.push(item);
                    });

                    let baseToFlat = findedBase.clone();
                    baseToFlat.moveAbove(findedBase.parent);
                    baseToFlat.name = "flat";
                    findedBase.parent.remove();

                    return removedDependenceMemory;
                }
            }
        } else if (toDeleteItem.name == 'flat') {
            if (toDeleteItem.parent) {
                if (toDeleteItem.parent.name == "slide") {
                    deleteItem(toDeleteItem.parent.parent.parent);
                } else if (toDeleteItem.parent.name == "window_slide") {
                    deleteItem(toDeleteItem.parent.parent);
                } else if (toDeleteItem.parent.name.indexOf('door_') !== -1 || toDeleteItem.parent.name.indexOf('window_') !== -1) {
                    deleteItem(toDeleteItem.parent.children[0]);
                } else if (toDeleteItem.parent.name.indexOf('section')) {
                    return;
                }
            }


        } else if (toDeleteItem.name == 'vCoupling' || toDeleteItem.name == 'hCoupling') {
            let sections = paper.project.activeLayer.getItems({
                name: "section"
            });
            toDeleteItem.remove();
            for (let i = 0; i < sections.length; i++) {
                if (toDeleteItem.name == 'vCoupling') {
                    if (sections[i].bounds.topLeft.x == toDeleteItem.bounds.topRight.x) {
                        deleteItem(sections[i]);
                        break;
                    }
                } else if (toDeleteItem.name == 'hCoupling') {
                    if (sections[i].bounds.topLeft.y == toDeleteItem.bounds.bottomLeft.y) {
                        deleteItem(sections[i]);
                        break;
                    }
                }
            }
        } else if (toDeleteItem.name == 'mainFrame') {
            let mains = paper.project.activeLayer.getItems({ name: "mainFrame" });
            if (toDeleteItem.bounds.topLeft.x < 100 && toDeleteItem.bounds.topLeft.y < 100) {
                showMessage("این فریم اصلی است. حذف کنی چیزی نمیمونه!");
            } else {
                deleteItem(toDeleteItem.parent);
            }
        } else if (toDeleteItem.name == 'section') {
            extendSectionDelete(toDeleteItem);
        }
        $('.itemDetails').html('');
        paper.project.deselectAll();
        createDimensionBar();
    }//

    //find side Coupling and Section for delete function
    function extendSectionDelete(section) {
        section.remove();

        let leftCoupling = paper.project.activeLayer.hitTest([section.bounds.topLeft.x - 1, section.bounds.topLeft.y]);
        if (leftCoupling && leftCoupling.item.name == "vCoupling") {
            leftCoupling.item.remove();
        }
        let topCoupling = paper.project.activeLayer.hitTest([section.bounds.topLeft.x, section.bounds.topLeft.y - 1]);
        if (topCoupling && topCoupling.item.name == "hCoupling") {
            topCoupling.item.remove();
        }

        let allSections = paper.project.activeLayer.getItems({
            name: "section"
        });

        let vCoupling = paper.project.activeLayer.hitTest([section.bounds.topRight.x + 1, section.bounds.topRight.y]);
        if (vCoupling && vCoupling.item.name == "vCoupling") {
            vCoupling.item.remove();
            for (let n = 0; n < allSections.length; n++) {
                if (allSections[n].bounds.topLeft.x == vCoupling.item.bounds.topRight.x && allSections[n].bounds.topLeft.y == vCoupling.item.bounds.topRight.y) {
                    extendSectionDelete(allSections[n]);
                    break;
                }
            }
        }
        let hCoupling = paper.project.activeLayer.hitTest([section.bounds.bottomLeft.x, section.bounds.bottomLeft.y + 1]);
        if (hCoupling && hCoupling.item.name == "hCoupling") {
            hCoupling.item.remove();
            for (let n = 0; n < allSections.length; n++) {
                if (allSections[n].bounds.topLeft.x == hCoupling.item.bounds.bottomLeft.x && allSections[n].bounds.topLeft.y == hCoupling.item.bounds.bottomLeft.y) {
                    extendSectionDelete(allSections[n]);
                    break;
                }
            }
        }
    }//

    //showMessage
    function showMessage(textMsg, timer = 2000) {
        Swal.fire({
            backdrop: false,
            text: textMsg,
            showConfirmButton: false,
            allowOutsideClick: false,
            timer: timer
        })
    }//

    //createDimensionBar
    function createDimensionBar() {

        let AllDimensions = paper.project.activeLayer.getItem({
            name: "dbG"
        });
        if (AllDimensions) {
            AllDimensions.remove();
        }

        dbG = new paper.Group();
        dbG.name = "dbG";

        let xBarPosition = 0;
        let yBarPosition = 0;

        let allSections = paper.project.activeLayer.getItems({
            name: "section"
        });
        let AllvMullians = paper.project.activeLayer.getItems({
            name: "vMullian"
        });
        let AllhMullians = paper.project.activeLayer.getItems({
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
            vMulliansPositions.filter((item, index) => vMulliansPositions.indexOf(item) === index);
            hMulliansPositions.filter((item, index) => hMulliansPositions.indexOf(item) === index);
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
            for (let index = 0; index < vMulliansPositions.length; index++) {
                let previousX = allSections[i].bounds.x;
                if (index > 0) {
                    previousX = vMulliansPositions[index - 1];
                }
                let textcontent = round2decimal(Math.abs(previousX - vMulliansPositions[index]));
                if (textcontent > 0) {
                    let newxBar = new paper.Path()
                    newxBar.moveTo(new paper.Point(previousX, xBarPosition));
                    newxBar.lineTo(new paper.Point(previousX, xBarPosition + 30));
                    newxBar.lineTo(new paper.Point(vMulliansPositions[index], xBarPosition + 30));
                    newxBar.lineTo(new paper.Point(vMulliansPositions[index], xBarPosition));
                    newxBar.strokeColor = otherBarColor;
                    newxBar.strokeWidth = 2;
                    newxBar.name = 'xBar';
                    dbG.addChild(newxBar);
                    let text = new paper.PointText(new paper.Point(previousX + (Math.abs(previousX - vMulliansPositions[index]) / 2) - 30, xBarPosition + 75));
                    text.content = textcontent;
                    text.fillColor = otherBarColor;
                    text.fontSize = DimensionBarTextSize2;
                    text.rotation = 0;
                    text.name = 'xBarT';
                    text.data.section = allSections[i].id;
                    text.data.position = vMulliansPositions[index];
                    dbG.addChild(text);
                }
            }

            let mainFrameProfile = allSections[i].children.mainFrame.data.profile || 0;
            let frameType = $('.frameInput option[value="' + mainFrameProfile + '"]').data('type') || 0;
            if (extra_frame_lenght == 0 && frameType !== "Frame") {
                extra_frame_lenght = 20;//sash for frame
            }

            //draw mainXbar
            xBarPosition += 75;
            let mainxBar = new paper.Path()
            mainxBar.moveTo(new paper.Point(allSections[i].bounds.x + extra_frame_lenght, xBarPosition))
            mainxBar.lineTo(new paper.Point(allSections[i].bounds.x + extra_frame_lenght, xBarPosition + 30))
            mainxBar.lineTo(new paper.Point(allSections[i].bounds.x - extra_frame_lenght + allSections[i].bounds.width, xBarPosition + 30));
            mainxBar.lineTo(new paper.Point(allSections[i].bounds.x - extra_frame_lenght + allSections[i].bounds.width, xBarPosition))
            mainxBar.strokeColor = mainBarColor;
            mainxBar.strokeWidth = 2;
            mainxBar.name = 'mXBar';
            dbG.addChild(mainxBar);
            text = new paper.PointText(new paper.Point(allSections[i].bounds.centerX - 50, xBarPosition + 90));
            text.content = round2decimal(allSections[i].bounds.width - (extra_frame_lenght * 2));
            if (extra_frame_lenght > 0) {
                text.content = round2decimal(allSections[i].bounds.width - (extra_frame_lenght * 2)) + ' [' + round2decimal(allSections[i].bounds.width) + ']';
            }
            text.fillColor = mainBarColor;
            text.fontSize = DimensionBarTextSize1;
            text.rotation = 0;
            text.name = 'mXBarT';
            text.data.section = allSections[i].id;
            dbG.addChild(text);
            if (extra_frame_lenght > 0) {
                let mainxBar_extra = new paper.Path()
                mainxBar_extra.moveTo(new paper.Point(allSections[i].bounds.x, xBarPosition + 30))
                mainxBar_extra.lineTo(new paper.Point(allSections[i].bounds.x + extra_frame_lenght, xBarPosition + 30));
                mainxBar_extra.strokeColor = 'purple';
                mainxBar_extra.strokeWidth = 2;
                mainxBar_extra.name = 'mXBar_extra';
                dbG.addChild(mainxBar_extra);
                text = new paper.PointText(new paper.Point(extra_frame_lenght / 4, xBarPosition + 75));
                text.content = round2decimal(extra_frame_lenght);
                text.fillColor = 'purple';
                text.fontSize = 30;
                text.rotation = 0;
                text.name = 'mXBarT_extra';
                text.data.section = allSections[i].id;
                dbG.addChild(text);

                let mainxBar_extra2 = new paper.Path()
                mainxBar_extra2.moveTo(new paper.Point(allSections[i].bounds.x - extra_frame_lenght + allSections[i].bounds.width, xBarPosition + 30))
                mainxBar_extra2.lineTo(new paper.Point(allSections[i].bounds.x + allSections[i].bounds.width, xBarPosition + 30));
                mainxBar_extra2.strokeColor = 'purple';
                mainxBar_extra2.strokeWidth = 2;
                mainxBar_extra2.name = 'mXBar_extra';
                dbG.addChild(mainxBar_extra2);
                text = new paper.PointText(new paper.Point(allSections[i].bounds.x - extra_frame_lenght + allSections[i].bounds.width, xBarPosition + 75));
                text.content = round2decimal(extra_frame_lenght);
                text.fillColor = 'purple';
                text.fontSize = 30;
                text.rotation = 0;
                text.name = 'mXBarT_extra';
                text.data.section = allSections[i].id;
                dbG.addChild(text);
            }

            //draw hMullian bars
            for (let index = 0; index < hMulliansPositions.length; index++) {
                let previousY = allSections[i].bounds.y;
                if (index > 0) {
                    previousY = hMulliansPositions[index - 1];
                }
                let textcontent = round2decimal(Math.abs(previousY - hMulliansPositions[index]));
                if (textcontent > 0) {
                    let newxBar = new paper.Path()
                    newxBar.moveTo(new paper.Point(yBarPosition, previousY));
                    newxBar.lineTo(new paper.Point(yBarPosition - 30, previousY));
                    newxBar.lineTo(new paper.Point(yBarPosition - 30, hMulliansPositions[index]));
                    newxBar.lineTo(new paper.Point(yBarPosition, hMulliansPositions[index]));
                    newxBar.strokeColor = otherBarColor;
                    newxBar.strokeWidth = 2;
                    newxBar.name = 'yBar';
                    dbG.addChild(newxBar);
                    let text = new paper.PointText(new paper.Point(yBarPosition - 90, previousY + (Math.abs(previousY - hMulliansPositions[index]) / 2) + 20));
                    text.content = textcontent;
                    text.fillColor = otherBarColor;
                    text.fontSize = DimensionBarTextSize2;
                    text.rotation = -90;
                    text.name = 'yBarT';
                    text.data.section = allSections[i].id;
                    text.data.position = hMulliansPositions[index];
                    dbG.addChild(text);
                }

            }

            let bottomDoorHeight = allSections[i]?.children.mainFrame?.data?.bottomdoor || 0;
            let extra_frame_lenght_yBottom = (bottomDoorHeight > 0) ? 0 : extra_frame_lenght;
            //draw mainYbars
            yBarPosition -= 75;
            let mainyBar = new paper.Path()
            mainyBar.moveTo(new paper.Point(yBarPosition, allSections[i].bounds.y + extra_frame_lenght))
            mainyBar.lineTo(new paper.Point(yBarPosition - 30, allSections[i].bounds.y + extra_frame_lenght))
            mainyBar.lineTo(new paper.Point(yBarPosition - 30, allSections[i].bounds.y + allSections[i].bounds.height - extra_frame_lenght_yBottom))
            mainyBar.lineTo(new paper.Point(yBarPosition, allSections[i].bounds.y + allSections[i].bounds.height - extra_frame_lenght_yBottom))
            mainyBar.strokeColor = mainBarColor;
            mainyBar.strokeWidth = 2;
            mainyBar.name = 'mYBar';
            dbG.addChild(mainyBar);
            text = new paper.PointText(new paper.Point(yBarPosition - ((extra_frame_lenght > 0) ? 230 : 130), allSections[i].bounds.centerY));
            text.content = round2decimal(allSections[i].bounds.height - (extra_frame_lenght + extra_frame_lenght_yBottom));
            if (extra_frame_lenght > 0) {
                text.content = round2decimal(allSections[i].bounds.height - (extra_frame_lenght + extra_frame_lenght_yBottom)) + ' [' + round2decimal(allSections[i].bounds.height) + ']';
            }
            text.fillColor = mainBarColor;
            text.fontSize = DimensionBarTextSize1;
            text.rotation = -90;
            text.name = 'mYBarT';
            text.data.section = allSections[i].id;
            dbG.addChild(text);
            if (extra_frame_lenght > 0) {
                let mainyBar_extra = new paper.Path()
                mainyBar_extra.moveTo(new paper.Point(yBarPosition - 30, allSections[i].bounds.y))
                mainyBar_extra.lineTo(new paper.Point(yBarPosition - 30, allSections[i].bounds.y + extra_frame_lenght))
                mainyBar_extra.strokeColor = 'purple';
                mainyBar_extra.strokeWidth = 2;
                mainyBar_extra.name = 'mYBar_extra';
                dbG.addChild(mainyBar_extra);
                text = new paper.PointText(new paper.Point(yBarPosition - 90, allSections[i].bounds.y + (extra_frame_lenght / 2)));
                text.content = extra_frame_lenght;
                text.fillColor = 'purple';
                text.fontSize = 30;
                text.rotation = -90;
                text.name = 'mYBarT_extra';
                text.data.section = allSections[i].id;
                dbG.addChild(text);

                if (extra_frame_lenght_yBottom > 0) {
                    let mainyBar_extra2 = new paper.Path()
                    mainyBar_extra2.moveTo(new paper.Point(yBarPosition - 30, allSections[i].bounds.y + allSections[i].bounds.height - extra_frame_lenght))
                    mainyBar_extra2.lineTo(new paper.Point(yBarPosition - 30, allSections[i].bounds.y + allSections[i].bounds.height))
                    mainyBar_extra2.strokeColor = 'purple';
                    mainyBar_extra2.strokeWidth = 2;
                    mainyBar_extra2.name = 'mYBar_extra';
                    dbG.addChild(mainyBar_extra2);
                    text = new paper.PointText(new paper.Point(yBarPosition - 90, allSections[i].bounds.y + allSections[i].bounds.height - (extra_frame_lenght / 2)));
                    text.content = extra_frame_lenght;
                    text.fillColor = 'purple';
                    text.fontSize = 30;
                    text.rotation = -90;
                    text.name = 'mYBarT_extra';
                    text.data.section = allSections[i].id;
                    dbG.addChild(text);
                }
            }
            yBarPosition -= 75;
        }


        let couplings = paper.project.activeLayer.getItems({
            name: "vCoupling"
        });
        for (let i = 0; i < couplings.length; i++) {
            xBarPosition = couplings[i].bounds.y + couplings[i].bounds.height + 30;
            let couple = couplings[i];
            let cBar = new paper.Path()
            cBar.moveTo(new paper.Point(couple.bounds.x, xBarPosition))
            cBar.lineTo(new paper.Point(couple.bounds.x, xBarPosition + 30))
            cBar.lineTo(new paper.Point(couple.bounds.x + couple.bounds.width, xBarPosition + 30));
            cBar.lineTo(new paper.Point(couple.bounds.x + couple.bounds.width, xBarPosition))
            cBar.strokeColor = '#666';
            cBar.strokeWidth = 2;
            cBar.name = 'cXBar';
            dbG.addChild(cBar);
            text = new paper.PointText(new paper.Point(couple.bounds.centerX - 25, xBarPosition + 90));
            text.content = round2decimal(couple.bounds.width);
            text.fillColor = '#666';
            text.fontSize = DimensionBarTextSize2;
            text.rotation = 0;
            text.name = 'cXBarT';
            dbG.addChild(text);
        }
        couplings = paper.project.activeLayer.getItems({
            name: "hCoupling"
        });
        for (let i = 0; i < couplings.length; i++) {
            yBarPosition = -30;
            let couple = couplings[i];
            let cBar = new paper.Path()
            cBar.moveTo(new paper.Point(yBarPosition, couple.bounds.y))
            cBar.lineTo(new paper.Point(yBarPosition - 30, couple.bounds.y))
            cBar.lineTo(new paper.Point(yBarPosition - 30, couple.bounds.y + couple.bounds.height))
            cBar.lineTo(new paper.Point(yBarPosition, couple.bounds.y + couple.bounds.height))
            cBar.strokeColor = '#666';
            cBar.strokeWidth = 2;
            cBar.name = 'cYBar';
            dbG.addChild(cBar);
            text = new paper.PointText(new paper.Point(yBarPosition - 130, couple.bounds.centerY + 20));
            text.content = round2decimal(couple.bounds.height);
            text.fillColor = '#666';
            text.fontSize = DimensionBarTextSize2;
            text.rotation = -90;
            text.name = 'cYBarT';
            dbG.addChild(text);
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
    }//

    //Flats Dimension Text
    function itemsDimensionText() {
        let flatDimensions = paper.project.activeLayer.getItems({ name: "DimensionText" });
        $.each(flatDimensions, function (key, item) {
            item.remove();
        });

        let flats = paper.project.activeLayer.getItems({ name: "flat" });
        $.each(flats, function (key, flat) {
            glassMarginInsideProfile = findGlassMargin(flat.parent.name);
            let newItem = PaperOffset.offset(flat, -glassMarginInsideProfile);
            let text = new paper.PointText({
                point: flat.bounds.center,
                content: round2decimal(newItem.bounds.width) + "x" + round2decimal(newItem.bounds.height),
                fillColor: "grey",
                justification: "center",
                fontSize: 40
            });
            newItem.remove();
            text.name = "DimensionText";
            text.parent = flat.parent;
        });

        let winDoors = paper.project.activeLayer.getItems({
            name: function (value) {
                return value.indexOf('window_') !== -1 || value.indexOf('door_') !== -1;
            }
        });

        $.each(winDoors, function (key, item) {
            let dFrames = item.getItems({
                name: function (value) {
                    return ['windowFrame', 'doorFrame'].includes(value);
                }
            });
            $.each(dFrames, function (key2, frame) {
                let text = new paper.PointText({
                    point: [frame.bounds.topCenter.x, frame.bounds.bottomCenter.y - 15],
                    content: round2decimal(frame.bounds.width) + "x" + round2decimal(frame.bounds.height),
                    fillColor: "grey",
                    justification: "center",
                    fontWeight: "bold",
                    fontSize: 40
                });
                text.name = "DimensionText";
                text.parent = item.parent;
            });
        });

        let panels = paper.project.activeLayer.getItems({
            name: function (value) {
                return value.indexOf('Panel') !== -1;
            }
        });

        $.each(panels, function (key, item) {
            glassMarginInsideProfile = findGlassMargin(item.parent.parent.name);
            let text = new paper.PointText({
                point: item.bounds.center,
                content: round2decimal(item.bounds.width - (glassMarginInsideProfile * 2)) + "x" + round2decimal(item.bounds.height - (glassMarginInsideProfile * 2)),
                fillColor: "grey",
                justification: "center",
                fontSize: 40
            });
            text.name = "DimensionText";
            text.parent = item;
        });
    }//

    ///////////////////////////////////////////////////////////
    //save Undo Redo record
    function saveHistory() {
        if (history.length >= 15) {
            history.shift();
        }
        history.push(paper.project.exportJSON());
        history_index = history.length - 1;
        $('.redo').prop('disabled', true);
        $('.undo').prop('disabled', false);
    }//

    //save project to db
    function saveDesign(designID = false, silence = false) {
        $('#rightCanvas').offcanvas('hide');
        return new Promise((resolve, reject) => {
            if (somethingChanged) {
                somethingChanged = false;
                if (!silence) {
                    Swal.fire({
                        title: '<i class="ti ti-inner-shadow-left icon icon-lg icon-rotate"></i>',
                        text: "در حال ذخیره ...",
                        footer: "شکیبا باشید",
                        showConfirmButton: false,
                        allowOutsideClick: false,
                        //timer: 5000,
                    });
                }
                $('#saveProject').show();
                $('#saveProject').html('<i class="ti ti-loader icon icon-rotate"></i>');
                $('#saveProject').prop('disabled', true);

                calculate();
                if (debug) {
                    console.log(calculations);
                }

                let svg = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' +
                    paper.project.activeLayer.bounds.width + '" height="' + paper.project.activeLayer.bounds.height + '" viewBox="' +
                    paper.project.activeLayer.bounds.x + ',' + paper.project.activeLayer.bounds.y + ',' +
                    paper.project.activeLayer.bounds.width + ',' + paper.project.activeLayer.bounds.height + '">' +
                    paper.project.activeLayer.exportSVG({
                        bounds: "content",
                        asString: true
                    }) + '</svg>';

                $.ajax({
                    url: saveProjectRoute,
                    type: "POST",
                    data: {
                        _token: $('meta[name="csrf-token"]').attr('content'),
                        designID: designID,
                        data: JSON.stringify(unitData),
                        design: paper.project.exportJSON(),
                        svg: svg,
                        calculations: JSON.stringify(calculations),
                    },
                    cache: false,
                    success: function (dataResult) {
                        if (dataResult.indexOf('RecordID:') !== -1) {
                            currentDesignID = Number(dataResult.replace('RecordID:', ''));

                            $('.saveCard').removeClass('bg-danger');
                            $('#saveProject').html('<i class="ti ti-check icon"></i>');
                            setTimeout(function () {
                                $('#saveProject').hide();
                            }, 1000);

                            if (!designID) {
                                $('#countDesign').html(Number($('#countDesign').html()) + 1);
                            }
                            $('.layerName').val(unitData['name']);
                            $('.location').val(unitData['location']);
                            $('.layerQuantity').val(unitData['quantity']);

                            resolve(); // ✅ success
                        } else {
                            $('.saveCard').addClass('bg-danger');
                            $('#saveProject').html('<i class="ti ti-device-floppy icon"></i>');
                            $('#saveProject').prop('disabled', false);
                            $('#saveProject').show();
                            reject(dataResult); // ❌ error in result
                            somethingChanged = true;
                        }
                        Swal.close();
                        loadLayerList();
                    },
                    error: function (error) {
                        $('.saveCard').addClass('bg-danger');
                        $('#saveProject').html('<i class="ti ti-device-floppy icon"></i>');
                        $('#saveProject').prop('disabled', false);
                        $('#saveProject').show();
                        reject(error); // ❌ AJAX error
                        Swal.close();
                        somethingChanged = true;
                    }
                });
                set3D();
            } else {
                resolve(); // no changes, so just continue
            }

            $('.mousePosition').html(unitData['name']);
        });
    }//

    //Import function
    function importToProject(importCode) {
        if (importCode !== "" && importCode !== "[]" && importCode !== '[["Layer",{"applyMatrix":true}]]') {
            paper.project.clear();
            paper.project.importJSON(importCode);
            paper.project.view.update();
            mainSection = paper.project.activeLayer.getItem({
                name: "section"
            });
            mainFrame = paper.project.activeLayer.getItem({
                name: "mainFrame"
            });
            mainFlat = paper.project.activeLayer.getItem({
                name: "mainFlat"
            });

            if (mainFrame && mainFlat) {
                extra_frame_lenght = parseFloat($('.frameInput option[value="' + mainFrame.data.profile + '"]').data('extra_frame_lenght') || 0);
                updateLayerDetailsMenuOptions();
                createGLs();
                createDimensionBar();
                setZoom();

                let glassColor = $('.glassInput option[value=' + unitData.glass_id + ']').data('color');
                flatColor = new paper.Color(glassColor);

                $('.layerName').val(unitData['name']);
                $('.location').val(unitData['location']);
                $('.layerQuantity').val(unitData['quantity']);
                $('#pattern_id').val(unitData['pattern_id']);

                defaultOverlap = (unitData['system'] == "Al") ? 6 : 8;
                mullianExtend = (unitData['system'] == "Al") ? 0 : 3;

                filterAutomateCreationBtns();
                set3D();

                if (!$('#glassBox').hasClass('closed')) {
                    $('#glassBox').addClass('closed');
                    $('#toggleIcon').html('<i class="ti ti-chevron-left"></i>');
                }

            } else {
                paper.project.clear();
                showMessage('خطا در ایمپورت اطلاعات');
            }
        }
    }//

    //recuring selectin on mouse down
    function recuringSelectItem(group, point) {
        if (["mainFrame", "vPanel", "hPanel"].includes(group.name)) {
            group.selected = true;
            selectedItem = group;
        } else {
            for (let index = 0; index < group.children.length; index++) {
                let item = group.children[index];
                if (item.hitTest(point) && item.name !== "base") {
                    if (["windowFrame", "doorFrame", "vPanel", "hPanel"].includes(item.name)) {
                        item.selected = true;
                        selectedItem = item;
                        break;
                    } else {
                        if (item.hasChildren()) {
                            recuringSelectItem(item, point);
                        } else {
                            item.selected = true;
                            selectedItem = item;
                            if (["vMullian", "hMullian"].includes(selectedItem.name)) {
                                previousSelectedItem = selectedItem;
                            }
                            break;
                        }
                    }
                }
            }
        }
    }//

    //update config menu of items option base on layer profile_id, accessory_id, glass_id , ...
    function updateLayerDetailsMenuOptions() {
        if (unitData['type'] == "Turn") {
            $('.ofcTurn').prop('disabled', false);
            $('.ofcSlide').prop('disabled', true);
        } else {
            $('.ofcTurn').prop('disabled', true);
            $('.ofcSlide').prop('disabled', false);
        }

        $('.frameInput[data-id="profile"] option').hide();
        $('.frameInput[data-id="profile"] option').attr("disabled", true);
        $('.frameInput[data-id="profile"] option[data-profile_id=' + unitData.profile_id + ']').show();
        $('.frameInput[data-id="profile"] option[data-profile_id=' + unitData.profile_id + ']').attr("disabled", false);
        $('.doorSashInput[data-id="profile"] option').hide();
        $('.doorSashInput[data-id="profile"] option').attr("disabled", true);
        $('.doorSashInput[data-id="profile"] option[data-profile_id=' + unitData.profile_id + ']').show();
        $('.doorSashInput[data-id="profile"] option[data-profile_id=' + unitData.profile_id + ']').attr("disabled", false);
        $('.windowSashInput[data-id="profile"] option').hide();
        $('.windowSashInput[data-id="profile"] option').attr("disabled", true);
        $('.windowSashInput[data-id="profile"] option[data-profile_id=' + unitData.profile_id + ']').show();
        $('.windowSashInput[data-id="profile"] option[data-profile_id=' + unitData.profile_id + ']').attr("disabled", false);
        $('.panelInput[data-id="profile"] option').hide();
        $('.panelInput[data-id="profile"] option').attr("disabled", true);
        $('.panelInput[data-id="profile"] option[data-profile_id=' + unitData.profile_id + ']').show();
        $('.panelInput[data-id="profile"] option[data-profile_id=' + unitData.profile_id + ']').attr("disabled", false);
        $('.mullianInput[data-id="profile"] option').hide();
        $('.mullianInput[data-id="profile"] option').attr("disabled", true);
        $('.mullianInput[data-id="profile"] option[data-profile_id=' + unitData.profile_id + ']').show();
        $('.mullianInput[data-id="profile"] option[data-profile_id=' + unitData.profile_id + ']').attr("disabled", false);
        $('.glazingInput[data-id="glazing"] option').hide();
        $('.glazingInput[data-id="glazing"] option').attr("disabled", true);
        $('.glazingInput[data-id="glazing"] option[data-profile_id=' + unitData.profile_id + ']').show();
        $('.glazingInput[data-id="glazing"] option[data-profile_id=' + unitData.profile_id + ']').attr("disabled", false);
        $('.accessoryInput option').hide();
        $('.accessoryInput option').attr("disabled", true);
        $('.accessoryInput option[data-system=' + unitData.system + ']').show();
        $('.accessoryInput option[data-system=' + unitData.system + ']').attr("disabled", false);
        $('.couplingInput[data-id="profile"] option').hide();
        $('.couplingInput[data-id="profile"] option').attr("disabled", true);
        $('.couplingInput[data-id="profile"] option[data-profile_id=' + unitData.profile_id + ']').show();
        $('.couplingInput[data-id="profile"] option[data-profile_id=' + unitData.profile_id + ']').attr("disabled", false);
        $('.enterlockInput[data-id="profile"] option').hide();
        $('.enterlockInput[data-id="profile"] option').attr("disabled", true);
        $('.enterlockInput[data-id="profile"] option[data-profile_id=' + unitData.profile_id + ']').show();
        $('.enterlockInput[data-id="profile"] option[data-profile_id=' + unitData.profile_id + ']').attr("disabled", false);

        firstGlass = Number(unitData.glass_id);
        firstGlassColor = $('.glassInput option[value=' + firstGlass + ']').data('color');
        firstGlassGroup = $('.glassInput option[value=' + firstGlass + ']').data('group');
        let default_frame = 0;
        if ($('#pattern_id').val() > 0) {
            default_frame = Number($('#pattern_id').find(':selected').data('default_frame'));
        }
        firstFrame = (default_frame > 0) ? default_frame : Number($('.frameInput[data-id="profile"] option:not([disabled]):first').val());
        firstFrame_width = (default_frame > 0) ? Number($('.frameInput[data-id="profile"]').find('option:not([disabled])[value="' + default_frame + '"]').attr('data-width')) : Number($('.frameInput[data-id="profile"] option:not([disabled]):first').attr('data-width'));
        firstDoorSash = Number($('.doorSashInput[data-id="profile"] option:not([disabled]):first').val());
        firstDoorSash_width = Number($('.doorSashInput[data-id="profile"] option:not([disabled]):first').attr('data-width'));
        firstWindowSash = Number($('.windowSashInput[data-id="profile"] option:not([disabled]):first').val());
        firstWindowSash_width = Number($('.windowSashInput[data-id="profile"] option:not([disabled]):first').attr('data-width'));
        firstAccessory = Number(unitData.accessory_id);
        firstAccessoryType = Number($('.accessoryTypeInput[data-id="accessoryType"] option:not([disabled]):first').val());
        firstLockType = Number($('.doorSashLock[data-id="lockType"] option:not([disabled]):first').val());
        firstLace = Number($('.laceInput[data-id="lace"] option:not([disabled]):first').val());
        firstPanel = Number($('.panelInput[data-id="profile"] option:not([disabled]):first').val());
        firstPanel_width = Number($('.panelInput[data-id="profile"] option:not([disabled]):first').attr('data-width'));
        firstMullian = Number($('.mullianInput[data-id="profile"] option:not([disabled]):first').val());
        firstMullian_width = Number($('.mullianInput[data-id="profile"] option:not([disabled]):first').attr('data-width'));
        firstOverhung = Number($('.mullianInput[data-id="profile"] option[data-type="Overhung"]:not([disabled]):first').val());
        firstOverhung_width = Number($('.mullianInput[data-id="profile"] option[data-type="Overhung"]:not([disabled]):first').attr('data-width'));
        firstGlazing = Number($('.glazingInput[data-id="glazing"] option:not([disabled]):first').val());
        $('.glazingInput[data-id="glazing"] option:not([disabled])').each(function () {
            let gWidth = Number($(this).data('width'));
            let minRange = firstGlassGroup * 10;
            let maxRange = (firstGlassGroup + 1) * 10;
            if (gWidth >= minRange && gWidth < maxRange) {
                firstGlazing = $(this).val();
            }
        });
        firstCoupling = Number($('.couplingInput[data-id="profile"] option:not([disabled]):first').val());
        firstCoupling_width = Number($('.couplingInput[data-id="profile"] option:not([disabled]):first').attr('data-width'));
        firstEnterlock = Number($('.enterlockConfig option:not([disabled]):first').val());
        firstEnterlock_width = Number($('.enterlockConfig option:not([disabled]):first').attr('data-width')) || 0;
        firstEnterlock_sash_space = Number($('.enterlockConfig option:not([disabled]):first').attr('data-sash_space')) || 0;
        firstCornic = Number($('.cornicInput[data-id="cornic"] option:not([disabled]):first').val());
        firstBottomDoor = Number($('.bottomdoorInput[data-id="bottomdoor"] option:not([disabled]):first').val());
        firstThreshold = Number($('.thresholdInput[data-id="threshold"] option:not([disabled]):first').val());

    }//

    //set items default components id
    function setDefaultData(item, type) { //type = resetAllProfiles, resetAllAccessories, resetAllGlasses, mainFrame, flat, mullian, panel, doorFrame, windowFrame, lace, coupling
        updateLayerDetailsMenuOptions();
        if (type == "resetAllProfiles") {
            let allItems = paper.project.activeLayer.getItems({
                name: function (value) {
                    return ['vMullian', 'hMullian', 'mainFrame', 'windowFrame', 'doorFrame', 'vPanel', 'hPanel', 'flat'].includes(value);
                }
            });
            for (let index = (allItems.length - 1); index >= 0; index--) {
                if (allItems[index].name && allItems[index].name == "windowFrame") {
                    let frame_profileWidth = allItems[index].data.profile_width;
                    allItems[index].data.profile = firstWindowSash;
                    allItems[index].data.profile_width = firstWindowSash_width;
                    //change children profile to have a nice reDraw
                    resetProfileDataTypeOfWindowDoorSubItems(allItems[index]);
                    if (frame_profileWidth != firstWindowSash_width) {
                        reDrawItem(allItems[index]);
                    }
                } else if (allItems[index].name && allItems[index].name == "doorFrame") {
                    let frame_profileWidth = allItems[index].data.profile_width;
                    allItems[index].data.profile = firstDoorSash;
                    allItems[index].data.profile_width = firstDoorSash_width;
                    //change children profile to have a nice reDraw
                    resetProfileDataTypeOfWindowDoorSubItems(allItems[index]);
                    if (frame_profileWidth != firstDoorSash_width) {
                        reDrawItem(allItems[index]);
                    }
                } else if (allItems[index].name && allItems[index].name.indexOf('Panel') !== -1) {
                    let frame_profileWidth = allItems[index].data.profile_width;
                    allItems[index].data.profile = firstPanel;
                    allItems[index].data.profile_width = firstPanel_width;
                    if (frame_profileWidth != firstPanel_width) {
                        reDrawItem(allItems[index]);
                    }
                } else if (allItems[index].name && allItems[index].name.indexOf('Mullian') !== -1) {
                    let frame_profileWidth = allItems[index].data.profile_width;
                    allItems[index].data.profile = firstMullian;
                    allItems[index].data.profile_width = firstMullian_width;
                    if (frame_profileWidth != firstMullian_width) {
                        reDrawItem(allItems[index]);
                    }
                } else if (allItems[index].name && allItems[index].name.indexOf('flat') !== -1 || allItems[index].name && allItems[index].name.indexOf('base') !== -1) {
                    allItems[index].data.glazing = firstGlazing;
                } else if (allItems[index].name && allItems[index].name.indexOf("mainFrame") !== -1) {
                    let frame_profileWidth = allItems[index].data.profile_width;
                    allItems[index].data.profile = firstFrame;
                    allItems[index].data.profile_width = firstFrame_width;
                    allItems[index].data.cornic = firstCornic;
                    allItems[index].data.bottomdoor = firstBottomDoor;
                    allItems[index].data.threshold = firstThreshold;
                    if (frame_profileWidth != firstFrame_width) {
                        reDrawMainFrame(allItems[index].parent);
                    }
                }
            }
        } else if (type == "resetAllProfilesColors") {
            let allitems = paper.project.activeLayer.getItems({
                name: function (value) {
                    return ['vMullian', 'hMullian', 'mainFrame', 'windowFrame', 'doorFrame', 'hinge', 'handle', 'handleHand', 'vPanel', 'hPanel'].includes(value);
                }
            });
            for (let n = 0; n < allitems.length; n++) {
                allitems[n].fillColor = unitData['profile_color_hex'];
            }
        } else if (type == "resetAllAccessories") {
            let allItems = paper.project.activeLayer.getItems({
                name: function (value) {
                    return ['windowFrame', 'doorFrame'].includes(value);
                }
            });
            for (let index = 0; index < allItems.length; index++) {
                if (typeof allItems[index].data == "undefined") {
                    allItems[index].data = {};
                    allItems[index].data.profile = firstDoorSash;
                    allItems[index].data.profile_width = firstDoorSash_width;
                    allItems[index].data.lace = firstLace;
                }
                allItems[index].data.accessory = firstAccessory;
                allItems[index].data.accessoryType = firstAccessoryType;
                allItems[index].data.lockType = firstLockType;
            }
        } else if (type == "resetAllGlasses") {
            flatColor = new paper.Color(firstGlassColor);
            let allItems = paper.project.activeLayer.getItems({
                name: function (value) {
                    return ['flat', 'base'].includes(value);
                }
            });
            for (let index = 0; index < allItems.length; index++) {
                if (typeof allItems[index].data == "undefined") {
                    allItems[index].data = {};
                    allItems[index].data.lace = firstLace;
                    allItems[index].data.profile = firstFrame; //set frame for no opening. after change to opening it should change to sash frame
                }
                allItems[index].data.glass = firstGlass;
                allItems[index].fillColor = flatColor;
                allItems[index].data.glazing = firstGlazing;
            }
        } else {
            item.data = {};
            if (type == "mainFrame") {
                item.data.profile = firstFrame;
                item.data.profile_width = firstFrame_width;
                item.data.cornic = firstCornic;
                item.data.bottomdoor = firstBottomDoor;
                item.data.threshold = firstThreshold;
            } else if (type == "flat") {
                item.data.glass = firstGlass;
                item.data.glazing = firstGlazing;
                flatColor = new paper.Color(firstGlassColor);
            } else if (['mullian', 'vMullian', 'hMullian'].includes(type)) {
                item.data.profile = firstMullian;
                item.data.profile_width = firstMullian_width;
                item.data.overhung = 0;
            } else if (['panel', 'vPanel', 'hPanel'].includes(type)) {
                item.data.profile = firstPanel;
                item.data.glazing = firstGlazing;
                item.data.profile_width = firstPanel_width;
            } else if (type == "doorFrame") {
                item.data.profile = firstDoorSash;
                item.data.lace = firstLace;
                item.data.accessory = firstAccessory;
                item.data.accessoryType = firstAccessoryType;
                item.data.lockType = firstLockType;
                item.data.profile_width = firstDoorSash_width;
            } else if (type == "windowFrame") {
                item.data.profile = firstWindowSash;
                item.data.lace = firstLace;
                item.data.accessory = firstAccessory;
                item.data.accessoryType = firstAccessoryType;
                item.data.lockType = firstLockType;
                item.data.profile_width = firstWindowSash_width;
            } else if (type == "lace") {
                item.data.lace = firstLace;
            } else if (type == "coupling") {
                item.data.profile = firstCoupling;
                item.data.profile_width = firstCoupling_width;
            }
        }
        enableSave();
    }//

    function resetProfileDataTypeOfWindowDoorSubItems(item) {
        if (item.name && item.name.indexOf('window_') !== -1 || item.name.indexOf('door_') !== -1 || item.name.indexOf('windowFrame') !== -1 || item.name.indexOf('doorFrame') !== -1) {
            for (let j = 0; j < item.children.length; j++) {
                if (item.children[j].name && item.children[j].name.indexOf('Mullian') !== -1) {
                    item.children[j].data.profile = firstMullian;
                    item.children[j].data.profile_width = firstMullian_width;
                } else if (item.children[j].name && item.children[j].name.indexOf('Panel') !== -1) {
                    item.children[j].data.profile = firstPanel;
                    item.children[j].data.profile_width = firstPanel_width;
                } else if (item.children[j].name && item.children[j].name.indexOf('window_') !== -1) {
                    item.children[j].data.profile = firstWindowSash;
                    item.children[j].data.profile_width = firstWindowSash_width;
                    resetProfileDataTypeOfWindowDoorSubItems(item.children[j])
                } else if (item.children[j].name && item.children[j].name.indexOf('door_') !== -1) {
                    item.children[j].data.profile = firstDoorSash;
                    item.children[j].data.profile_width = firstDoorSash_width;
                    resetProfileDataTypeOfWindowDoorSubItems(item.children[j])
                } else if (item.children[j].name && item.children[j].name.indexOf('flat') !== -1 || item.children[j].name && item.children[j].name.indexOf('base') !== -1) {
                    item.children[j].data.glazing = firstGlazing;
                } else if (item.children[j].name && item.children[j].name.indexOf('wframeInOut') !== -1) {
                    item.children[j].data.glazing = firstGlazing;
                }
            }
        }
    }//

    function itemDetailsBar(selectedItem) {
        // if (selectedItem) {
        //     let details = '';
        //     details += '<span class="badge fw-normal bg-success-lt ms-1">' + round2decimal(selectedItem.bounds.width) + 'x' + round2decimal(selectedItem.bounds.height) + '</span>';
        //     if (selectedItem.name == "flat") {
        //         details += '<span class="badge fw-normal bg-primary-lt ms-1 loadConfig">' + $('.glassInput').find(':selected').text() + '</span>';
        //         details += '<span class="badge fw-normal bg-warning-lt ms-1 loadConfig">' + $('.glazingInput').find(':selected').text() + '</span>';
        //     }
        //     if (selectedItem.name == "vMullian" || selectedItem.name == "hMullian") {
        //         details += '<span class="badge fw-normal bg-primary-lt ms-1 loadConfig">' + $('.mullianInput').find(':selected').text() + '</span>';
        //     }
        //     if (selectedItem.name == "doorFrame") {
        //         details += '<span class="badge fw-normal bg-primary-lt ms-1 loadConfig">' + $('.doorSashInput').find(':selected').text() + '</span>';
        //         details += '<span class="badge fw-normal bg-warning-lt ms-1 loadConfig">' + $('.accessoryInput').find(':selected').text() + ' ' + $('.accessoryTypeInput').find(':selected').text() + '</span>';
        //     }
        //     if (selectedItem.name == "windowFrame") {
        //         details += '<span class="badge fw-normal bg-primary-lt ms-1 loadConfig">' + $('.windowSashInput').find(':selected').text() + '</span>';
        //         details += '<span class="badge fw-normal bg-warning-lt ms-1 loadConfig">' + $('.accessoryInput').find(':selected').text() + ' ' + $('.accessoryTypeInput').find(':selected').text() + '</span>';
        //     }
        //     if (selectedItem.name == "mainFrame") {
        //         details += '<span class="badge fw-normal bg-primary-lt ms-1 loadConfig">' + $('.frameInput').find(':selected').text() + '</span>';
        //     }

        //     $('.itemDetails').html(details);
        // }
    }//

    //set Zoom
    function setZoom() {
        const canvas = document.getElementById('myCanvas');

        const cssWidth = canvas.clientWidth;
        const cssHeight = canvas.clientHeight;

        const actualWidth = canvas.width;
        const actualHeight = canvas.height;

        const design = paper.project.activeLayer;
        const hasBounds = design && design.bounds && design.bounds.width > 0;

        const designWidth = hasBounds ? design.bounds.width : 2000;
        const designHeight = hasBounds ? design.bounds.height : 1000;

        const usableWidth = cssWidth * 0.9; // 90% عرض canvas
        const usableHeight = cssHeight * 0.9; // 90% ارتفاع canvas

        const scaleX = usableWidth / designWidth;
        const scaleY = usableHeight / designHeight;

        const scale = Math.min(scaleX, scaleY);
        paper.view.zoom = scale;
        paper.view.center = hasBounds ? design.bounds.center : new paper.Point(actualWidth / 2, actualHeight / 2);

    }//

    //something changed
    function enableSave(delay = 100, doSave = true) {
        somethingChanged = true;
        if (doSave) {
            if (saveTimeout) clearTimeout(saveTimeout);
            //save with delay
            saveTimeout = setTimeout(function () {
                saveDesign(currentDesignID, true);
            }, delay);
        } else {
            $('.saveCard').removeClass('bg-danger');
            $('#saveProject').html('<i class="ti ti-device-floppy icon"></i>');
            $('#saveProject').prop('disabled', false);
            $('#saveProject').show();
        }
    }//

    function addLockTypeText(item) {
        const firstDoorFramelock = item.parent.children.find(child => child.name === 'lock');
        if (firstDoorFramelock) {
            firstDoorFramelock.remove();
        }
        let textToAdd = '';
        if (item.data.lockType == "service") {
            textToAdd = 'Service';
        } else if (item.data.lockType == "serviceWithToope") {
            textToAdd = 'Service with Plug';
        } else if (item.data.lockType == "winDoorType") {
            textToAdd = 'Two Side Lock';
        } else if (item.data.lockType == "doorWinlock") {
            textToAdd = 'Win Lock on Door outwards';
        } else if (item.data.lockType == "doorWinlock2") {
            textToAdd = 'Win Lock on Door inwards';
        }
        let text = new paper.PointText(new paper.Point(item.bounds.centerX, item.bounds.centerY + 50));
        text.content = textToAdd;
        text.fillColor = "red";
        text.justification = "center";
        text.fontSize = 35;
        text.name = 'lock';
        item.parent.addChild(text);
    }//

    function changeWindowDoorPanelPosition(newPoint) {
        let item = selectedItem;
        if (["windowFrame", "doorFrame", "hPanel", "vPanel"].includes(item.name)) {
            let itemParent = item.parent;
            let memory = false;
            if (ctrlKeyPressed) {//copy stat
                $.each(itemParent.children, function (key, itemp) {
                    if (itemp.id !== item.id) {
                        removedDependenceMemory.push(itemp);
                    }
                });
                memory = removedDependenceMemory;
            } else {
                memory = deleteItem(itemParent);
            }
            let flats = paper.project.activeLayer.getItems({ name: "flat" });
            let newItem = false;
            $.each(flats, function (key, flat) {
                if (flat.hitTest(newPoint)) {
                    let openingFlatData = false;
                    let openingFlatFillColor = false;
                    for (let k = 0; k < itemParent.children.length; k++) {
                        if (itemParent.children[k].name == "flat") {
                            openingFlatData = itemParent.children[k].data;
                            openingFlatFillColor = itemParent.children[k].fillColor;
                            break;
                        }
                    }
                    if (item.name == "windowFrame") {
                        newItem = addWindow(itemParent.name, flat, flat.parent, {
                            profile: itemParent.children[0].data,
                            flat: openingFlatData,
                            flatFillColor: openingFlatFillColor
                        })
                    } else if (item.name == "doorFrame") {
                        newItem = addDoor(itemParent.name, flat, flat.parent, {
                            profile: itemParent.children[0].data,
                            flat: openingFlatData,
                            flatFillColor: openingFlatFillColor
                        })
                    } else if (item.name == "vPanel" || item.name == "hPanel") {
                        newItem = addPanel(item.name, flat, flat.parent, item.data)
                    }
                    return;
                }
            });
            if (memory && newItem) {
                reDrawMullianChildsOnDelete(memory, new paper.Point(newItem.bounds.centerX - itemParent.bounds.centerX, newItem.bounds.centerY - itemParent.bounds.centerY));
            }
        }
        createDimensionBar();
        paper.project.deselectAll();
        removedDependenceMemory = [];
    }//

    function mouseHelperSetColor(color = "success", text = "") {
        if (ctrlKeyPressed) {
            text += `<span class="badge bg-primary ms-1">کپی آیتم</span>`;
        }
        if (shiftKeyPressed) {
            text += `<span class="badge bg-info ms-1">دقت در جابجایی</span>`;
        }
        $('.mouseHelper').removeClass(['text-success', 'text-danger', 'text-warning', 'text-info']);
        $('.mouseHelper').addClass('text-' + color);
        $('.mouseHelper').html(text);
        $('.mouseHelper').show();
        $('.mouseHelperBg').removeClass(['mouseHelper-success', 'mouseHelper-danger', 'mouseHelper-warning', 'mouseHelper-info']);
        $('.mouseHelperBg').addClass('mouseHelper-' + color);
        $('.mouseHelperBg').show();
    }//

    function mouseHelperHide() {
        if (deleteMode) {
            return
        }
        $('.mouseHelper').html('');
        $('.mouseHelper').hide('slow');
        $('.mouseHelperBg').hide('slow');
    }//

    function toggleSashType() {
        if (!selectedItem || !["windowFrame", "doorFrame"].includes(selectedItem.name)) {
            showMessage('لطفا ابتدا فریم یک بازشو را انتخاب نمایید');
            return;
        }
        if (selectedItem.parent.name.indexOf('left') !== -1) {
            selectedItem.parent.name = selectedItem.parent.name.replace('left', 'right');
        } else if (selectedItem.parent.name.indexOf('right') !== -1) {
            selectedItem.parent.name = selectedItem.parent.name.replace('right', 'left');
        }
        reDrawItem(selectedItem);
        selectedItem = false;
    }//

    async function set3D() {
        try {
            const project = paper.project;

            if (project.activeLayer.children.length === 0) {
                return;
            }

            const bounds = project.activeLayer.bounds;
            const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

            const width = bounds.width;
            const height = bounds.height;

            svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            svgElement.setAttribute('viewBox', `${bounds.x} ${bounds.y} ${width} ${height}`);
            svgElement.setAttribute('width', width);
            svgElement.setAttribute('height', height);

            const paperSvg = project.exportSVG({
                asString: false,
                bounds: 'content'
            });

            const children = paperSvg.children;
            for (let i = 0; i < children.length; i++) {
                svgElement.appendChild(children[i].cloneNode(true));
            }

            const elementsWithPaperAttrs = svgElement.querySelectorAll('[xmlns\\:paper], [paper-id]');
            elementsWithPaperAttrs.forEach(el => {
                el.removeAttribute('xmlns:paper');
                el.removeAttribute('paper-id');
            });

            const defs = svgElement.querySelectorAll('defs');
            defs.forEach(def => {
                if (def.children.length === 0) {
                    def.remove();
                }
            });

            const serializer = new XMLSerializer();
            let svgString = serializer.serializeToString(svgElement);
            svgElement.remove();

            svgString = svgString.replace(/<defs>\s*<\/defs>/g, '');

            if (window.update3DModel) {
                await window.update3DModel(svgString, currentDesignID);
            } else {
                console.error('تابع update3DModel یافت نشد');
            }

        } catch (error) {
            console.error('خطا:', error);
        }
    }//

    /////////////////BUTTON CLICK/////////////////////

    //addNewItemButtonClick
    $(document).on('click', '#addNewItemButton, .layerClone, .configMenuDropDown, .saveProject, .addNewItem, .vMullianEualling, .hMullianEualling', function () {
        cancelAll();
    });//

    function loadLayerList() {
        if (firstLayerLoad) {
            $('.starSpantTitle').html('<div class="d-flex flex-column align-items-center"><div class="spinner-border mb-3" role="status"></div><span>دریافت طراحی ها...</span></div>');
        }
        $('.mousePosition').html(unitData['name']);
        $('.deleteMultiLayer').hide();
        $('.addNewLayer').show();
        $.ajax({
            url: designListRoute,
            type: "POST",
            data: {
                _token: $('meta[name="csrf-token"]').attr('content'),
                designID: currentDesignID
            },
            cache: false,
            success: function (dataResult) {
                $('#layerlist').html(dataResult);
                firstLayerLoad = false;
                if (unitData.locked) {
                    $('.layerLock').html('<i class="icon ti ti-lock text-danger"></i>');
                } else {
                    $('.layerLock').html('<i class="icon ti ti-lock-open"></i>');
                }
                if (unitData.visibility) {
                    $('.layerDisable').html('<i class="icon ti ti-eye"></i>');
                } else {
                    $('.layerDisable').html('<i class="icon ti ti-eye-off text-danger"></i>');
                }
                // $('.updatingLayerList').remove();
            },
            error: function (error) {
                let errorMessage = "خطایی در ارتباط با سرور رخ داده است.";
                if (error.status === 0) {
                    errorMessage = "اتصال اینترنت خود را بررسی کنید!";
                } else if (error.responseJSON && error.responseJSON.message) {
                    errorMessage = error.responseJSON.message;
                }
                showMessage(errorMessage);
                // $('.updatingLayerList').remove();
            }
        });
        setItemProfileName();
    }//

    $(document).on('click', '.addExtension', function () {
        if (unitData.shape == "simple_rectangle") {
            Swal.fire({
                title: "ابعاد فریم:",
                html: '<div class="row"><div class="col-12 mb-2">افزودن فریم جدید در کنار فریم فعلی</div><div class="col"><label class="fs--1">طول:</label><input id="wFrame-input" class="form-control text-center" type="number" value="1000"></div>' +
                    '<div class="col"><label class="fs--1">ارتفاع:</label><input id="hFrame-input" class="form-control text-center" type="number" value="1000"></div>' +
                    '<div class="col"><label class="fs--1">جهت:</label><select id="position-input" class="form-select"><option value="right">راست</option><option value="down">پایین</option></select></div></div>',
                preConfirm: function () {
                    return new Promise(function (resolve) {
                        resolve([
                            $('#wFrame-input').val(),
                            $('#hFrame-input').val(),
                            $('#position-input').val()
                        ])
                    })
                },
                onOpen: function () {
                    $('#wFrame-input').focus()
                },
            }).then((result) => {
                if (result.value) {
                    let w = Number(result.value[0]);
                    let h = Number(result.value[1]);
                    let position = result.value[2];
                    if (w > 50 && h > 50) {
                        let sections = paper.project.activeLayer.getItems({
                            name: "section"
                        });
                        let lastSection = sections[sections.length - 1] || false;
                        //when there are more than one mainframe, user should select a frame to add
                        if (sections.length > 1) {
                            if (!selectedItem || (selectedItem && selectedItem.name != "mainFrame")) {
                                showMessage('بیش از یک فریم وجود دارد. لطفا ابتدا فریمی که مایلی به آن افزونه اضافه شود را انتخاب نمایید');
                                return;
                            }
                            lastSection = selectedItem;
                            //check this frame has not this side frame
                            if (position == "right") {
                                let vCouplings = paper.project.activeLayer.getItems({
                                    name: "vCoupling"
                                });
                                for (let n = 0; n < vCouplings.length; n++) {
                                    if (vCouplings[n].hitTest(lastSection.bounds.topRight)) {
                                        showMessage('فریمی در کنار این قسمت وجود دارد. امکان اضافه کردن چند فریم روی هم وجود ندارد');
                                        return;
                                    }
                                }
                            } else {
                                let hCouplings = paper.project.activeLayer.getItems({
                                    name: "hCoupling"
                                });
                                for (let n = 0; n < hCouplings.length; n++) {
                                    if (hCouplings[n].hitTest(lastSection.bounds.bottomLeft)) {
                                        showMessage('فریمی در زیر این قسمت وجود دارد. امکان اضافه کردن چند فریم روی هم وجود ندارد');
                                        return;
                                    }
                                }
                            }
                        }
                        if (lastSection) {
                            if (!firstCoupling_width) {
                                showMessage('بنظر می رسد این پروفیل شامل کوپلینگ نمی باشد. اگر این مورد اشتباه است به مدیریت جهت اصلاح اطلاع دهید.');
                                return;
                            }
                            //draw coupling
                            frameColor = unitData['profile_color_hex'];
                            let coupling;
                            if (position == "right") { //right
                                let couplingHeight = (h > lastSection.bounds.height) ? lastSection.bounds.height : h;
                                coupling = new paper.Path.Rectangle(lastSection.bounds.topRight, [firstCoupling_width, couplingHeight]); //point,size
                                coupling.strokeColor = strokeColor;
                                coupling.fillColor = frameColor;
                                coupling.name = 'vCoupling';
                                setDefaultData(coupling, 'coupling');
                                //draw new frame
                                let tmpShape = new paper.Path();
                                tmpShape.moveTo(coupling.bounds.topRight);
                                tmpShape.lineTo(new paper.Point(coupling.bounds.topRight.x + w, coupling.bounds.topRight.y));
                                tmpShape.lineTo(new paper.Point(coupling.bounds.topRight.x + w, coupling.bounds.topRight.y + h));
                                tmpShape.lineTo(new paper.Point(coupling.bounds.topRight.x, coupling.bounds.topRight.y + h));
                                tmpShape.closed = true;
                                buildFrame(tmpShape);
                            } else { //down
                                let couplingWidth = (w > lastSection.bounds.width) ? lastSection.bounds.width : w;
                                coupling = new paper.Path.Rectangle(lastSection.bounds.bottomLeft, [couplingWidth, firstCoupling_width]); //point,size
                                coupling.strokeColor = strokeColor;
                                coupling.fillColor = frameColor;
                                coupling.name = 'hCoupling';
                                setDefaultData(coupling, 'coupling');
                                //draw new frame
                                let tmpShape = new paper.Path();
                                tmpShape.moveTo(coupling.bounds.bottomLeft);
                                tmpShape.lineTo(new paper.Point(coupling.bounds.bottomLeft.x + w, coupling.bounds.bottomLeft.y));
                                tmpShape.lineTo(new paper.Point(coupling.bounds.bottomLeft.x + w, coupling.bounds.bottomLeft.y + h));
                                tmpShape.lineTo(new paper.Point(coupling.bounds.bottomLeft.x, coupling.bounds.bottomLeft.y + h));
                                tmpShape.closed = true;
                                buildFrame(tmpShape);
                            }

                        }

                    } else {
                        showMessage('لطفا ابعاد معتبری وارد نمایید')
                    }
                }
            });
        } else {
            showMessage('در اشکال غیر مستطیل امکان افزودن وجود ندارد');
        }
    })//

    $(document).on('click', '.addNewItem', function () {
        addNewItemType = $(this).attr('data-type');
        cancelAll();
        if (selectedItem && typeof selectedItem.name !== "undefined" && selectedItem.name == 'base' && (selectedItem.name == 'flat' || selectedItem.name.indexOf('door_') !== -1 || selectedItem.name.indexOf('window_') !== -1)) {
            addNewItem(addNewItemType, selectedItem, selectedItem.bounds.center);
        } else {
            waitingToAddItemFlag = true;
            if (['lace'].includes(addNewItemType)) {
                mouseHelperSetColor('success', 'فریم یک بازشو را انتخاب کنید');
            } else {
                mouseHelperSetColor('success', 'محل نصب را مشخص نمایید');
            }
        }
    })//

    //mullianEualling
    $(document).on('click', '.vMullianEualling', function () {
        mullianEuallingSpace('vMullian');
    })//
    $(document).on('click', '.hMullianEualling', function () {
        mullianEuallingSpace('hMullian');
    })//

    function mullianEuallingSpace(type = "vMullian", step = 1) {
        if (unitData.locked) {
            showMessage('یونیت قفل است. لطفا ابتدا قفل را بردارید');
            return;
        }
        let list = [];
        let baseGroups = paper.project.activeLayer.getItems({ name: 'baseGroup', recursive: true });
        for (let i = 0; i < baseGroups.length; i++) {
            for (let j = 0; j < baseGroups[i].children.length; j++) {
                if (baseGroups[i].children[j].name == type) {
                    if (baseGroups[i].parent.name == "section" || baseGroups[i].parent.name == "baseGroup") {
                        list.push(baseGroups[i].children[j]);
                    }
                }
            }
        }

        if (list.length > 0 && list.length >= step) {
            selectedItem = list[step - 1];
            let section = paper.project.getItem({ name: 'section' });

            // Calculate equal spacing
            let spacing = section.bounds.width / (list.length + 1);
            let newX = spacing * step;
            let newY = selectedItem.bounds.center.y;
            if (type == "hMullian") {
                spacing = section.bounds.height / (list.length + 1);
                newX = selectedItem.bounds.center.x;
                newY = spacing * step;
            }

            // Move the mullion
            changeMullianPosition(new paper.Point(newX, newY));
            step++;
            if (list.length >= step) {
                mullianEuallingSpace(type, step);
            }
        }
    }//

    //dellItem
    $(document).on('click', '.dellItem', function (event) {
        if (event.originalEvent && event.originalEvent.isTrusted) {//Real user click (mouse/touch)
            if (deleteMode) {
                cancelAll();
                return;
            }
        }
        if (selectedItem) {
            let memory = deleteItem(selectedItem);
            if (['vMullian', 'hMullian'].includes(selectedItem.name)) {
                reDrawMullianChildsOnDelete(memory);
            }
            removedDependenceMemory = [];
            selectedItem = false;
        } else {
            if (deleteMode) {
                deleteMode = false;
                $(this).removeClass('text-danger');
                mouseHelperHide();
            } else {
                deleteMode = true;
                $(this).addClass('text-danger');
                mouseHelperSetColor('danger', 'حذف چندگانه فعال است. برای لغو اینجا کلیک کنید');
            }
        }
        itemsDimensionText();
    })//

    //Zoom bar
    $('#rangeInput').on('input', function () {
        paper.view.zoom = this.value * 1.1;
    });//
    $(document).on('click', '#zoomInButton', function () {
        paper.view.zoom = paper.view.zoom * 1.1;
        $('#rangeInput').val(paper.view.zoom);
    });//
    $(document).on('click', '#zoomOutButton', function () {
        paper.view.zoom = paper.view.zoom * 0.9;
        $('#rangeInput').val(paper.view.zoom);
    });//
    $(document).on('click', '#resetButton', function () {
        setZoom();
        $('#rangeInput').val(paper.view.zoom);
    });//

    //change layer btn
    $(document).on('click', '.changelayer', function (event) {
        if ($(event.target).hasClass('designCheckbox')) {
            return; // Do nothing if the click is on the checkbox
        }
        let layerID = $(this).attr('id');
        layerID = layerID.replace('layer_', '');
        changeLayerById(layerID);
    });//

    //download, export and import
    $(document).on('click', '.downloadPNG', function () {
        downloadPNG();
    })//
    $(document).on('click', '.export', function () {
        $('#exportCode').val(paper.project.exportJSON());
        $('#exportModal').modal('show');
    })//
    $(document).on('click', '.import', function () {
        $('#importModal').modal('show');
    })//
    $(document).on('click', '.doImport', function () {
        let importCode = $('#importCode').val();
        if (importCode !== "") {
            importToProject(importCode);
        }
        $('#importModal').modal('hide');
    })//

    //input lable position
    $(document).on('click', "input[name^='shape']", function () {
        let imgName = $(this).attr('id');
        $('#fullShapeView').attr('src', '/assets/img/616x470/' + imgName + '.png');
        let positions = $(this).attr('data-position').split(",");
        // for (let i = 0; i < positions.length; i += 3) {
        //     if(positions[i] != 0){
        //         positions[i] = parseInt(positions[i]) + 6;
        //     }
        // }
        $('#itemWidth').css({ "top": positions[0] + "%", "left": positions[1] + "%", "rotate": positions[2] + "deg" });
        $('#itemHeight').css({ "top": positions[3] + "%", "left": positions[4] + "%", "rotate": positions[5] + "deg" });
        if (positions[6] == 0) {
            $('#a').hide();
        } else {
            $('#a').show();
            $('#a').css({ "top": positions[6] + "%", "left": positions[7] + "%", "rotate": positions[8] + "deg" });
        }
        if (positions[9] == 0) {
            $('#b').hide();
        } else {
            $('#b').show();
            $('#b').css({ "top": positions[9] + "%", "left": positions[10] + "%", "rotate": positions[11] + "deg" });
        }
        if (positions[12] == 0) {
            $('#c').hide();
        } else {
            $('#c').show();
            $('#c').css({ "top": positions[12] + "%", "left": positions[13] + "%", "rotate": positions[14] + "deg" });
        }
        if (positions[15] == 0) {
            $('#d').hide();
        } else {
            $('#d').show();
            $('#d').css({ "top": positions[15] + "%", "left": positions[16] + "%", "rotate": positions[17] + "deg" });
        }
    })//

    //delete layer
    $(document).on('click', '.layerDelete', function () {
        $('#multiDelete').val(0);
        $("#deleteLayerModal").modal('show');
    });//
    $(document).on('click', '.deleteMultiLayer', function () {
        $('#multiDelete').val(1);
        $("#deleteLayerModal").modal('show');
    });//
    $(document).on('change', '.designCheckbox', function () {
        checkDesignCheckbox();
    });//
    $(document).on('click', '.deleteLayerNow', function () {
        let toDeleteIds = [currentDesignID];
        let multiDelete = $('#multiDelete').val();
        $("#deleteLayerModal").modal('hide');
        $('.deleteMultiLayer').hide();
        $('.addNewLayer').show();
        if (multiDelete == 1) {
            toDeleteIds = $('.designCheckbox:checked').map(function () {
                return this.value;
            }).get();
        }
        if (toDeleteIds.length < 1) {
            showMessage('چیزی برای حذف نیست!');
            return;
        }
        $.ajax({
            url: destroyDesignRoute,
            type: "POST",
            data: {
                _token: $('meta[name="csrf-token"]').attr('content'),
                del_id: toDeleteIds
            },
            cache: false,
            success: function (dataResult) {
                dataResult = JSON.parse(dataResult);
                let count = dataResult[0];
                let lastID = dataResult[1];
                $('#countDesign').html(count);
                if (lastID == 0) {
                    paper.project.clear();
                    $('#layerlist').html(`<div class="text-center">
                                        <img src="/assets_front/img/character/icons-drawing.png" width="100%" height="auto" alt="new draw">
                                        <p class="small">برای شروع یک یونیت جدید ایجاد کنید.</p>
                                    </div>`);
                } else {
                    changeLayerById(lastID);
                }
                $('.selectAll').prop('checked', false);
            },
            error: function (error) {
                $('#saveProject').prop('disabled', false);
                $('#saveProject').show();
                let errorMessage = "خطایی در ارتباط با سرور رخ داده است.";
                if (error.status === 0) {
                    errorMessage = "اتصال اینترنت خود را بررسی کنید!";
                } else if (error.responseJSON && error.responseJSON.message) {
                    errorMessage = error.responseJSON.message;
                }
                showMessage(errorMessage);
            }
        });
    });//

    //add New layer
    $(document).on('click', '.addNewLayer', function () {
        //save previous works
        saveDesign(currentDesignID).then(function (message) {
            if (typeof message !== "undefined") {
                showMessage(message);
            }
        }).catch(function (error) {
            let errorMessage = "خطایی در ارتباط با سرور رخ داده است.";
            if (error.status === 0) {
                errorMessage = "اتصال اینترنت خود را بررسی کنید!";
            } else if (error.responseJSON && error.responseJSON.message) {
                errorMessage = error.responseJSON.message;
            }
            showMessage('ذخیره با خطا مواجه شد: ' + errorMessage);
        });
        $('.updateDiv').hide();
        $('.select_windows_type_bar').show();
        $('.select_windows_detials_bar').show();
        $('#ofcAddNew').offcanvas('show');
        let selectedSystem = unitData['system'] ?? 'UPVC';
        (selectedSystem == "UPVC") ? $('#system_UPVC').prop('checked', true) : $('#system_Al').prop('checked', true);

        $('#profile_id option[data-system], #profile_color option[data-system], #accessory_id option[data-system]').each(function () {
            $(this).data('system') == selectedSystem ? $(this).show() : $(this).hide();
        });

        $('#profile_id, #profile_color, #accessory_id').each(function () {
            let firstVisible = $(this).find('option').filter(function () {
                return $(this).css('display') !== 'none';
            }).first();

            if (firstVisible.length) {
                $(this).val(firstVisible.val());
            } else {
                $(this).val('');
            }
        });

        if (unitData['profile_id']) {
            $('#profile_id').val(unitData['profile_id']);
        }
        if (unitData['profile_color']) {
            $('#profile_color').val(unitData['profile_color']);
        }
        if (unitData['accessory_id']) {
            $('#accessory_id').val(unitData['accessory_id']);
        }

        $('#ofcAddNew > .offcanvas-body').get(0).scroll({
            top: 10,
            behavior: 'smooth'
        });
    });//

    //Update layer
    $(document).on('click', '.update_profile_selection', function () {

        unitData.pattern_id = $('#pattern_id').val();
        unitData.quantity = $('#quantity').val();
        $('.quantity_number').html(unitData.quantity);

        let newProfile_id = $('#profile_id').val();
        let newProfile_color = $('#profile_color').val();
        let newAccessory_id = $('#accessory_id').val();
        let newGlass_id = $('#glass_id').val();

        unitData.system = $('#profile_id option[value="' + newProfile_id + '"]').data('system');
        unitData.type = $('#profile_id option[value="' + newProfile_id + '"]').data('type');

        if (unitData.profile_color !== newProfile_color) {
            unitData.profile_color = $('#profile_color').val();
            unitData.profile_color_hex = $('#profile_color option[value="' + newProfile_color + '"]').data('hex');
            frameColor = unitData['profile_color_hex'];
            setDefaultData(null, "resetAllProfilesColors");
        }
        if (unitData.profile_id !== newProfile_id) {
            unitData.profile_id = newProfile_id;
            setDefaultData(null, "resetAllProfiles");
        }
        if (unitData.accessory_id !== newAccessory_id) {
            unitData.accessory_id = newAccessory_id;
            setDefaultData(null, "resetAllAccessories");
        }
        if (unitData.glass_id !== newGlass_id) {
            unitData.glass_id = newGlass_id;
            setDefaultData(null, "resetAllGlasses");
        }

        updateLayerDetailsMenuOptions();
        $('#ofcAddNew').offcanvas('hide');
        $('#leftCanvas').offcanvas('hide');
        enableSave();
    });//

    //Config layer
    $(document).on('click', '.layerConfig', function () {
        $('.updateDiv').show();
        $('.select_windows_type_bar').hide();
        $('.select_windows_detials_bar').hide();

        let selectedSystem = unitData['system'] ?? 'UPVC';
        (selectedSystem == "UPVC") ? $('#system_UPVC').prop('checked', true) : $('#system_Al').prop('checked', true);

        $('#profile_id option[data-system], #profile_color option[data-system], #accessory_id option[data-system]').each(function () {
            $(this).data('system') == selectedSystem ? $(this).show() : $(this).hide();
        });

        $('#profile_id, #profile_color, #accessory_id').each(function () {
            let firstVisible = $(this).find('option').filter(function () {
                return $(this).css('display') !== 'none';
            }).first();

            if (firstVisible.length) {
                $(this).val(firstVisible.val());
            } else {
                $(this).val('');
            }
        });

        $('#pattern_id').val(unitData.pattern_id);
        $('#profile_id').val(unitData.profile_id);
        $('#accessory_id').val(unitData.accessory_id);
        $('#glass_id').val(unitData.glass_id);
        $('#profile_color').val(unitData.profile_color);
        $('#quantity').val(unitData.quantity);
        $('#ofcAddNew').offcanvas('show');

    });//

    //clone layer
    $(document).on('click', '.layerClone', function () {
        //save current
        saveDesign(currentDesignID).then(function (message) {
            if (typeof message !== "undefined") {
                showMessage(message);
            }
        }).catch(function (error) {
            let errorMessage = "خطایی در ارتباط با سرور رخ داده است.";
            if (error.status === 0) {
                errorMessage = "اتصال اینترنت خود را بررسی کنید!";
            } else if (error.responseJSON && error.responseJSON.message) {
                errorMessage = error.responseJSON.message;
            }
            showMessage('ذخیره با خطا مواجه شد: ' + errorMessage);
        });
        enableSave();
        unitData['name'] = parseInt($('#countDesign').text()) + 1;
        saveDesign().then(function (message) {
            if (typeof message !== "undefined") {
                showMessage(message);
            }
        }).catch(function (error) {
            let errorMessage = "خطایی در ارتباط با سرور رخ داده است.";
            if (error.status === 0) {
                errorMessage = "اتصال اینترنت خود را بررسی کنید!";
            } else if (error.responseJSON && error.responseJSON.message) {
                errorMessage = error.responseJSON.message;
            }
            showMessage('ذخیره با خطا مواجه شد: ' + errorMessage);
        });
        showMessage(unitData['name'] + ' ایجاد شد');
    });//

    //Disable layer
    $(document).on('click', '.layerDisable', function () {
        if (unitData.visibility) {
            unitData.visibility = false;
            $(this).html('<i class="icon ti ti-eye-off text-danger"></i>');
        } else {
            unitData.visibility = true;
            $(this).html('<i class="icon ti ti-eye"></i>');
        }
        enableSave();
    });//

    //Lock layer
    $(document).on('click', '.layerLock', function () {
        if (unitData.locked) {
            unitData.locked = false;
            $(this).html('<i class="icon ti ti-lock-open"></i>');
        } else {
            unitData.locked = true;
            $(this).html('<i class="icon ti ti-lock text-danger"></i>');
        }
        enableSave();
    });//

    //layer name
    $(document).on('input', '.layerName', function () {
        enableSave(5000, false);
    });//
    $(document).on('input', '.location', function () {
        enableSave(5000, false);
    });//
    //layer quantity
    $(document).on('input', '.layerQuantity', function () {
        let lq = parseInt($(this).val());
        if (!isNaN(lq) && Number.isInteger(lq)) {
            // unitData.quantity = lq;
            enableSave(5000, false);
        }
    });//

    $(document).on('keydown', '.layerName, .layerQuantity, .location', function (event) {
        if (event.key === 'Enter') {
            $(this).blur();
        }
    });//

    $(document).on('blur', '.layerQuantity, .layerName, .location', function () {
        if (typeof unitData['type'] == "undefined") { //first load and no design
            return
        }

        let layerNameVal = $('.layerName').val();
        let locationVal = $('.location').val();
        let layerQuantityVal = parseInt($('.layerQuantity').val());

        if (unitData.name !== layerNameVal || unitData.location !== locationVal || parseInt(unitData.quantity) !== layerQuantityVal) {
            unitData.name = layerNameVal;
            unitData.location = locationVal;
            if (!isNaN(layerQuantityVal) && Number.isInteger(layerQuantityVal)) {
                unitData.quantity = layerQuantityVal;
            }
            enableSave();
        }
    });//

    $(document).on('click', '#myCanvas', function (event) {
        $('.layerName').blur();
        $('.location').blur();
        $('.layerQuantity').blur();
    });//

    //undo redo
    $(document).on('click', '.undo', function () {
        if (history_index > 0) {
            history_index--;
            importToProject(history[history_index]);
            $('.redo').prop('disabled', false);
        } else {
            $('.undo').prop('disabled', true);
        }
    });//
    $(document).on('click', '.redo', function () {
        if (history_index < history.length) {
            importToProject(history[history_index])
            $('.undo').prop('disabled', false);
            history_index++;
        } else {
            $('.redo').prop('disabled', true);
        }
    });//

    //component Inputs on change
    $(document).on('change', '.componentsInput', function () {
        if (selectedItem) {

            selectedItem.data = selectedItem.data || {};
            let thisDataName = $(this).attr('data-id');

            if (['profile', 'vCoupling', 'hCoupling'].includes(thisDataName)) {
                let previousProfileWidth = selectedItem.data.profile_width;
                let newProfileWidth = $(this).find(':selected').attr('data-width');
                let thisDataType = $(this).find(':selected').attr('data-type');
                selectedItem.data['profile_width'] = Number(newProfileWidth);
                selectedItem.data[thisDataName] = Number($(this).val());
                if (thisDataType == "Mullian") {
                    selectedItem.data['overhung'] = 0;
                }
                if (thisDataType == "Overhung") {
                    selectedItem.data['overhung'] = 1;
                }
                let extra_frame_lenght_new = parseFloat($('.frameInput option[value="' + selectedItem.data.profile + '"]').data('extra_frame_lenght') || 0);
                if (previousProfileWidth > 0 && newProfileWidth > 0 && (previousProfileWidth != newProfileWidth || extra_frame_lenght_new != extra_frame_lenght)) {
                    extra_frame_lenght = extra_frame_lenght_new;
                    reDrawItem(selectedItem, newProfileWidth);
                    $("#configMenuDropDown").trigger('click');
                }
            } else if (thisDataName == 'glass') {
                let glassColor = $('.glassInput option[value=' + $(this).val() + ']').data('color');
                selectedItem.fillColor = new paper.Color(glassColor);
                let glassGroup = $('.glassInput option[value=' + $(this).val() + ']').data('group');
                $('.glazingInput[data-id="glazing"] option:not([disabled])').each(function () {
                    let gWidth = Number($(this).data('width'));
                    let minRange = glassGroup * 10;
                    let maxRange = (glassGroup + 1) * 10;
                    if (gWidth >= minRange && gWidth < maxRange) {
                        selectedItem.data['glazing'] = Number($(this).val());
                        $('.glazingInput[data-id="glazing"]').val($(this).val());
                    }
                });
                selectedItem.data[thisDataName] = Number($(this).val());
            } else if (thisDataName == 'accessory') {
                let thisAccessoryID = $(this).val();
                rebuildAccessoryMenu(selectedItem.parent.name, thisAccessoryID);
                let newAccessoryTypeVal = Number($('.accessoryTypeInput[data-id="accessoryType"] option:not([disabled]):first').val());
                $('.accessoryTypeInput[data-id="accessoryType"]').val(newAccessoryTypeVal);
                selectedItem.data['accessoryType'] = newAccessoryTypeVal;
                selectedItem.data[thisDataName] = Number($(this).val());
            } else if (thisDataName == 'accessoryType') {
                selectedItem.data[thisDataName] = Number($(this).val());
            } else if (thisDataName == 'lockType') {
                selectedItem.data[thisDataName] = $(this).val();
            } else if (thisDataName == 'glazing') {
                selectedItem.data[thisDataName] = Number($(this).val());
            } else if (thisDataName == 'lace') {
                if (Number($(this).val()) == 0) {
                    removeLace(selectedItem);
                } else {
                    addLace(selectedItem, Number($(this).val()));
                }
            } else if (thisDataName == 'cornic') {
                let cornicHeight = Number($(this).val());
                if (cornicHeight == 0) {
                    removeCornic();
                } else {
                    let top = $('#cornic_top').prop('checked');
                    let right = $('#cornic_right').prop('checked');
                    let bottom = $('#cornic_bottom').prop('checked');
                    let left = $('#cornic_left').prop('checked');
                    if (!top && !right && !bottom && !left) {
                        $('#cornic_top').prop('checked', true);
                        $('#cornic_right').prop('checked', true);
                        $('#cornic_bottom').prop('checked', true);
                        $('#cornic_left').prop('checked', true);
                        top = true;
                        right = true;
                        bottom = true;
                        left = true;
                    }
                    let cornicPositions = {
                        top: top,
                        right: right,
                        bottom: left,
                        left: left,
                    }
                    addCornic(cornicPositions, cornicHeight);
                }
            }
            $('.closeModal').trigger('click');
            itemDetailsBar(selectedItem);
            enableSave();
        }
    });//

    //open config ,emu by click itemDetails
    $(document).on('click', '.loadConfig', function () {
        if (selectedItem) {
            $("#configMenuDropDown").trigger('click');
        }
    });//

    //cornic_checkbox Inputs on change
    $(document).on('change', '.cornic_checkbox', function () {
        let cornicHeight = Number($('.cornicInput').val());
        if (cornicHeight !== 0) {
            let cornicPositions = {
                top: $('#cornic_top').prop('checked'),
                right: $('#cornic_right').prop('checked'),
                bottom: $('#cornic_bottom').prop('checked'),
                left: $('#cornic_left').prop('checked'),
            }
            addCornic(cornicPositions, cornicHeight);
        }
    });

    //pattern Inputs on change
    $(document).on('change', '#pattern_id', function () {
        if ($(this).find('option:selected').val() == 0) {
            return;
        }

        let selectedSystem = $(this).find('option:selected').data('system');
        $('#system_' + selectedSystem).prop('checked', true);

        $('#profile_id option[data-system], #profile_color option[data-system], #accessory_id option[data-system]').each(function () {
            $(this).data('system') == selectedSystem ? $(this).show() : $(this).hide();
        });

        $('#profile_id, #profile_color, #accessory_id').each(function () {
            let firstVisible = $(this).find('option').filter(function () {
                return $(this).css('display') !== 'none';
            }).first();

            if (firstVisible.length) {
                $(this).val(firstVisible.val());
            } else {
                $(this).val('');
            }
        });

        $('#profile_id').val($(this).find('option:selected').data('profile_id'));
        $('#profile_color').val($(this).find('option:selected').data('profile_color'));
        $('#accessory_id').val($(this).find('option:selected').data('accessory_id'));
        $('#glass_id').val($(this).find('option:selected').data('glass_id'));
        $('#profile_color').val($(this).find('option:selected').data('profile_color'));
        $('#widthSpace').val($(this).find('option:selected').data('widthspace'));
        $('#heightSpace').val($(this).find('option:selected').data('heightspace'));

    });//

    $(document).on('change', ".system_stat", function () {

        let selectedSystem = $(this).val();

        $('#profile_id option[data-system], #profile_color option[data-system], #accessory_id option[data-system]').each(function () {
            $(this).data('system') == selectedSystem ? $(this).show() : $(this).hide();
        });

        $('#profile_id, #profile_color, #accessory_id').each(function () {
            let firstVisible = $(this).find('option').filter(function () {
                return $(this).css('display') !== 'none';
            }).first();

            if (firstVisible.length) {
                $(this).val(firstVisible.val());
            } else {
                $(this).val('');
            }
        });

        //reset pattern
        $('#pattern_id').val(0);

    })//

    $(document).on('change', '.lockTypeInput', function () {
        addLockTypeText(selectedItem);
    });//

    //system Inputs on change
    $(document).on('change', '#profile_id', function () {
        let system = $(this).data('system');
        $('#pattern_id').val(0);
        $('#system_' + system).prop("checked", true);
    });//

    //change frame size by changeFrameSize btn
    $(document).on('click', '.changeFrameSize', function () {
        let frameWidthInput = Number($('.frameWidthInput').val());
        let frameHeightInput = Number($('.frameHeightInput').val());
        reDrawMainFrame(selectedItem.parent, [frameWidthInput, frameHeightInput])
    });//

    $(document).on('click', '.mouseHelperBg', function () {
        cancelAll();
    });//

    //animate btn
    $(document).on('click', '#playAnimation', function () {
        $('#playAnimation').prop('disabled', true);

        let animationPromises = [];

        // slides
        let slides = paper.project.activeLayer.getItems({ name: 'slide' });
        $.each(slides, function (key, item) {
            let promise = new Promise((resolve) => {
                let originalX = item.position.x;

                if (item.data.movement == "r") {
                    item.tween({
                        'position.x': originalX + item.bounds.width * 0.8
                    }, {
                        easing: 'easeInOutCubic',
                        duration: 2000
                    }).then(function () {
                        item.tweenTo({
                            'position.x': originalX
                        }, {
                            easing: 'easeInOutCubic',
                            duration: 2000
                        }).then(resolve);
                    });
                } else if (item.data.movement == "l") {
                    item.tween({
                        'position.x': originalX - item.bounds.width * 0.8
                    }, {
                        easing: 'easeInOutCubic',
                        duration: 2000
                    }).then(function () {
                        item.tweenTo({
                            'position.x': originalX
                        }, {
                            easing: 'easeInOutCubic',
                            duration: 2000
                        }).then(resolve);
                    });
                } else {
                    resolve();
                }
            });
            animationPromises.push(promise);
        });

        // hinge
        let windoors = paper.project.activeLayer.getItems({
            name: function (value) {
                return value && (value.indexOf("window_") !== -1 || value.indexOf("door_") !== -1);
            }
        });

        $.each(windoors, function (key, item) {
            let hingeDirection = null;
            if (item.name.indexOf("left") !== -1) {
                hingeDirection = 'right';
            } else if (item.name.indexOf("right") !== -1) {
                hingeDirection = 'left';
            } else if (item.name.indexOf("top") !== -1) {
                hingeDirection = 'bottom';
            } else if (item.name.indexOf("bottom") !== -1) {
                hingeDirection = 'top';
            }

            if (hingeDirection) {
                let promise = animateHingedItem(item, hingeDirection);
                animationPromises.push(promise);
            }
        });

        if (animationPromises.length > 0) {
            Promise.all(animationPromises).then(() => {
                $('#playAnimation').prop('disabled', false);
            });
        } else {
            $('#playAnimation').prop('disabled', false);
        }
    });//

    function animateHingedItem(cItem, hingeDirection) {
        let item = cItem.parent.clone();
        item.fillColor = '#00000006'
        // cItem.parent.visible = false;

        let isDoor = item.getItem({ name: function (value) { return value && (value.indexOf("door_") !== -1); } });
        let handleHand = item.getItem({ name: function (value) { return value && (value.indexOf("handleHand") !== -1); } });
        let handleCircle = item.getItem({ name: function (value) { return value && (value.indexOf("handleCircle") !== -1); } });

        return new Promise((resolve) => {
            const duration = 1000;
            const originalBounds = item.bounds.clone();
            const isLeft = hingeDirection === 'left';
            const shearDirection = isLeft ? -1 : 1;
            let handleDeg = (isDoor) ? (30 * shearDirection) : ((hingeDirection == 'left') ? 90 : -90);

            let hingePoint = '';
            if (hingeDirection == "left") {
                hingePoint = new paper.Point(originalBounds.left, originalBounds.center.y)
            } else if (hingeDirection == "right") {
                hingePoint = new paper.Point(originalBounds.right, originalBounds.center.y)
            } else if (hingeDirection == "top") {
                hingePoint = new paper.Point(originalBounds.center.x, originalBounds.top)
            } else if (hingeDirection == "bottom") {
                hingePoint = new paper.Point(originalBounds.center.x, originalBounds.bottom)
            }

            // تابع انیمیشن چرخش دستگیره
            async function animateHandle() {
                if (!handleHand || !handleCircle) return;
                return new Promise((handleResolve) => {
                    const originalPivot = handleHand.pivot;
                    handleHand.pivot = (!isDoor) ? handleCircle.bounds.center : new paper.Point(handleCircle.bounds.x, handleCircle.bounds.y - 30);
                    handleHand.tween({
                        'rotation': handleDeg
                    }, {
                        easing: 'easeInOutCubic',
                        duration: 300
                    }).then(() => {
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
                    if (!handleAnimationCompleted) return;
                    startTime = currentTime;
                }

                let elapsed = currentTime - startTime;
                let progress = Math.min(elapsed / duration, 1);

                let currentShear = phase === 'opening' ? -0.002 * shearDirection : 0.002 * shearDirection;
                let currentScale = phase === 'opening' ? 0.995 : 1.005;

                if (['left', 'right'].includes(hingeDirection)) {
                    item.shear(new paper.Point(0, currentShear), hingePoint);
                    item.scale(currentScale, 1, hingePoint);
                } else {
                    item.shear(new paper.Point(currentShear, 0), hingePoint);
                    item.scale(1, currentScale, hingePoint);
                }

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else if (phase === 'opening') {
                    phase = 'closing';
                    startTime = null;
                    requestAnimationFrame(animate);
                } else {
                    // cItem.parent.visible = true;
                    item.remove();
                    resolve();
                }
            }

            animateHandle().then(() => {
                handleAnimationCompleted = true;
                requestAnimationFrame(animate);
            });
        });
    }//

    //change quantity BTN
    $(document).on('click', '.quantity_minus', function () {
        let quan = Number($('#quantity').val());
        if (quan > 2) {
            $('#quantity').val(quan - 1);
        } else {
            $('#quantity').val(1);
        }

    });//
    $(document).on('click', '.quantity_plus', function () {
        let quan = Number($('#quantity').val());
        $('#quantity').val(quan + 1);
    });//

    $(document).on('click', '.bottomdoorBtn', function () {
        let bottomdoorStat = $('.bottomdoorStat').val();//0,1
        let bottomdoorValue = $('.bottomdoorValue').val();//height
        if (bottomdoorStat == 0) { //disable
            if (selectedItem.data.bottomdoor != 0) { //previously has bottomdoor
                addRemoveBottomdoor('remove');
            }
        } else if (bottomdoorStat == 1) { //enable
            if (bottomdoorValue > 0) {
                addRemoveBottomdoor('add', bottomdoorValue);
            } else {
                showMessage('ارتفاع پاخور صحیح نمی باشد')
            }
        }
        $('#leftCanvas').offcanvas('hide');
    });//

    $(document).on('click', '.plusQuantity', function () {
        let layerQuantity = parseInt($('.layerQuantity').val());
        $('.layerQuantity').val(layerQuantity + 1);
        unitData.quantity = parseInt(layerQuantity + 1);
        enableSave(3000);
    });//
    $(document).on('click', '.minusQuantity', function () {
        let layerQuantity = parseInt($('.layerQuantity').val());
        if (layerQuantity > 1) {
            $('.layerQuantity').val(layerQuantity - 1);
            unitData.quantity = parseInt(layerQuantity - 1);
            enableSave(3000);
        }
    });//

    $(document).on('click', '.toggleSashType', function () {
        toggleSashType();
    });//

    $(document).on('click', '.selectAll', function () {
        if (this.checked) {
            $('.designCheckbox:checkbox').each(function () {
                this.checked = true;
            });
        } else {
            $('.designCheckbox:checkbox').each(function () {
                this.checked = false;
            });
        }
        checkDesignCheckbox();
    });//

    $(document).on('click', '.clearDesign', function () {
        let baseGroups = paper.project.activeLayer.getItems({ name: "baseGroup" });
        $.each(baseGroups, function (key, baseGroup) {
            deleteItem(baseGroup);
        });
        createDimensionBar();
    });//

    //SAVE BTN
    $(document).on('click', '#saveProject', function () {
        saveDesign(currentDesignID).then(function (message) {
            if (typeof message !== "undefined") {
                showMessage(message);
            }
        }).catch(function (error) {
            let errorMessage = "خطایی در ارتباط با سرور رخ داده است.";
            if (error.status === 0) {
                errorMessage = "اتصال اینترنت خود را بررسی کنید!";
            } else if (error.responseJSON && error.responseJSON.message) {
                errorMessage = error.responseJSON.message;
            }
            showMessage('ذخیره با خطا مواجه شد: ' + errorMessage);
        });
    });//

    //automateCreation
    $(document).on('click', '.automateCreation', function () {
        if (unitData.locked) {
            showMessage('یونیت قفل است. لطفا ابتدا قفل را بردارید');
            return;
        }
        let baseGroups = paper.project.activeLayer.getItems({ name: "baseGroup" });
        $.each(baseGroups, function (key, baseGroup) {
            deleteItem(baseGroup);
        });

        let patternX = JSON.parse($(this).attr('data-pattern-x'));
        let y = parseInt($(this).attr('data-y'));
        let ym = parseInt($(this).attr('data-y-m'));
        let dTop = $(this).attr('data-d-top');
        let dPanel = parseInt($(this).attr('data-panel'));
        let dType = $(this).attr('data-type') || "Turn";

        let unitWidth = parseInt(unitData['Dimension']['0']);
        let unitHeight = parseInt(unitData['Dimension']['1']);

        if (unitData['type'] == "Slide" && dType == "Slide") {
            let drawPoint = new paper.Point(unitWidth / 2, unitHeight / 2);
            let flats = paper.project.activeLayer.getItems({ name: 'flat' });
            let containingFlat = flats.find(flat => flat.contains(drawPoint));
            if (containingFlat) {
                if (patternX[0] == "rn") {
                    addSlide(containingFlat, '{"type": "slide", "slide": "1", "frames": "2", "position": "ud", "slideSide": "rn"}');
                } else if (patternX[0] == "rnl") {
                    addSlide(containingFlat, '{"type": "slide", "slide": "1", "frames": "3", "position": "udu", "slideSide": "rnl"}');
                } else if (patternX[0] == "nlrn") {
                    addSlide(containingFlat, '{"type": "slide", "slide": "1", "frames": "4", "position": "duud", "slideSide": "nlrn"}');
                }
            }
        } else {
            if (y) {
                let left = parseInt(unitWidth / 2);
                let top = parseInt(unitHeight - y);
                let drawPoint = new paper.Point(left, top);
                let flats = paper.project.activeLayer.getItems({ name: 'flat' });
                let containingFlat = flats.find(flat => flat.contains(drawPoint));
                if (containingFlat) {
                    addMullian('hMullian', containingFlat, drawPoint, containingFlat.parent);
                    if (ym) {
                        let left = parseInt(unitWidth / 2);
                        let top = parseInt(unitHeight - y - 100);
                        let drawPoint = new paper.Point(left, top);
                        let flats = paper.project.activeLayer.getItems({ name: 'flat' });
                        let containingFlat = flats.find(flat => flat.contains(drawPoint));
                        if (containingFlat) {
                            addMullian('vMullian', containingFlat, drawPoint, containingFlat.parent);
                        }
                    }
                }
            }

            let sectionWidths = [];
            let fixedSum = 0;
            let spaceCount = 0;

            let eqaulSapce = 0;
            if (patternX.indexOf("Space") == -1) {
                eqaulSapce = unitWidth / patternX.length;
            }
            for (let i = 0; i < patternX.length; i++) {
                if (patternX[i].includes('window_') && unitWidth > 1500) {
                    let spaceX = (eqaulSapce) ? eqaulSapce : 750;
                    sectionWidths[i] = spaceX;
                    fixedSum += spaceX;
                } else if (patternX[i].includes('door_')) {
                    let spaceX = (eqaulSapce) ? eqaulSapce : 900;
                    sectionWidths[i] = spaceX;
                    fixedSum += spaceX;
                } else {
                    sectionWidths[i] = null;
                    spaceCount++;
                }
            }
            if (spaceCount > 0) {
                let spaceWidth = (unitWidth - fixedSum) / spaceCount;
                for (let j = 0; j < sectionWidths.length; j++) {
                    if (sectionWidths[j] === null) {
                        sectionWidths[j] = spaceWidth;
                    }
                }
            }
            let vMullianPositions = [];
            let currentPos = 0;
            for (let k = 0; k < sectionWidths.length - 1; k++) {
                currentPos += sectionWidths[k];
                vMullianPositions.push(currentPos);
            }

            $.each(vMullianPositions, function (key, left) {
                let top = parseInt(unitHeight / 2);
                let drawPoint = new paper.Point(left, top);
                let flats = paper.project.activeLayer.getItems({ name: 'flat' });
                let containingFlat = flats.find(flat => flat.contains(drawPoint));
                if (containingFlat) {
                    addMullian('vMullian', containingFlat, drawPoint, containingFlat.parent);
                }
            });
            $.each(patternX, function (key, left) {
                let itemType = patternX[key];
                if (["window_simple_left", "window_simple_right", "door_simple_left", "door_simple_right"].includes(itemType)) {
                    let left = 0;
                    if (vMullianPositions[key]) {
                        left = vMullianPositions[key] - 150
                    } else if (vMullianPositions[key - 1]) {
                        left = vMullianPositions[key - 1] + 150
                    } else {
                        left = unitWidth / 2;
                    }
                    let top = parseInt(unitHeight / 2);
                    let drawPoint = new paper.Point(left, top);
                    let flats = paper.project.activeLayer.getItems({ name: 'flat' });
                    let containingFlat = flats.find(flat => flat.contains(drawPoint));
                    if (containingFlat) {
                        if (["window_simple_left", "window_simple_right"].includes(itemType)) {
                            addWindow(itemType, containingFlat, containingFlat.parent);
                        } else if (["door_simple_left", "door_simple_right"].includes(itemType)) {
                            let door = addDoor(itemType, containingFlat, containingFlat.parent);
                            if (door && dTop && ["top", "bottom"].includes(dTop)) {
                                let left = door.bounds.width / 2;
                                let top = (dTop == "bottom") ? door.bounds.height - 750 : door.bounds.y + 750;
                                let drawPoint = new paper.Point(left, top);
                                let flats = door.getItems({ name: 'flat' });
                                let containingFlat = flats.find(flat => flat.contains(drawPoint));
                                if (containingFlat) {
                                    addMullian('hMullian', containingFlat, drawPoint, containingFlat.parent);
                                }
                            }
                            if (door && dPanel) {
                                let left = door.bounds.width / 2;
                                let top = door.bounds.height - 300;
                                let drawPoint = new paper.Point(left, top);
                                let flats = door.getItems({ name: 'flat' });
                                let containingFlat = flats.find(flat => flat.contains(drawPoint));
                                if (containingFlat) {
                                    addPanel("hPanel", containingFlat, containingFlat.parent);
                                }
                            }
                        }
                    }
                }
            });
        }

        $('#glassBox').addClass('closed');
        $('#toggleIcon').html('<i class="ti ti-chevron-left"></i>');
        createDimensionBar();
    });//

    function filterAutomateCreationBtns() {
        let userWidth = unitData['Dimension'][0];
        let userHeight = unitData['Dimension'][1];
        let baseGroups = paper.project.activeLayer.getItems({ name: "baseGroup" });
        let hide = true;
        let shouldBeMinimize = (baseGroups.length > 0) ? true : false;
        let isMinimize = $('#glassContent').is(':visible') ? false : true;
        let count = 0;

        $('.automateCreation').each(function () {
            const $btn = $(this);
            let dType = $btn.attr('data-type') || "Turn";
            try {
                const sizeConfig = JSON.parse($btn.attr('data-size'));

                const isInRange = userWidth >= sizeConfig.minWidth &&
                    userWidth <= sizeConfig.maxWidth &&
                    userHeight >= sizeConfig.minHeight &&
                    userHeight <= sizeConfig.maxHeight &&
                    unitData['type'] == dType;

                if (isInRange) {
                    $btn.show();
                    hide = false;
                    count++;
                } else {
                    $btn.hide();
                }

            } catch (error) {
                console.error('خطا در خواندن data-size:', error);
                $btn.hide();
            }
        });

        $('.automationCount').text(count);

        //minimizing
        if (shouldBeMinimize) {
            $('#glassBox').addClass('closed');
            $('#toggleIcon').html('<i class="ti ti-chevron-left"></i>');
        } else {
            $('#glassBox').removeClass('closed');
            $('#toggleIcon').html('<i class="ti ti-chevron-down"></i>');
        }

        //hiding
        if (hide) {
            $('#glassBox').hide();
        } else {
            $('#glassBox').show('fast');
        }

    }//

    
    /////////////////RIGHT CLICK/////////////////

    // window.addEventListener("contextmenu", function (event) {
    //     if(selectedItem){
    //         $(".unitOptions").addClass('position-fixed unitOptionsExtra');
    //         $(".unitOptions").css({'left': event.clientX, 'top': event.clientY});
    //         event.stopPropagation();
    //         event.preventDefault();
    //         return false;
    //     }
    // });

    /////////////////CALCULATIONS/////////////////
    function calculate() {
        calculations = {};
        calculations.mainFrame = {};
        calculations.doorFrame = {};
        calculations.windowFrame = {};
        calculations.flat = {};
        calculations.mullian = {};
        calculations.panel = {};
        calculations.coupling = {};
        calculations.lace = {};
        calculations.glazing = {};

        let items = paper.project.getItems({
            name: function (value) {
                return ['vMullian', 'hMullian', 'flat', 'vCoupling', 'hCoupling'].includes(value);
            }
        });
        $.each(items, function (key, item) {
            calcItem({
                item: item,
                id: item.id,
                type: item.name,
                parent: item.parent.id,
            });
        });

        items = paper.project.getItems({
            name: function (value) {
                return ['vPanel', 'hPanel'].includes(value);
            }
        });
        $.each(items, function (key, item) {
            calcPanel({
                item: item,
                id: item.id,
                type: item.name,
                parent: item.parent.id,
            });
        });

        items = paper.project.getItems({
            name: function (value) {
                return ['mainFrame'].includes(value);
            }
        });
        $.each(items, function (key, item) {
            calcFrame({
                item: item,
                id: item.id,
                type: item.name,
                parent: item.parent.id,
            });
        });

        items = paper.project.getItems({
            name: function (value) {
                return ['windowFrame', 'doorFrame'].includes(value);
            }
        });
        $.each(items, function (key, item) {
            calcFrame({
                item: item,
                id: item.parent.id,
                type: item.parent.name,
                parent: item.parent.id,
            });
            if (item.data.lace !== 0) { //has lace
                calcItem({
                    item: item,
                    id: item.data.lace,
                    type: 'lace',
                    parent: item.id,
                });
            }
        });

    }//

    //find Water Sluts on horizontal profiles
    function waterSlut(item, type) {
        let minWidth = 100;
        let sluts = [];
        if (['hMullian', 'vMullian', 'windowFrame', 'doorFrame', 'mainFrame'].includes(type)) {
            let width = item.bounds.width;
            if (['windowFrame', 'doorFrame', 'mainFrame'].includes(type)) {
                width = item.length;
            }
            if (width <= 600) {
                sluts.push(Math.round(width / 2));
            } else if (width > 600 && width <= 1500) {
                sluts.push(250);
                sluts.push(Math.round(width - 250));
            } else if (width > 1500 && width <= 3000) {
                sluts.push(250);
                sluts.push(Math.round(width / 2));
                sluts.push(Math.round(width - 250));
            } else {
                let forward = (width - 500) / 3;
                sluts.push(250);
                sluts.push(Math.round(250 + forward));
                sluts.push(Math.round(width - 250 - forward));
                sluts.push(Math.round(width - 250));
            }
        }
        return sluts;
    }//

    ///////11111111111//////////
    function calcItem(arg) { //arg{id, item, type, parent}
        let abrevationType = '';
        let angles = {};
        let sides = {};
        let Dimensions = {};
        let angles_glazing = {};
        let sides_glazing = {};
        let Dimensions_glazing = {};
        let mullianPoints = [];
        let mullianPointsSides = [];
        let hingePointsSide = '';
        let waterSluts = [];
        let stat;
        if (arg.item) {
            if (arg.type == "flat") { //Flat => minus offset flat to new paper.Size for glass margin
                glassMarginInsideProfile = findGlassMargin(arg.item.parent.name);
                let newItem = PaperOffset.offset(arg.item, -glassMarginInsideProfile);
                for (let i = 0; i < newItem.curves.length; i++) {
                    angles[i] = angleCorrection(180 - round2decimal(newItem.curves[i].getTangentAt(0.001, true).getAngle(newItem.curves[i].previous.getTangentAt(0.999, true))));
                    sides[i] = round2decimal(newItem.curves[i].length);
                }
                Dimensions = {
                    width: round2decimal(newItem.bounds.width),
                    height: round2decimal(newItem.bounds.height)
                };
                newItem.remove();
                //clac glazing
                for (let i = 0; i < arg.item.curves.length; i++) {
                    let ni = 180 - round2decimal(arg.item.curves[i].getTangentAt(0.001, true).getAngle(arg.item.curves[i].previous.getTangentAt(0.999, true)));
                    angles_glazing[i] = (unitData['system'] == "Al") ? 90 : angleCorrection(round2decimal(ni / 2));
                    let sidePosition = findSidePositionByAngle(angleTwoPoint(arg.item.curves[i].segment1.point, arg.item.curves[i].segment2.point));
                    sides_glazing[i] = round2decimal(arg.item.curves[i].length);
                    if (unitData['system'] == "Al") {
                        // let glazingID = arg.item.data.glazing;
                        // let dataWidth = $(`select.glazingInput option[value="${glazingID}"]`).data('width');
                        // let glWidth = (['top', 'bottom'].includes(sidePosition)) ? dataWidth : 0;
                        let dataWidth = 22 * 2;
                        let glWidth = (['top', 'bottom'].includes(sidePosition)) ? dataWidth : 0;
                        sides_glazing[i] = round2decimal(arg.item.curves[i].length - glWidth);
                    }
                }
                Dimensions_glazing = {
                    width: round2decimal(arg.item.bounds.width),
                    height: round2decimal(arg.item.bounds.height)
                };
            } else if (arg.type == "lace") { //Lace => extend flat to new paper.Size
                let newItem = PaperOffset.offset(arg.item, laceOverlap);
                angles = [90, 90];
                Dimensions = {
                    width: round2decimal(newItem.bounds.width),
                    height: round2decimal(newItem.bounds.height)
                };
                newItem.remove();
            } else {
                if (arg.type == "vMullian" && arg.item.bounds.width == 2) { //slide mullian and should be ignored
                    return
                }
                let extraLength = 0;
                if (arg.type == "vMullian" || arg.type == "hMullian") {
                    extraLength = 2 * mullianExtend;
                    if (typeof arg.item.data.overhung !== -1 && arg.item.data.overhung == 1) {
                        extraLength -= overHungMinusLenght;
                    }
                }
                if (arg.type == "vMullian") {
                    angles[0] = angleCorrection(180 - round2decimal(arg.item.curves[2].getTangentAt(0.001, true).getAngle(arg.item.curves[2].previous.getTangentAt(0.999, true))));
                    angles[1] = angleCorrection(180 - round2decimal(arg.item.curves[1].getTangentAt(0.001, true).getAngle(arg.item.curves[1].previous.getTangentAt(0.999, true))));
                } else if (arg.type == "hMullian") {
                    angles[0] = angleCorrection(180 - round2decimal(arg.item.curves[0].getTangentAt(0.001, true).getAngle(arg.item.curves[0].previous.getTangentAt(0.999, true))));
                    angles[1] = angleCorrection(180 - round2decimal(arg.item.curves[3].getTangentAt(0.001, true).getAngle(arg.item.curves[3].previous.getTangentAt(0.999, true))));
                }

                for (let i = 0; i < arg.item.curves.length; i++) {
                    sides[i] = round2decimal(arg.item.curves[i].length + extraLength);
                }
                Dimensions = {
                    width: round2decimal(arg.item.bounds.width) + extraLength,
                    height: round2decimal(arg.item.bounds.height) + extraLength
                };

                waterSluts = [];
                if (arg.type == "vMullian") {
                    stat = 'Vertical';
                } else {
                    stat = 'Horizontal';
                    waterSluts = waterSlut(arg.item, 'hMullian');
                }

                //find mullians installation side on frames for connection position
                let mullians = paper.project.activeLayer.getItems({
                    name: function (value) {
                        return ['vMullian', 'hMullian'].includes(value);
                    }
                });

                $.each(mullians, function (key, mullian) {
                    let intersection = arg.item.getIntersections(mullian);
                    if (intersection.length > 1) {
                        if (arg.item.name == "hMullian") { //hMullian
                            let distance = Math.abs(intersection[0].point.x - intersection[1].point.x);
                            if (distance > 1) {
                                let position = round2decimal(Math.abs(mullian.bounds.topLeft.x - arg.item.bounds.topLeft.x) + distance / 2);
                                mullianPoints.push(position);
                                if (arg.item.bounds.topLeft.y > mullian.bounds.topLeft.y) {
                                    mullianPointsSides.push('up');
                                } else {
                                    mullianPointsSides.push('down');
                                }
                            }
                        } else if (arg.item.name == "vMullian") { //vMullian
                            let distance = Math.abs(intersection[0].point.y - intersection[1].point.y);
                            if (distance > 1) {
                                let position = round2decimal(Math.abs(mullian.bounds.bottomLeft.y - arg.item.bounds.bottomLeft.y) + distance / 2);
                                mullianPoints.push(position);
                                if (arg.item.bounds.topLeft.x > mullian.bounds.topLeft.x) {
                                    mullianPointsSides.push('up');
                                } else {
                                    mullianPointsSides.push('down');
                                }
                            }
                        }
                    }
                });

                //find window/door installation side on frames for connection position
                let windoors = paper.project.activeLayer.getItems({
                    name: function (value) {
                        return value && (value.indexOf("windowFrame") !== -1 || value.indexOf("doorFrame") !== -1);
                    }
                });

                $.each(windoors, function (key, windoor) {
                    let intersection = arg.item.getIntersections(windoor);
                    if (intersection.length > 1) {
                        if (arg.item.name == "hMullian") { //hMullian
                            if (windoor.bounds.centerY < arg.item.bounds.centerY) {
                                hingePointsSide = 'up';
                            } else {
                                hingePointsSide = 'down';
                            }
                        } else if (arg.item.name == "vMullian") { //vMullian
                            if (windoor.bounds.centerX < arg.item.bounds.centerX) {
                                hingePointsSide = 'up';
                            } else {
                                hingePointsSide = 'down';
                            }
                        }
                    }
                });

            }

            if (arg.type == "vMullian" || arg.type == "hMullian") {
                abrevationType = "mullian";
            } else if (arg.type == "vCoupling" || arg.type == "hCoupling") {
                abrevationType = "coupling";
            } else {
                abrevationType = arg.type;
            }

            calculations[abrevationType][arg.id] = {
                id: arg.id,
                type: arg.type,
                sides: sides,
                bounds: {
                    top: round2decimal(arg.item.bounds.top),
                    left: round2decimal(arg.item.bounds.left),
                    width: round2decimal(Dimensions.width),
                    height: round2decimal(Dimensions.height)
                },
                length: Math.max(...Object.values(sides)),
                angles: angles,
                components: ((abrevationType == "panel") ? arg.item.parent.data : arg.item.data),
                mullianPoints: mullianPoints,
                mullianPointsSides: mullianPointsSides,
                hingePointsSide: hingePointsSide,
                waterSluts: waterSluts,
                parent: arg.parent,
                stat: stat,
                path: arg.item.getPathData(),
            }
            if (arg.type == "flat") {
                arg.item.data['profile'] = arg.item.data['glazing'];
                calculations["glazing"][arg.id] = {
                    // id: arg.item.data.glazing,
                    id: arg.id,
                    type: "glazing",
                    sides: sides_glazing,
                    //length: Math.max(...Object.values(sides_glazing)),
                    angles: angles_glazing,
                    components: arg.item.data,
                    //parent: arg.parent,
                    //path: arg.item.getPathData()
                }
            }
        }
    }//

    function calcPanel(arg) { //arg{id, item, type, parent}
        if (arg.item) {
            for (let index = 0; index < arg.item.children.length; index++) {
                let angles = {};
                let sides = {};
                let Dimensions = {};
                let angles_glazing = {};
                let sides_glazing = {};
                let Dimensions_glazing = {};
                let stat;
                if (arg.item.children[index].name == "panelItem") {
                    for (let i = 0; i < arg.item.children[index].curves.length; i++) {
                        angles[i] = angleCorrection(180 - round2decimal(arg.item.children[index].curves[i].getTangentAt(0.001, true).getAngle(arg.item.children[index].curves[i].previous.getTangentAt(0.999, true))));
                        sides[i] = round2decimal(arg.item.children[index].curves[i].length);
                    }
                    Dimensions = {
                        width: round2decimal(arg.item.children[index].bounds.width),
                        height: round2decimal(arg.item.children[index].bounds.height)
                    };
                    if (arg.type == "vPanel") {
                        stat = 'Vertical';
                    } else {
                        stat = 'Horizontal';
                    }
                    calculations['panel'][arg.id + '_' + index] = {
                        id: arg.id,
                        type: arg.type,
                        sides: sides,
                        bounds: {
                            width: Dimensions.width,
                            height: Dimensions.height
                        },
                        length: Math.max(...Object.values(sides)),
                        angles: angles,
                        components: arg.item.data,
                        parent: arg.parent,
                        stat: stat,
                        path: arg.item.children[index].getPathData(),
                    }
                } else if (arg.item.children[index].name == "panelBase") {
                    for (let j = 0; j < arg.item.children[index].curves.length; j++) {
                        let ni = 180 - round2decimal(arg.item.children[index].curves[j].getTangentAt(0.001, true).getAngle(arg.item.children[index].curves[j].previous.getTangentAt(0.999, true)));
                        angles_glazing[j] = angleCorrection(round2decimal(ni / 2));
                        sides_glazing[j] = round2decimal(arg.item.children[index].curves[j].length);
                    }
                    Dimensions_glazing = {
                        width: round2decimal(arg.item.bounds.width),
                        height: round2decimal(arg.item.bounds.height)
                    };
                    arg.item.data['profile'] = arg.item.data['profile'];
                    calculations["glazing"][arg.id] = {
                        // id: arg.item.data.glazing,
                        id: arg.id,
                        type: "glazing",
                        sides: sides_glazing,
                        angles: angles_glazing,
                        components: arg.item.data,
                    }
                }
            }
        }
    }//

    function calcFrame(arg) { //arg{id, item, type, parent}
        let frameFlat = arg.item.children[0] || null;
        let abrevationType = '';
        let handlePositions = [];
        let hingePositions = [];
        let hingePositionsFirst = [];
        let handleFromFrame = [];
        let hingeFromFrame = [];
        let waterSluts = [];
        let stat = '';
        let toRemove = false;

        let slideSlide = arg.item?.parent?.parent?.data?.config?.slideSide ?? '';

        if (arg.type.indexOf('slide') !== -1) {
            abrevationType = "windowFrame"
        } else if (arg.type.indexOf('window_') !== -1) {
            abrevationType = "windowFrame";
        } else if (arg.type.indexOf('door_') !== -1) {
            abrevationType = "doorFrame";
        } else {
            abrevationType = "mainFrame";
        }

        $.each(arg.item.parent.children, function (key, child) {
            if (child.name == "handle") {
                handlePositions.push([child.bounds.center.x, child.bounds.center.y]);
            } else if (child.name == "hinge") {
                hingePositions.push([child.bounds.center.x, child.bounds.center.y]);
                hingePositionsFirst.push([child.bounds.center.x, child.bounds.center.y]);
            }
        });

        //find mullians installation side on frames for connection position
        let mullians = arg.item.parent.getItems({
            name: function (value) {
                return ['vMullian', 'hMullian'].includes(value);
            }
        });

        for (let index = 0; index < frameFlat.curves.length; index++) {
            let curve = frameFlat.curves[index];
            let angles = [];
            if (abrevationType == "mainFrame") {
                angles.push(angleCorrection((180 - curve.getTangentAt(0.001, true).getAngle(curve.previous.getTangentAt(0.999, true))) / 2));
                angles.push(angleCorrection((180 - curve.next.getTangentAt(0.001, true).getAngle(curve.getTangentAt(0.999, true))) / 2));
            } else {
                angles.push(angleCorrection((180 - curve.next.getTangentAt(0.001, true).getAngle(curve.getTangentAt(0.999, true))) / 2));
                angles.push(angleCorrection((180 - curve.getTangentAt(0.001, true).getAngle(curve.previous.getTangentAt(0.999, true))) / 2));
            }

            let sidePosition = findSidePositionByAngle(angleTwoPoint(curve.bounds.center, frameFlat.bounds.center));

            waterSluts = [];
            if (sidePosition == "top") {
                stat = 'Top';
            } else if (sidePosition == "bottom") {
                stat = 'Bottom';
                waterSluts = waterSlut(curve, abrevationType);
                if (abrevationType == "mainFrame" && arg.item.data.bottomdoor > 0) {
                    angles = [90, 90];
                    toRemove = index;
                }
            } else if (sidePosition == "left") {
                stat = 'Left';
                if (abrevationType == "mainFrame" && arg.item.data.bottomdoor > 0) {
                    angles = [90, angles[1]];
                }
            } else if (sidePosition == "right") {
                stat = 'Right';
                if (abrevationType == "mainFrame" && arg.item.data.bottomdoor > 0) {
                    angles = [angles[0], 90];
                }
            } else {
                stat = '';
            }

            let isCurve = false;
            if (!curve.isStraight()) {
                isCurve = true;
                stat += ' Curve';
            }

            //create caculation object
            calculations[abrevationType][arg.id + '_' + index] = {
                id: arg.id,
                type: arg.type,
                length: round2decimal(curve.length + weldSizeExtraSize(angles[0]) + weldSizeExtraSize(angles[1])),
                angles: angles,
                slideSlide: slideSlide,
                arc: isCurve,
                components: arg.item.data,
                waterSluts: waterSluts,
                parent: arg.parent,
                bounds: {
                    top: round2decimal(curve.bounds.top),
                    left: round2decimal(curve.bounds.left),
                    width: round2decimal(arg.item.bounds.width),
                    height: round2decimal(arg.item.bounds.height)
                },
                handle: 0,
                hinge: 0,
                zamak: 0,
                mullianPoints: [],
                stat: stat,
                path: curve.path.getPathData(),
            }

            //find mullain points on frame
            let mullianPoints = [];
            let curveTempLine = new paper.Path.Line(curve.segment1.point, curve.segment2.point);
            let profileWidth = arg.item.data.profile_width ?? 0;
            $.each(mullians, function (key, mullian) {
                let mullianTempLine;
                if (mullian.name == "vMullian") { //vMullian
                    let point1 = new paper.Point(mullian.bounds.centerX, mullian.bounds.topCenter.y - profileWidth);
                    let point2 = new paper.Point(mullian.bounds.centerX, mullian.bounds.bottomCenter.y + profileWidth);
                    mullianTempLine = new paper.Path.Line(point1, point2);
                    let intersect = curveTempLine.getIntersections(mullianTempLine);
                    if (intersect.length > 0) {
                        let minCurvePoint = curve.segment1.point;
                        let maxCurvePoint = curve.segment2.point;
                        if (curve.segment1.point.x > curve.segment2.point.x) {
                            minCurvePoint = curve.segment2.point;
                            maxCurvePoint = curve.segment1.point;
                        }
                        if (abrevationType == "mainFrame") {
                            if (sidePosition == "bottom") {
                                mullianPoints.push(round2decimal(maxCurvePoint.getDistance(intersect[0].point) + weldSizeExtraSize(angles[1])));
                            } else if (sidePosition == "top") {
                                mullianPoints.push(round2decimal(minCurvePoint.getDistance(intersect[0].point) + weldSizeExtraSize(angles[1])));
                            }
                        } else {
                            if (sidePosition == "bottom") {
                                mullianPoints.push(round2decimal(minCurvePoint.getDistance(intersect[0].point) + weldSizeExtraSize(angles[1])));
                            } else if (sidePosition == "top") {
                                mullianPoints.push(round2decimal(maxCurvePoint.getDistance(intersect[0].point) + weldSizeExtraSize(angles[1])));
                            }
                        }

                    }
                } else { //hMullian
                    let point1 = new paper.Point(mullian.bounds.leftCenter.x - profileWidth, mullian.bounds.centerY);
                    let point2 = new paper.Point(mullian.bounds.rightCenter.x + profileWidth, mullian.bounds.centerY);
                    mullianTempLine = new paper.Path.Line(point1, point2);
                    let intersect = curveTempLine.getIntersections(mullianTempLine);
                    if (intersect.length > 0) {
                        let minCurvePoint = curve.segment1.point;
                        let maxCurvePoint = curve.segment2.point;
                        if (curve.segment1.point.y > curve.segment2.point.y) {
                            minCurvePoint = curve.segment2.point;
                            maxCurvePoint = curve.segment1.point;
                        }
                        if (abrevationType == "mainFrame") {
                            if (sidePosition == "left") {
                                mullianPoints.push(round2decimal(maxCurvePoint.getDistance(intersect[0].point) + weldSizeExtraSize(angles[1])));
                            } else if (sidePosition == "right") {
                                mullianPoints.push(round2decimal(minCurvePoint.getDistance(intersect[0].point) + weldSizeExtraSize(angles[1])));
                            }
                        } else {
                            if (sidePosition == "left") {
                                mullianPoints.push(round2decimal(minCurvePoint.getDistance(intersect[0].point) + weldSizeExtraSize(angles[1])));
                            } else if (sidePosition == "right") {
                                mullianPoints.push(round2decimal(maxCurvePoint.getDistance(intersect[0].point) + weldSizeExtraSize(angles[1])));
                            }
                        }
                    }
                }
                mullianTempLine.remove();
            });
            curveTempLine.remove();
            calculations[abrevationType][arg.id + '_' + index].mullianPoints = mullianPoints;
        }

        if (toRemove) {
            delete calculations["mainFrame"][arg.id + '_' + toRemove];
        }

        let middleOfHandles = false;
        if (handlePositions.length == 1) {
            middleOfHandles = new paper.Point(handlePositions[0]);
        } else if (handlePositions.length > 1) {
            middleOfHandles = new paper.Point(handlePositions[0]).add(new paper.Point(handlePositions[handlePositions.length - 1])).divide(2);
        }

        let middleOfHinges = false;
        if (hingePositions.length > 1) {
            middleOfHinges = new paper.Point(hingePositions[0]).add(new paper.Point(hingePositions[hingePositions.length - 1])).divide(2);
        }

        //find handle and hinges distance from flat curve to find position side
        for (let index = 0; index < frameFlat.curves.length; index++) {
            if (middleOfHandles) {
                handleFromFrame[index] = middleOfHandles.getDistance(frameFlat.curves[index].bounds.center);
            }
            if (middleOfHinges) {
                hingeFromFrame[index] = middleOfHinges.getDistance(frameFlat.curves[index].bounds.center);
            }
        }

        //find handle positions
        if (middleOfHandles) {
            let curveKey1 = Object.keys(handleFromFrame).reduce((key, v) => handleFromFrame[v] < handleFromFrame[key] ? v : key);
            calculations[abrevationType][arg.id + '_' + curveKey1].handle = [round2decimal(calculations[abrevationType][arg.id + '_' + curveKey1].length / 2)];
        }
        //find hinges positions
        if (middleOfHinges) {
            let newHingPosition = [];
            let curveKey2 = Object.keys(hingeFromFrame).reduce((key, v) => hingeFromFrame[v] < hingeFromFrame[key] ? v : key);
            let hingStat = calculations[abrevationType][arg.id + '_' + curveKey2].stat;
            let welddMove = weldSizeExtraSize(calculations[abrevationType][arg.id + '_' + curveKey2]['angles'][0]);
            for (let s = 0; s < hingePositions.length; s++) {
                if (hingStat == "Left") {
                    newHingPosition.push(round2decimal(Math.abs(hingePositions[s][1] - arg.item.bounds.top) + welddMove));
                } else if (hingStat == "Bottom") {
                    newHingPosition.push(round2decimal(Math.abs(hingePositions[s][0] - arg.item.bounds.left) + welddMove));
                } else if (hingStat == "Right") {
                    newHingPosition.push(round2decimal(Math.abs(hingePositions[s][1] - arg.item.bounds.bottom) + welddMove));
                } else if (hingStat == "Top") {
                    newHingPosition.push(round2decimal(Math.abs(hingePositions[s][0] - arg.item.bounds.right) + welddMove));
                }
            }
            calculations[abrevationType][arg.id + '_' + curveKey2].hinge = newHingPosition;
            //find hinge second side position on parent frames (mullian, windowFrame, doorFrame, mainframe)
            let items = paper.project.activeLayer.getItems({
                name: function (value) {
                    return ['windowFrame', 'doorFrame', 'vMullian', 'hMullian', 'mainFrame'].includes(value);
                }
            });
            $.each(items, function (key, item) {
                if (arg.item.id !== item.id && item.hitTest(middleOfHinges)) {
                    newHingPosition = [];
                    if (['vMullian', 'hMullian'].includes(item.name)) {
                        if (!Array.isArray(calculations['mullian'][item.id]['hinge'])) {
                            calculations['mullian'][item.id]['hinge'] = [];
                        }
                        for (let s = 0; s < hingePositions.length; s++) {
                            if (item.name == "vMullian") {
                                newHingPosition.push(round2decimal(item.bounds.height - Math.abs(item.bounds.top - hingePositions[s][1])));
                                // if(arg.type.includes('left')){ //reverse hinge position for machine in this case
                                //     newHingPosition.push(round2decimal(item.bounds.height - Math.abs(item.bounds.top - hingePositions[s][1])));
                                // } else {
                                //     newHingPosition.push(round2decimal(Math.abs(item.bounds.top - hingePositions[s][1])));
                                // }
                            } else {
                                newHingPosition.push(round2decimal(Math.abs(hingePositions[s][0] - item.bounds.left)));
                            }
                        }
                        calculations['mullian'][item.id]['hinge'] = newHingPosition;
                    } else if (['mainFrame'].includes(item.name)) {
                        let frameFlat = item.children[0] || null;
                        let hingeFromFrame = {};
                        let id = (item.name == "mainFrame") ? item.id : item.parent.id;
                        for (let index = 0; index < frameFlat.curves.length; index++) {
                            hingeFromFrame[index] = middleOfHinges.getDistance(frameFlat.curves[index].bounds.center);
                        }
                        let curveKey2 = Object.keys(hingeFromFrame).reduce((key, v) => hingeFromFrame[v] < hingeFromFrame[key] ? v : key);
                        let welddMove2 = weldSizeExtraSize(calculations[item.name][id + '_' + curveKey2]['angles'][0]);
                        let hingStat2 = calculations[item.name][id + '_' + curveKey2].stat;
                        if (!Array.isArray(calculations[item.name][id + '_' + curveKey2]['hinge'])) {
                            calculations[item.name][id + '_' + curveKey2]['hinge'] = [];
                        }
                        for (let s = 0; s < hingePositionsFirst.length; s++) {
                            if (hingStat2 == "Right") {
                                newHingPosition.push(round2decimal(Math.abs(hingePositionsFirst[s][1] - calculations[item.name][id + '_' + curveKey2].bounds.top) + welddMove2));
                            } else if (hingStat2 == "Top") {
                                newHingPosition.push(round2decimal(Math.abs(hingePositionsFirst[s][0] - calculations[item.name][id + '_' + curveKey2].bounds.left) + welddMove2));
                            } else if (hingStat2 == "Left") {
                                newHingPosition.push(round2decimal(Math.abs(hingePositionsFirst[s][1] - calculations[item.name][id + '_' + curveKey2].length - calculations[item.name][id + '_' + curveKey2].bounds.top) + welddMove2));
                            } else if (hingStat2 == "Bottom") {
                                newHingPosition.push(round2decimal(Math.abs(hingePositionsFirst[s][0] - calculations[item.name][id + '_' + curveKey2].length - calculations[item.name][id + '_' + curveKey2].bounds.left) + welddMove2));
                            }
                        }
                        calculations[item.name][id + '_' + curveKey2]['hinge'] = newHingPosition;
                    } else if (['windowFrame', 'doorFrame'].includes(item.name)) {
                        let frameFlat = item.children[0] || null;
                        let hingeFromFrame = {};
                        let id = (item.name == "mainFrame") ? item.id : item.parent.id;
                        for (let index = 0; index < frameFlat.curves.length; index++) {
                            hingeFromFrame[index] = middleOfHinges.getDistance(frameFlat.curves[index].bounds.center);
                        }
                        let curveKey2 = Object.keys(hingeFromFrame).reduce((key, v) => hingeFromFrame[v] < hingeFromFrame[key] ? v : key);
                        let welddMove2 = weldSizeExtraSize(calculations[item.name][id + '_' + curveKey2]['angles'][0]);
                        let hingStat2 = calculations[item.name][id + '_' + curveKey2].stat;
                        if (!Array.isArray(calculations[item.name][id + '_' + curveKey2]['hinge'])) {
                            calculations[item.name][id + '_' + curveKey2]['hinge'] = [];
                        }
                        for (let s = 0; s < hingePositionsFirst.length; s++) {
                            if (hingStat2 == "Left") {
                                newHingPosition.push(round2decimal(Math.abs(hingePositionsFirst[s][1] - calculations[item.name][id + '_' + curveKey2].bounds.top) + welddMove2));
                            } else if (hingStat2 == "Bottom") {
                                newHingPosition.push(round2decimal(Math.abs(hingePositionsFirst[s][0] - calculations[item.name][id + '_' + curveKey2].bounds.left) + welddMove2));
                            } else if (hingStat2 == "Right") {
                                newHingPosition.push(round2decimal(Math.abs(hingePositionsFirst[s][1] - calculations[item.name][id + '_' + curveKey2].length - calculations[item.name][id + '_' + curveKey2].bounds.top) + welddMove2));
                            } else if (hingStat2 == "Top") {
                                newHingPosition.push(round2decimal(Math.abs(hingePositionsFirst[s][0] - calculations[item.name][id + '_' + curveKey2].length - calculations[item.name][id + '_' + curveKey2].bounds.left) + welddMove2));
                            }
                        }
                        calculations[item.name][id + '_' + curveKey2]['hinge'] = newHingPosition;
                    }
                }
            });
        }
    }//

    function angleCorrection(angle = 0) {
        angle = round2decimal(Math.abs(angle));
        // if(angle > 90){
        //     angle = 180 - angle;
        // }
        if (angle == 0 || angle == 180) {
            angle = 90;
        }
        return angle;
    }//

    function angleTwoPoint(point1, point2) {
        let deltaY = point2.y - point1.y;
        let deltaX = point2.x - point1.x;
        let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI); // Convert to degrees;
        if (angle < 0) {
            angle += 360;
        }
        return angle;
    }//

    function findSidePositionByAngle(angle = false) { //360deg angle
        //      90(Top)
        //0(Right)     180(Left)
        //      270(bottom)
        let side = false;
        if (angle >= 135 && angle < 225) {
            side = "right";
        } else if ((angle >= 315 && angle <= 360) || (angle >= '0' && angle < 45)) {
            side = "left";
        } else if (angle >= 45 && angle < 135) {
            side = "top";
        } else if (angle >= 225 && angle < 315) {
            side = "bottom";
        }
        return side;
    }//

    function weldSizeExtraSize(degree) {
        return 0;
        let system = unitData['system'];
        if (system == "Al") {
            return 0;
        } else {
            let radian = degree * Math.PI / 180;
            let sin = weldSize / Math.sin(radian);
            return sin;
        }
    }//

    function round2decimal(num) {
        if (num > 0) {
            return Math.round(num * 100) / 100;
        } else {
            return num;
        }
    }//

    function initPinchZoom() {
        const canvasElement = paper.view.element;
        const box = canvasElement.getBoundingClientRect();
        const offset = new paper.Point(box.left, box.top);

        // Use passive events for better performance
        const hammer = new Hammer.Manager(canvasElement, {
            inputClass: Hammer.TouchInput,
            recognizers: [
                [Hammer.Pinch, { enable: true }],
            ]
        });

        // Cache these variables outside handlers to reduce garbage collection
        let startMatrix, startMatrixInverted, p0ProjectCoords;
        const tempPoint = new paper.Point(); // Reuse point object

        hammer.on('pinchstart', e => {
            startMatrix = paper.view.matrix.clone();
            startMatrixInverted = startMatrix.inverted();
            getCenterPoint(e, tempPoint);
            p0ProjectCoords = paper.view.viewToProject(tempPoint);
        });

        hammer.on('pinch', e => {

            if (!startMatrix) return;

            if (Math.abs(e.scale - 1) < 0.01) return;

            // Use requestAnimationFrame for smoother animation
            requestAnimationFrame(() => {
                // Get center point reusing existing object
                getCenterPoint(e, tempPoint);

                // Transform and calculate delta
                const pProject0 = tempPoint.transform(startMatrixInverted);
                const delta = pProject0.subtract(p0ProjectCoords).divide(e.scale);

                // Apply transformation
                paper.view.matrix = startMatrix.clone()
                    .scale(e.scale, p0ProjectCoords)
                    .translate(delta);

                // Force immediate update
                paper.view.update();
            });
        });

        function getCenterPoint(e, outPoint) {
            outPoint.x = e.center.x - offset.x;
            outPoint.y = e.center.y - offset.y;
            return outPoint;
        }
    }//

    function setItemProfileName() {
        $('.profileName').text($('#profile_id option[value=' + unitData.profile_id + ']').text());
        $('.glassName').text($('#glass_id option[value=' + unitData.glass_id + ']').text());
        $('.accessoryName').text($('#accessory_id option[value=' + unitData.accessory_id + ']').text());
    }//

    function checkDesignCheckbox() {
        let checked = $('.designCheckbox:checked').map(function () {
            return this.value;
        }).get();
        if (checked.length > 0) {
            $('.addNewLayer').hide();
            $('.deleteMultiLayer').show('fast');
        } else {
            $('.deleteMultiLayer').hide();
            $('.addNewLayer').show('fast');
        }
    }//

    function findGlassMargin(parentName = '') {
        if (!parentName) {
            parentName = '';
        }
        if (parentName.indexOf("window_") !== -1) {
            return Math.round(window_glass_space / 2);
        } else if (parentName.indexOf("door_") !== -1) {
            return Math.round(door_glass_space / 2);
        }

        return Math.round(frame_glass_space / 2);
    }//

    /////////////////DEV/////////////////

    function LayersItemChildren(item) {
        let out2 = '<ul style="padding-left: 1rem">';
        $.each(item.children, function (key, item) {
            if (debug) {
                out2 += '<li class="layersLi layer_' + item.id + '"><i class="ti ti-square-chevron-right fs-5"></i> ' + item.name + ' (' + item.id + ')</li>';
                if (item.hasChildren()) {
                    out2 += LayersItemChildren(item);
                }
            }
        });
        out2 += '</ul>';
        return out2;
    }//

    function layersLayout() {

        if (!debug) return;

        let allItems = paper.project.activeLayer.getItems();
        let out = '<ul class="tree small">';
        $.each(allItems, function (key, item) {
            out += '<li class="layersLi layer_' + item.id + '"><i class="ti ti-square-chevron-right fs-5"></i> ' + item.name + ' (' + item.id + ')</li>';
            if (item.hasChildren()) {
                out += LayersItemChildren(item);
            }
        });
        out += '</ul>';
        $('#layers').html(out);
    }//

    window.addEventListener('beforeunload', (event) => {
        if (somethingChanged) {
            event.preventDefault();
            event.returnValue = ''; // Required for Chrome
            return 'You have unsaved changes. Are you sure you want to leave?';
        }
    });

    // History API 
    if (window.history && window.history.pushState) {
        window.history.pushState("nohb", null, "");
        $(window).on("popstate", function (event) {
            if ($('.offcanvas').hasClass('show')) {
                window.history.pushState("nohb", null, "");
                $('.offcanvas').offcanvas('hide');
                return;
            }
        });
    }

    paper.view.element.addEventListener('contextmenu', function (event) {
        event.preventDefault();
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        const myDiv = $('.unitOptions');

        let left = mouseX;
        let top = mouseY;

        const divWidth = myDiv.outerWidth();
        const divHeight = myDiv.outerHeight();
        const windowWidth = $(window).width();
        const windowHeight = $(window).height();
        if (left + divWidth > windowWidth) {
            left = windowWidth - divWidth - 10;
        }
        if (top + divHeight > windowHeight) {
            top = windowHeight - divHeight - 10;
        }
        myDiv.css({
            'display': 'block',
            'position': 'fixed',
            'left': left + 'px',
            'top': top + 'px',
            'max-width': '25em',
            'z-index': 999
        });
    });

    $(document).on('click', function (e) {
        const myDiv = $('.unitOptions');
        if (!$(e.target).closest('.unitOptions').length) {
            myDiv.css({
                'display': '',
                'position': '',
                'left': '',
                'top': '',
                'max-width': '',
                'z-index': ''
            });
        }
    });//


}
