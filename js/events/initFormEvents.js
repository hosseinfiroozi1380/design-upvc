import state from "../core/state.js";
import { saveDesign } from "../services/saveDesign.js";
import { drawFirstShape } from "../drawing/drawFirstShape.js";
import { showMessage } from "../utils/showMessage.js";
export function initFormEvents() {
    $("form#form1").submit(function (e) {
        e.preventDefault();
        let formData = {};
        $.each(
            $("form#form1").serializeArray(),
            function (i, field) {
                formData[field.name] = field.value;
            }
        );
        $("#itemNumberError")
            .text("")
            .hide();
        $("#itemNameError")
            .text("")
            .hide();
        $("#installationCodeError")
            .text("")
            .hide();
        const itemNumber = String(
            formData.itemNumber || ""
        ).trim();
        const itemName = String(
            formData.itemName || ""
        ).trim();
        const installationCode = String(
            formData.installationCode || ""
        ).trim();
        let hasItemInfoError = false;
        if (!itemNumber) {
            $("#itemNumberError")
                .text("شماره آیتم الزامی است")
                .show();
            hasItemInfoError = true;
        }
        if (!itemName) {
            $("#itemNameError")
                .text("نام آیتم الزامی است")
                .show();
            hasItemInfoError = true;
        }
        if (!installationCode) {
            $("#installationCodeError")
                .text("کد نصب الزامی است")
                .show();
            hasItemInfoError = true;
        }
        if (hasItemInfoError) {
            return;
        }
        const profileId = String(
            formData.profile_id || ""
        ).trim();
        const profileColor = String(
            formData.profile_color || ""
        ).trim();
        const accessoryId = String(
            formData.accessory_id || ""
        ).trim();
        const glassId = String(
            formData.glass_id || ""
        ).trim();
        const system = String(
            formData.system || ""
        ).trim();
        const quantity = parseInt(
            formData.quantity,
            10
        );
        if (
            !profileId ||
            !profileColor ||
            !accessoryId ||
            !glassId ||
            !system ||
            isNaN(quantity) ||
            quantity < 1
        ) {
            showMessage(
                "لطفاً همه فیلدها را کامل کنید.",
                "error"
            );
            return;
        }
        let itemWidth =
            parseInt(formData.itemWidth) -
            parseInt(formData.widthSpace);
        let itemHeight =
            parseInt(formData.itemHeight) -
            parseInt(formData.heightSpace);
        if (
            itemWidth < 300 ||
            itemWidth > 6000 ||
            itemHeight < 300 ||
            itemHeight > 6000
        ) {
            showMessage(
                "ابعاد نباید کمتر از 300 و بزرگتر از 6000 میلیمتر باشد"
            );
            return;
        }
        formData.dimension = [
            itemWidth,
            itemHeight
        ];
        formData.itemInfo = {
            itemNumber: itemNumber,
            itemName: itemName,
            installationCode: installationCode
        };
        formData.abcd = {
            a: parseInt($("#a").val()),
            b: parseInt($("#b").val()),
            c: parseInt($("#c").val()),
            d: parseInt($("#d").val())
        };
        console.log(
            "========== SAVE CHECK =========="
        );
        console.log(
            "currentDesignID:",
            state.currentDesignID
        );
        console.log(
            "tempDesigns:",
            state.tempDesigns
        );
        console.log(
            "isTemp:",
            state.tempDesigns?.some(
                item =>
                    String(item.id) ===
                    String(state.currentDesignID)
            )
        );
        if (
            state.currentDesignID > 0 &&
            !state.tempDesigns?.some(
                item =>
                    String(item.id) ===
                    String(state.currentDesignID)
            )
        ) {
            saveDesign(
                state.currentDesignID
            )
                .then(function (message) {
                    if (message !== undefined) {
                        showMessage(message);
                    }
                })
                .catch(function (error) {
                    let errorMessage =
                        "خطایی در ارتباط با سرور رخ داده است.";
                    if (error.status === 0) {
                        errorMessage =
                            "اتصال اینترنت خود را بررسی کنید!";
                    }
                    else if (
                        error.responseJSON &&
                        error.responseJSON.message
                    ) {
                        errorMessage =
                            error.responseJSON.message;
                    }
                    showMessage(
                        "ذخیره با خطا مواجه شد: " +
                        errorMessage
                    );
                });
        }
        state.currentDesignID = 0;
        state.paper.project.clear();
        console.log(
            "NEW DESIGN FROM FORM"
        );
        console.log(
            "FORM DATA:",
            formData
        );
        console.log(
            "SHAPE:",
            formData.shape
        );
        if (!formData.shape) {
            formData.shape =
                "simple_rectangle";
        }
        state.unitData = {
            ...state.unitData,
            itemNumber: itemNumber,
            itemName: itemName,
            installationCode: installationCode,
            quantity: formData.quantity
        };
        $("#form1")[0].reset();
        $("#itemNumber").val("");
        $("#itemName").val("");
        $("#installationCode").val("");
        $("#system").val("UPVC");
        $("#profile_id").val("4");
        $("#profile_color").val("1");
        $("#accessory_id").val("11");
        $("#glass_id").val("1");
        $("#quantity").val("1");
        $("#itemWidth").val("1000");
        $("#itemHeight").val("1000");
        $("#widthSpace").val("0");
        $("#heightSpace").val("0");
        $("#a").val("200");
        $("#b").val("200");
        $("#c").val("200");
        $("#d").val("200");
        $("#a").hide();
        $("#b").hide();
        $("#c").hide();
        $("#d").hide();
        $(".shape-selector-list input[name='shape']").prop(
            "checked",
            false
        );
        const profileColorOption = $("#profile_color option:selected");
        $("#profile_color_preview").css(
            "background-color",
            profileColorOption.data("hex") || "#ffffff"
        );
        const glassOption = $("#glass_id option:selected");
        $("#glass_color_preview").css(
            "background-color",
            glassOption.data("color") || "#8acde8"
        );
        $(".updateDiv").hide();
        $(".wd-right-site-title").text("افزودن آیتم مستطیل");
        $("#form1").removeClass("edit-mode");
        $("#createLayerBtn").text("افزودن");
        $("#itemNumberError")
            .text("")
            .hide();
        $("#itemNameError")
            .text("")
            .hide();
        $("#installationCodeError")
            .text("")
            .hide();
        drawFirstShape(formData);
        $(".wd-unit-summary").show();
        $(".wd-unit-details").hide();
        $("#ofcAddNew").modal("hide");
    });
    $("#ofcAddNew").on(
        "hidden.bs.modal",
        function () {
            $("#itemNumberError")
                .text("")
                .hide();
            $("#itemNameError")
                .text("")
                .hide();
            $("#installationCodeError")
                .text("")
                .hide();
        }
    );
}