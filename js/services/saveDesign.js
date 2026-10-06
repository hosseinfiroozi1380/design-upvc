// src/services/saveDesign.js
import state from "../core/state.js";
import { calculate } from "../utils/calculate.js";
import { loadLayerList } from "./loadLayerList.js";
import { set3D } from "../utils/set3D.js";

const saveProjectRoute = "#";
export function saveDesign(designID = false, silence = false) {
    $('#rightCanvas').offcanvas('hide');
    return new Promise((resolve, reject) => {
        if (state.somethingChanged) {
            state.somethingChanged = false;
            $('#saveProject').html(
                '<i class="ti ti-device-floppy"></i><span>ذخیره</span>'
            );
            $('#saveProject').prop('disabled', true);
            calculate();
            if (state.debug) {
                console.log(state.calculations);
            }
            let svg =
                '<svg version="1.1" ' +
                'xmlns="http://www.w3.org/2000/svg" ' +
                'xmlns:xlink="http://www.w3.org/1999/xlink" ' +
                'width="' +
                state.paper.project.activeLayer.bounds.width +
                '" height="' +
                state.paper.project.activeLayer.bounds.height +
                '" viewBox="' +
                state.paper.project.activeLayer.bounds.x +
                ',' +
                state.paper.project.activeLayer.bounds.y +
                ',' +
                state.paper.project.activeLayer.bounds.width +
                ',' +
                state.paper.project.activeLayer.bounds.height +
                '">' +
                state.paper.project.activeLayer.exportSVG({
                    bounds: "content",
                    asString: true
                }) +
                '</svg>';
            $.ajax({
                url: saveProjectRoute,
                type: "POST",
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content'),
                    designID: designID,
                    data: JSON.stringify(state.unitData),
                    design: state.paper.project.exportJSON(),
                    svg: svg,
                    calculations: JSON.stringify(state.calculations),
                },
                cache: false,
                success: function (dataResult) {
                    if (dataResult.indexOf('RecordID:') !== -1) {
                        state.currentDesignID =
                            Number(dataResult.replace('RecordID:', ''));
                        $('.saveCard').removeClass('bg-danger');
                        $('#saveProject').html(
                            '<i class="ti ti-device-floppy"></i><span>ذخیره</span>'
                        );
                        $('#saveProject').prop('disabled', false);
                        if (!designID) {
                            $('#countDesign').html(
                                Number($('#countDesign').html()) + 1
                            );
                        }
                        $('.layerName').val(
                            state.unitData['name']
                        );
                        $('.location').val(
                            state.unitData['location']
                        );
                        $('.layerQuantity').val(
                            state.unitData['quantity']
                        );
                        resolve();
                    } else {
                        console.error(
                            "========== SAVE DESIGN SERVER RESPONSE ERROR =========="
                        );
                        console.error(
                            "SERVER RESPONSE:",
                            dataResult
                        );
                        $('.saveCard').addClass('bg-danger');
                        // در حالت خطا هم همان آیکون ذخیره
                        $('#saveProject').html(
                            '<i class="ti ti-device-floppy"></i><span>ذخیره</span>'
                        );
                        $('#saveProject').prop('disabled', false);
                        $('#saveProject').show();
                        reject(dataResult);
                        state.somethingChanged = true;
                    }
                    loadLayerList();
                },
                error: function (error) {
                    console.error(
                        "========== SAVE DESIGN AJAX ERROR =========="
                    );
                    console.error(
                        "STATUS:",
                        error.status
                    );
                    console.error(
                        "STATUS TEXT:",
                        error.statusText
                    );
                    console.error(
                        "RESPONSE TEXT:",
                        error.responseText
                    );
                    console.error(
                        "RESPONSE JSON:",
                        error.responseJSON
                    );
                    console.error(
                        "ERROR OBJECT:",
                        error
                    );
                    $('.saveCard').addClass('bg-danger');
                    $('#saveProject').html(
                        '<i class="ti ti-device-floppy"></i><span>ذخیره</span>'
                    );
                    $('#saveProject').prop('disabled', false);
                    $('#saveProject').show();
                    reject(error);
                    state.somethingChanged = true;
                }
            });
            set3D();
        } else {
            resolve();
        }
        $('.mousePosition').html(
            state.unitData['name']
        );
    });
}