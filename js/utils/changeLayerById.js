// src/utils/changeLayerById.js
import state from '../core/state.js';
import { saveDesign } from "../services/saveDesign.js";
import { importToProject } from "../services/importToProject.js";
import { loadLayerList } from "../services/loadLayerList.js";
import { changeTempLayerById } from "./changeTempLayerById.js";
export async function changeLayerById(designID) {
    const tempDesign = state.tempDesigns?.find(
        item => String(item.id) === String(designID)
    );
    if (tempDesign) {
        changeTempLayerById(designID);
        return;
    }
    await saveDesign(state.currentDesignID)
        .then(function (message) {
            if (typeof message !== "undefined") {
                showMessage(message);
            }
        })
        .catch(function (error) {
            let errorMessage =
                "خطایی در ارتباط با سرور رخ داده است.";
            if (error.status === 0) {
                errorMessage =
                    "اتصال اینترنت خود را بررسی کنید!";
            } else if (
                error.responseJSON &&
                error.responseJSON.message
            ) {
                errorMessage =
                    error.responseJSON.message;
            }
            showMessage(
                'ذخیره با خطا مواجه شد: ' + errorMessage
            );
        });
    $.ajax({
        url: loadDesignRoute,
        type: "POST",
        data: {
            _token: $('meta[name="csrf-token"]').attr('content'),
            designID: designID
        },
        cache: false,
        success: function (dataResult) {
            state.currentDesignID =
                dataResult['id'];
            state.unitData =
                JSON.parse(dataResult['data']);
            state.frameColor =
                state.unitData.profile_color_hex;
            importToProject(
                dataResult['design']
            );
            $('.layerName')
                .val(state.unitData.name);
            $('.location')
                .val(state.unitData.location);
            $('.layerQuantity')
                .val(state.unitData.quantity);
            state.history = [];
            state.history_index = 0;
            loadLayerList();
        },
        error: function (error) {
            let errorMessage =
                "خطایی در ارتباط با سرور رخ داده است.";
            if (error.status === 0) {
                errorMessage =
                    "اتصال اینترنت خود را بررسی کنید!";
            } else if (
                error.responseJSON &&
                error.responseJSON.message
            ) {
                errorMessage =
                    error.responseJSON.message;
            }
            showMessage(errorMessage);
        }
    });
    cancelAll();
}