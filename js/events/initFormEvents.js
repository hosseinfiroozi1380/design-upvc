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


        /*
         * اعتبارسنجی فرم
         */
        if (
            formData.profile_id == undefined ||
            formData.profile_color == undefined ||
            formData.accessory_id == undefined ||
            formData.glass_id == undefined ||
            formData.system == undefined ||
            formData.quantity == undefined ||
            formData.profile_id == "" ||
            formData.profile_color == "" ||
            formData.accessory_id == "" ||
            formData.glass_id == "" ||
            formData.system == "" ||
            formData.quantity < 1
        ) {

            showMessage(
                "لطفا همه فیلدها را کامل کنید"
            );

            return;
        }


        /*
         * ابعاد
         */
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


        /*
         * اطلاعات نهایی فرم
         */
        formData.dimension = [
            itemWidth,
            itemHeight
        ];

        formData.abcd = {

            a: parseInt($("#a").val()),
            b: parseInt($("#b").val()),
            c: parseInt($("#c").val()),
            d: parseInt($("#d").val())

        };


        /*
         * ==========================================
         * طراحی قبلی
         * ==========================================
         *
         * اگر طراحی فعلی سرور باشد،
         * ذخیره قبلی انجام شود.
         */
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


        /*
         * ==========================================
         * فرم جدید = طراحی جدید
         * ==========================================
         *
         * این خط خیلی مهم است.
         *
         * Snapshot قبلی داخل tempDesigns باقی می‌ماند،
         * اما طراحی جدید ID جدید می‌گیرد.
         */
        state.currentDesignID = 0;


        /*
         * پاک کردن Canvas
         */
        state.paper.project.clear();


        console.log(
            "NEW DESIGN FROM FORM"
        );

        console.log(
            "FORM DATA:",
            formData
        );


        /*
         * ساخت طراحی جدید
         */
        drawFirstShape(formData);

    });
}