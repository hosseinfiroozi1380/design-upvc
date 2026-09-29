// src/events/initFormEvents.js
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
        // پاک کردن خطاهای قبلی
        $("#itemNumberError")
            .text("")
            .hide();
        $("#itemNameError")
            .text("")
            .hide();
        $("#installationCodeError")
            .text("")
            .hide();
        // اطلاعات آیتم
        const itemNumber = String(
            formData.itemNumber || ""
        ).trim();
        const itemName = String(
            formData.itemName || ""
        ).trim();
        const installationCode = String(
            formData.installationCode || ""
        ).trim();
        // اعتبارسنجی اطلاعات آیتم
        let hasItemInfoError = false;
        // شماره آیتم
        if (!itemNumber) {
            $("#itemNumberError")
                .text("شماره آیتم الزامی است")
                .show();
            hasItemInfoError = true;
        }
        // نام آیتم
        if (!itemName) {
            $("#itemNameError")
                .text("نام آیتم الزامی است")
                .show();
            hasItemInfoError = true;
        }
        // کد نصب
        if (!installationCode) {
            $("#installationCodeError")
                .text("کد نصب الزامی است")
                .show();
            hasItemInfoError = true;
        }
        // اگر یکی از اطلاعات آیتم خالی بود
        // فرم ادامه پیدا نکند
        if (hasItemInfoError) {
            return;
        }
        // اعتبارسنجی سایر فیلدها
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
        // اگر یکی از فیلدهای اصلی فرم خالی باشد
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
        // ابعاد
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
        // اطلاعات نهایی فرم
        formData.dimension = [
            itemWidth,
            itemHeight
        ];
        // اطلاعات آیتم
        formData.itemInfo = {
            itemNumber: itemNumber,
            itemName: itemName,
            installationCode: installationCode
        };
        // ABCD
        formData.abcd = {
            a: parseInt($("#a").val()),
            b: parseInt($("#b").val()),
            c: parseInt($("#c").val()),
            d: parseInt($("#d").val())
        };
        // ذخیره طراحی قبلی
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
        // فرم جدید = طراحی جدید
        state.currentDesignID = 0;
        // پاک کردن Canvas
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
        // ذخیره اطلاعات یونیت
        state.unitData = {
            ...state.unitData,
            itemNumber: itemNumber,
            itemName: itemName,
            installationCode: installationCode,
            quantity: formData.quantity
        };
        // پاک کردن فرم برای طراحی بعدی
        $("#itemNumber").val("");
        $("#itemName").val("");
        $("#installationCode").val("");
        // پاک کردن پیام‌های خطا
        $("#itemNumberError")
            .text("")
            .hide();
        $("#itemNameError")
            .text("")
            .hide();
        $("#installationCodeError")
            .text("")
            .hide();
        // رسم اولین شکل
        drawFirstShape(formData);
        $(".wd-unit-summary").show();
        $(".wd-unit-details").hide();
        // بستن فرم بعد از افزودن موفق
        $("#ofcAddNew").modal("hide");
    });
    // پاک کردن خطاها هنگام بستن فرم
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