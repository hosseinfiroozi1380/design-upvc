// src/events/initClickEvents.js
import state from "../core/state.js";
import { set3D } from "../utils/set3D.js";
import { cancelAll } from "../utils/cancelAll.js";
import { buildFrame } from "../drawing/buildFrame.js";
import { saveDesign } from "../services/saveDesign.js";
import { showMessage } from "../utils/showMessage.js";
import { deleteItem } from "../utils/deleteItem.js";
import { addMullian } from "../items/addMullian.js";
import { mouseHelperSetColor } from "./mouseHelperSetColor.js";
import { addNewItem } from "../items/addNewItem.js";
import { mullianEuallingSpace } from "../items/mullianEuallingSpace.js";
import { reDrawMullianChildsOnDelete } from "../drawing/reDrawMullianChildsOnDelete.js";
import { reDrawMainFrame } from "../drawing/reDrawMainFrame.js";
import { setZoom } from "./setZoom.js";
import { changeLayerById } from "../utils/changeLayerById.js";
// import { downloadPNG } from "../utils/downloadPNG.js";
import { importToProject } from "../services/importToProject.js";
import { updateLayerDetailsMenuOptions } from "../utils/updateLayerDetailsMenuOptions.js";
import { enableSave } from "../services/enableSave.js";
import { animateHingedItem } from "../utils/animateHingedItem.js";
import { toggleSashType } from "../utils/toggleSashType.js";
import { checkDesignCheckbox } from "../utils/checkDesignCheckbox.js";
import { createDimensionBar } from "../drawing/createDimensionBar.js";
import { addSlide } from "../items/addSlide.js";
import { addWindow } from "../items/addWindow.js";
import { addDoor } from "../items/addDoor.js";
import { addPanel } from "../items/addPanel.js";
import { addRemoveBottomdoor } from "../items/addRemoveBottomdoor.js";
import { setDefaultData } from "../utils/setDefaultData.js";
import { changeTempLayerById } from "../utils/changeTempLayerById.js";
import { updateTempDesignSnapshot } from "../utils/updateTempDesignSnapshot.js";
import { exportDesignPDF } from "../utils/exportDesignPDF.js";
export function initClickEvents() {
    // دکمه‌های جدید - فعلاً غیرفعال
    $(document).off(
        "click",
        "#copyButton, #viewButton, #lockButton, #mirrorButton, #widthRulerButton, #heightRulerButton, #deleteButton"
    );
    $(document).on(
        "click",
        "#copyButton, #viewButton, #lockButton, #mirrorButton, #widthRulerButton, #heightRulerButton, #deleteButton",
        function (e) {
            e.preventDefault();
            showMessage(
                "این بخش به‌زودی در دسترس خواهد بود.",
                "info"
            );
            return false;
        }
    );
    // کنترل دکمه‌های زوم، بازنشانی، Undo و Redo
    $(document).off(
        "click",
        "#zoomOutButton, #zoomInButton, #resetButton, #undoButton, #redoButton"
    );

    $(document).on(
        "click",
        "#zoomOutButton, #zoomInButton, #resetButton, #undoButton, #redoButton",
        function (e) {
            const project = state.paper?.project;
            const activeLayer = project?.activeLayer;

            const mainFrame = activeLayer?.getItems({
                name: "mainFrame"
            }) || [];

            const sections = activeLayer?.getItems({
                name: "section"
            }) || [];

            // هنوز هیچ طراحی در Canvas ایجاد نشده
            if (
                !project ||
                !activeLayer ||
                (
                    mainFrame.length === 0 &&
                    sections.length === 0
                )
            ) {
                e.preventDefault();
                e.stopImmediatePropagation();

                showMessage(
                    "برای استفاده از این بخش، ابتدا یک آیتم طراحی و به لیست اضافه کنید.",
                    "error"
                );

                return false;
            }
        }
    );
    // محاسبات
    $(document).off("click", ".wd-main-tool");
    $(document).on("click", ".wd-main-tool", function (e) {
        const buttonText = $(this).find("span").text().trim();
        if (
            buttonText === "محاسبات" ||
            buttonText === "تنظیمات"
        ) {
            e.preventDefault();
            showMessage(
                "این بخش به‌زودی در دسترس خواهد بود.",
                "info"
            );
            return false;
        }
    });
    // ذخیره PDF
    $(document).off("click", "#saveProject");
    $(document).on("click", "#saveProject", async function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        const project = state.paper?.project;
        const activeLayer = project?.activeLayer;
        if (!project || !activeLayer) {
            showMessage(
                "لطفاً ابتدا یک طراحی ایجاد کنید، سپس روی ذخیره بزنید.",
                "error"
            );
            return false;
        }
        const mainFrame = activeLayer.getItems({
            name: "mainFrame"
        });
        const sections = activeLayer.getItems({
            name: "section"
        });
        if (
            mainFrame.length === 0 &&
            sections.length === 0
        ) {
            showMessage(
                "لطفاً ابتدا یک طراحی ایجاد کنید، سپس روی ذخیره بزنید.",
                "error"
            );
            return false;
        }
        try {
            console.log("شروع ساخت PDF");
            // فعلاً ذخیره دیتابیس نداریم
            // await saveDesign(state.currentDesignID);
            await exportDesignPDF();
            console.log("PDF با موفقیت ساخته شد");
            showMessage(
                "طراحی با موفقیت ذخیره شد.",
                "success"
            );
        } catch (error) {
            console.error(
                "خطا در ساخت PDF:",
                error
            );
            showMessage(
                "در ساخت فایل PDF خطایی رخ داده است.",
                "error"
            );
        }
        return false;
    });
    // مدال سه بعدی
    $(document).off(
        "click",
        "#view3DButton"
    );
    $(document).on(
        "click",
        "#view3DButton",
        async function (event) {
            event.preventDefault();
            const targetItem =
                state.paper?.project?.activeLayer?.getItem({
                    name: "section"
                });
            console.log(
                "========== 3D CHECK =========="
            );
            console.log(
                "SECTION:",
                targetItem
            );
            console.log(
                "SECTION CHILDREN:",
                targetItem?.children
            );
            console.log(
                "SECTION BOUNDS:",
                targetItem?.bounds
            );
            console.log(
                "MAIN SECTION:",
                state.mainSection
            );
            console.log(
                "MAIN FRAME:",
                state.mainFrame
            );
            console.log(
                "ACTIVE LAYER:",
                state.paper?.project?.activeLayer
            );
            console.log(
                "================================"
            );
            if (!targetItem) {
                console.warn(
                    "SECTION برای نمایش سه بعدی پیدا نشد"
                );
                showMessage(
                    "برای نمایش سه‌بعدی، ابتدا یک آیتم طراحی و به لیست اضافه کنید.",
                    "error"
                );
                return;
            }
            // مدال سه بعدی
            const modalElement =
                document.getElementById("myModal");
            if (!modalElement) {
                console.error(
                    "#myModal پیدا نشد"
                );
                return;
            }
            // کانتینر سه بعدی
            const container =
                document.getElementById("3d");
            if (!container) {
                console.error(
                    "#3d پیدا نشد"
                );
                return;
            }
            console.log(
                "OPEN 3D MODAL"
            );
            // باز کردن مدال
            modalElement.style.display =
                "block";
            requestAnimationFrame(
                async () => {
                    try {
                        await set3D(
                            targetItem,
                            state.currentDesignID
                        );
                        requestAnimationFrame(() => {
                            if (
                                window.resize3D
                            ) {
                                window.resize3D();
                            }
                        });
                    }
                    catch (error) {
                        console.error(
                            "خطا در نمایش سه بعدی:",
                            error
                        );
                    }
                }
            );
        }
    );
    // بستن مدال سه بعدی
    $(document).off(
        "click",
        "#myModal .wd-3d-close-btn"
    );
    $(document).on(
        "click",
        "#myModal .wd-3d-close-btn",
        function (event) {
            event.preventDefault();
            event.stopPropagation();
            const modal =
                document.getElementById("myModal");
            if (!modal) {
                return;
            }
            modal.style.display =
                "none";
        }
    );
    // بستن با کلیک روی فضای بیرون
    $(document).off(
        "click",
        "#myModal"
    );
    $(document).on(
        "click",
        "#myModal",
        function (event) {
            if (
                event.target === this
            ) {
                this.style.display =
                    "none";
            }
        }
    );
    // addNewItemButtonClick
    $(document).on('click', '#addNewItemButton, .layerClone, .configMenuDropDown, .saveProject, .addNewItem, .vMullianEualling, .hMullianEualling', function () {
        cancelAll();
    });
    $(document).on('click', '.addExtension', function () {
        if (state.unitData.shape == "simple_rectangle") {
            const oldModal = document.querySelector(".wd-edit-item-modal");
            if (oldModal) {
                oldModal.remove();
            }
    
            const modal = document.createElement("div");
            modal.className = "wd-edit-item-modal";
            modal.innerHTML = `
                <div class="wd-edit-item-overlay"></div>
                <div class="wd-edit-item-container">
                    <header class="wd-right-brand">
                        <div class="wd-right-brand-inner">
                            <div class="wd-right-site-info-addedit">
                                <strong class="wd-right-site-title">
                                    ابعاد فریم
                                </strong>
                                <button
                                    type="button"
                                    class="wd-selection-close wd-edit-item-close"
                                    aria-label="بستن"
                                >
                                    <i class="ti ti-x"></i>
                                </button>
                            </div>
                        </div>
                    </header>
                    <div class="wd-edit-item-body">
                        <div class="wd-edit-item-fields">
                            <div class="wd-edit-item-field">
                                <label class="wd-form-label" for="wFrame-input">
                                    طول
                                </label>
                                <input
                                    id="wFrame-input"
                                    class="wd-input-box"
                                    type="number"
                                    value="1000"
                                    min="1"
                                >
                            </div>
                            <div class="wd-edit-item-field">
                                <label class="wd-form-label" for="hFrame-input">
                                    ارتفاع
                                </label>
                                <input
                                    id="hFrame-input"
                                    class="wd-input-box"
                                    type="number"
                                    value="1000"
                                    min="1"
                                >
                            </div>
                            <div class="wd-edit-item-field">
                                <label class="wd-form-label" for="position-input">
                                    جهت
                                </label>
                                <select
                                    id="position-input"
                                    class="wd-select-box"
                                >
                                    <option value="right">راست</option>
                                    <option value="down">پایین</option>
                                </select>
                            </div>
                        </div>
                        <div
                            class="wd-edit-item-error"
                            id="extensionError"
                        ></div>
                        <div class="wd-edit-item-actions">
                            <button
                                type="button"
                                class="wd-right-confirm wd-edit-item-save"
                            >
                                تغییر
                            </button>
                            <button
                                type="button"
                                class="wd-right-cancel wd-edit-item-cancel"
                            >
                                لغو
                            </button>
                        </div>
                    </div>
                </div>
            `;
    
            document.body.appendChild(modal);
    
            requestAnimationFrame(() => {
                modal.classList.add("show");
            });
    
            const widthInput =
                modal.querySelector("#wFrame-input");
    
            const heightInput =
                modal.querySelector("#hFrame-input");
    
            const positionInput =
                modal.querySelector("#position-input");
    
            const errorBox =
                modal.querySelector("#extensionError");
    
            function closeExtensionModal() {
                modal.classList.remove("show");
    
                setTimeout(() => {
                    if (modal.parentNode) {
                        modal.remove();
                    }
                }, 200);
            }
    
            // بستن
            modal
                .querySelector(".wd-edit-item-close")
                .addEventListener("click", function () {
                    closeExtensionModal();
                });
    
            // لغو
            modal
                .querySelector(".wd-edit-item-cancel")
                .addEventListener("click", function () {
                    closeExtensionModal();
                });
    
            // پس زمینه
            modal
                .querySelector(".wd-edit-item-overlay")
                .addEventListener("click", function () {
                    closeExtensionModal();
                });
    
            // تغییر
            modal
                .querySelector(".wd-edit-item-save")
                .addEventListener("click", function () {
                    let w = Number(widthInput.value);
                    let h = Number(heightInput.value);
                    let position = positionInput.value;
    
                    if (w <= 50 || h <= 50) {
                        errorBox.textContent =
                            "لطفاً ابعاد معتبر وارد نمایید.";
                        return;
                    }
    
                    errorBox.textContent = "";
    
                    let sections =
                        state.paper.project.activeLayer.getItems({
                            name: "section"
                        });
    
                    let lastSection =
                        sections[sections.length - 1] || false;
    
                    // وقتی بیشتر از یک فریم داریم
                    if (sections.length > 1) {
                        if (
                            !state.selectedItem ||
                            (
                                state.selectedItem &&
                                state.selectedItem.name != "mainFrame"
                            )
                        ) {
                            showMessage(
                                "بیش از یک فریم وجود دارد. لطفاً ابتدا فریمی را که می‌خواهید افزونه به آن اضافه شود انتخاب کنید.",
                                "error"
                            );
                            return;
                        }
    
                        lastSection = state.selectedItem;
    
                        // سمت راست
                        if (position == "right") {
                            let vCouplings =
                                state.paper.project.activeLayer.getItems({
                                    name: "vCoupling"
                                });
    
                            for (let n = 0; n < vCouplings.length; n++) {
                                if (
                                    vCouplings[n].hitTest(
                                        lastSection.bounds.topRight
                                    )
                                ) {
                                    showMessage(
                                        "در کنار این قسمت یک فریم وجود دارد. امکان اضافه کردن چند فریم روی یکدیگر وجود ندارد.",
                                        "error"
                                    );
                                    return;
                                }
                            }
                        }
    
                        // پایین
                        else {
                            let hCouplings =
                                state.paper.project.activeLayer.getItems({
                                    name: "hCoupling"
                                });
    
                            for (let n = 0; n < hCouplings.length; n++) {
                                if (
                                    hCouplings[n].hitTest(
                                        lastSection.bounds.bottomLeft
                                    )
                                ) {
                                    showMessage(
                                        "در زیر این قسمت یک فریم وجود دارد. امکان اضافه کردن چند فریم روی یکدیگر وجود ندارد.",
                                        "error"
                                    );
                                    return;
                                }
                            }
                        }
                    }
    
                    if (lastSection) {
                        if (!state.firstCoupling_width) {
                            showMessage(
                                "به نظر می‌رسد این پروفیل شامل کوپلینگ نمی‌باشد. اگر این مورد اشتباه است، لطفاً جهت اصلاح به مدیریت اطلاع دهید.",
                                "error"
                            );
                            return;
                        }
    
                        // رنگ فریم
                        state.frameColor =
                            state.unitData["profile_color_hex"];
    
                        let coupling;
    
                        // سمت راست
                        if (position == "right") {
                            let couplingHeight =
                                (h > lastSection.bounds.height)
                                    ? lastSection.bounds.height
                                    : h;
    
                            coupling =
                                new state.paper.Path.Rectangle(
                                    lastSection.bounds.topRight,
                                    [
                                        state.firstCoupling_width,
                                        couplingHeight
                                    ]
                                );
    
                            coupling.strokeColor =
                                state.strokeColor;
    
                            coupling.fillColor =
                                state.frameColor;
    
                            coupling.name =
                                "vCoupling";
    
                            setDefaultData(
                                coupling,
                                "coupling"
                            );
    
                            // ساخت فریم جدید
                            let tmpShape =
                                new state.paper.Path();
    
                            tmpShape.moveTo(
                                coupling.bounds.topRight
                            );
    
                            tmpShape.lineTo(
                                new state.paper.Point(
                                    coupling.bounds.topRight.x + w,
                                    coupling.bounds.topRight.y
                                )
                            );
    
                            tmpShape.lineTo(
                                new state.paper.Point(
                                    coupling.bounds.topRight.x + w,
                                    coupling.bounds.topRight.y + h
                                )
                            );
    
                            tmpShape.lineTo(
                                new state.paper.Point(
                                    coupling.bounds.topRight.x,
                                    coupling.bounds.topRight.y + h
                                )
                            );
    
                            tmpShape.closed = true;
    
                            buildFrame(
                                tmpShape,
                                false,
                                false,
                                true
                            );
    
                            setZoom();
                        }
    
                        // پایین
                        else {
                            let couplingWidth =
                                (w > lastSection.bounds.width)
                                    ? lastSection.bounds.width
                                    : w;
    
                            coupling =
                                new state.paper.Path.Rectangle(
                                    lastSection.bounds.bottomLeft,
                                    [
                                        couplingWidth,
                                        state.firstCoupling_width
                                    ]
                                );
    
                            coupling.strokeColor =
                                state.strokeColor;
    
                            coupling.fillColor =
                                state.frameColor;
    
                            coupling.name =
                                "hCoupling";
    
                            setDefaultData(
                                coupling,
                                "coupling"
                            );
    
                            // ساخت فریم جدید
                            let tmpShape =
                                new state.paper.Path();
    
                            tmpShape.moveTo(
                                coupling.bounds.bottomLeft
                            );
    
                            tmpShape.lineTo(
                                new state.paper.Point(
                                    coupling.bounds.bottomLeft.x + w,
                                    coupling.bounds.bottomLeft.y
                                )
                            );
    
                            tmpShape.lineTo(
                                new state.paper.Point(
                                    coupling.bounds.bottomLeft.x + w,
                                    coupling.bounds.bottomLeft.y + h
                                )
                            );
    
                            tmpShape.lineTo(
                                new state.paper.Point(
                                    coupling.bounds.bottomLeft.x,
                                    coupling.bounds.bottomLeft.y + h
                                )
                            );
    
                            tmpShape.closed = true;
    
                            buildFrame(
                                tmpShape,
                                false,
                                false,
                                true
                            );
    
                            setZoom();
                        }
                    }
    
                    // فقط بعد از موفقیت بسته شود
                    closeExtensionModal();
                });
    
            // پاک کردن خطا
            widthInput.addEventListener("input", function () {
                errorBox.textContent = "";
            });
    
            heightInput.addEventListener("input", function () {
                errorBox.textContent = "";
            });
    
            // Enter
            widthInput.addEventListener("keydown", function (e) {
                if (e.key === "Enter") {
                    e.preventDefault();
    
                    modal
                        .querySelector(".wd-edit-item-save")
                        .click();
                }
            });
    
            heightInput.addEventListener("keydown", function (e) {
                if (e.key === "Enter") {
                    e.preventDefault();
    
                    modal
                        .querySelector(".wd-edit-item-save")
                        .click();
                }
            });
    
            // فوکوس
            setTimeout(() => {
                widthInput.focus();
            }, 200);
    
        } else {
            showMessage(
                "در اشکال غیرمستطیل امکان افزودن وجود ندارد.",
                "error"
            );
        }
    });
    
    $(document).on('click', '.addNewItem', function () {
        state.addNewItemType = $(this).attr('data-type');
        cancelAll();
        if (
            state.selectedItem &&
            (
                state.selectedItem.name === 'base' ||
                state.selectedItem.name === 'flat' ||
                state.selectedItem.name.indexOf('door_') !== -1 ||
                state.selectedItem.name.indexOf('window_') !== -1
            )
        ) {
            addNewItem(
                state.addNewItemType,
                state.selectedItem,
                state.selectedItem.bounds.center
            );
        } else {
            state.waitingToAddItemFlag = true;
            if (['lace'].includes(state.addNewItemType)) {
                mouseHelperSetColor(
                    'success',
                    'فریم یک بازشو را انتخاب کنید'
                );
            } else {
                mouseHelperSetColor(
                    'success',
                    'محل نصب را مشخص نمایید'
                );
            }
        }
    });
    //mullianEualling
    $(document).on('click', '.vMullianEualling', function () {
        mullianEuallingSpace('vMullian');
    });
    $(document).on('click', '.hMullianEualling', function () {
        mullianEuallingSpace('hMullian');
    });
    //dellItem
    $(document).on('click', '.dellItem', function (event) {
        if (event.originalEvent && event.originalEvent.isTrusted) {//Real user click (mouse/touch)
            if (state.deleteMode) {
                cancelAll();
                return;
            }
        }
        if (state.selectedItem) {
            let memory = deleteItem(state.selectedItem);
            if (['vMullian', 'hMullian'].includes(state.selectedItem.name)) {
                reDrawMullianChildsOnDelete(memory);
            }
            state.removedDependenceMemory = [];
            state.selectedItem = false;
        } else {
            if (state.deleteMode) {
                state.deleteMode = false;
                $(this).removeClass('text-danger');
                mouseHelperHide();
            } else {
                state.deleteMode = true;
                $(this).addClass('text-danger');
                mouseHelperSetColor('danger', 'حذف چندگانه فعال است. برای لغو اینجا کلیک کنید');
            }
        }
        itemsDimensionText();
    });
    $(document).on('click', '#zoomInButton', function () {
        state.paper.view.zoom = state.paper.view.zoom * 1.1;
        $('#rangeInput').val(state.paper.view.zoom);
    });
    $(document).on('click', '#zoomOutButton', function () {
        state.paper.view.zoom = state.paper.view.zoom * 0.9;
        $('#rangeInput').val(state.paper.view.zoom);
    });
    $(document).on('click', '#resetButton', function () {
        setZoom();
        $('#rangeInput').val(state.paper.view.zoom);
    });
    // change layer btn
    $(document).on('click', '.wd-item-card', function (event) {
        // روی checkbox کلیک شده
        if ($(event.target).hasClass('designCheckbox')) {
            return;
        }
        // روی دکمه حذف کلیک شده
        if ($(event.target).closest('.layerDelete').length) {
            return;
        }
        let layerID = $(this).attr('id');
        layerID = layerID.replace('layer_', '');
        updateTempDesignSnapshot();
        changeTempLayerById(layerID);
    });
    //download, export and import
    // $(document).on('click', '.downloadPNG', function () {
    //     downloadPNG();
    // });
    $(document).on('click', '.export', function () {
        $('#exportCode').val(state.paper.project.exportJSON());
        $('#exportModal').modal('show');
    });
    $(document).on('click', '.import', function () {
        $('#importModal').modal('show');
    });
    $(document).on('click', '.doImport', function () {
        let importCode = $('#importCode').val();
        if (importCode !== "") {
            importToProject(importCode);
        }
        $('#importModal').modal('hide');
    });
    // Zoom bar
    $('#rangeInput').on('input', function () {
        state.paper.view.zoom = this.value * 1.1;
    });
    // input label position
    $(document).on('change', "input[name='shape']", function () {
        const shapeImages = {
            simple_rectangle: './icons/shapes/rectangle.svg',
            Trapezoid: './icons/shapes/trapezoid.svg',
            Trapezoid_reverse: './icons/shapes/trapezoid_reverse.svg',
            Parallelogram_left: './icons/shapes/parallelogram_left.svg',
            Parallelogram_right: './icons/shapes/parallelogram_right.svg',
            triangle: './icons/shapes/triangle.svg',
            polygon: './icons/shapes/polygon.svg',
            circle: './icons/shapes/circle.svg',
            half_circle: './icons/shapes/half_circle.svg',
            half_circle_reverse: './icons/shapes/half_circle_reverse.svg',
            quarter_circle_left: './icons/shapes/quarter_circle_left.svg',
            quarter_circle_right: './icons/shapes/quarter_circle_right.svg',
            round_rectangle: './icons/shapes/round_rectangle.svg',
            arc_rectangle: './icons/shapes/arc_rectangle.svg',
            arc_triangle: './icons/shapes/arc_triangle.svg'
        };
        const imageSrc = shapeImages[$(this).val()];
        if (imageSrc) {
            $('#fullShapeView').attr('src', imageSrc);
        }
        // عرض و ارتفاع بر اساس اندازه واقعی شکل
        const updateShapeDimensions = () => {
            const image = document.getElementById('fullShapeView');
            if (!image) return;
            const box = document.querySelector('.shape-preview-box');
            if (!box) return;
            const imageRect = image.getBoundingClientRect();
            const boxRect = box.getBoundingClientRect();
            const shapeWidth = imageRect.width;
            const shapeHeight = imageRect.height;
            // فاصله خطوط از شکل
            const gap = 30;
            // خط ارتفاع
            const heightX = imageRect.left - boxRect.left - gap;
            const heightTop = imageRect.top - boxRect.top;
            const heightBottom = imageRect.bottom - boxRect.top;
            $('.shape-preview-box::before');
            $(box).css('--height-line-x', `${heightX}px`);
            $(box).css('--height-line-top', `${heightTop}px`);
            $(box).css('--height-line-height', `${heightBottom - heightTop}px`);
            // خط عرض
            const widthY = imageRect.bottom - boxRect.top + gap;
            const widthLeft = imageRect.left - boxRect.left;
            const widthRight = imageRect.right - boxRect.left;
            $(box).css('--width-line-y', `${widthY}px`);
            $(box).css('--width-line-left', `${widthLeft}px`);
            $(box).css('--width-line-width', `${widthRight - widthLeft}px`);
        };
        if ($('#fullShapeView')[0].complete) {
            updateShapeDimensions();
        } else {
            $('#fullShapeView').one('load', updateShapeDimensions);
        }
        // موقعیت‌ها
        let positions = $(this).attr('data-position').split(',');
        // عرض
        $('#itemWidth').css({
            top: 'calc(50% + 145px)',
            left: '50%',
            rotate: '0deg',
            transform: 'translate(-50%, -50%)'
        });
        // ارتفاع
        $('#itemHeight').css({
            top: 'calc(35% - 10px)',
            left: 'calc(50% - 165px)',
            rotate: '-90deg',
            transform: 'translate(-50%, -50%)'
        });
        // A
        if (positions[6] == 0) {
            $('#a').hide();
        } else {
            $('#a').show().css({
                top: positions[6] + '%',
                left: positions[7] + '%',
                rotate: positions[8] + 'deg'
            });
        }
        // B
        if (positions[9] == 0) {
            $('#b').hide();
        } else {
            $('#b').show().css({
                top: positions[9] + '%',
                left: positions[10] + '%',
                rotate: positions[11] + 'deg'
            });
        }
        // C
        if (positions[12] == 0) {
            $('#c').hide();
        } else {
            $('#c').show().css({
                top: positions[12] + '%',
                left: positions[13] + '%',
                rotate: positions[14] + 'deg'
            });
        }
        // D
        if (positions[15] == 0) {
            $('#d').hide();
        } else {
            $('#d').show().css({
                top: positions[15] + '%',
                left: positions[16] + '%',
                rotate: positions[17] + 'deg'
            });
        }
    });
    //delete layer
    $(document).on('click', '.layerDelete', function () {
        $('#multiDelete').val(0);
        $("#deleteLayerModal").modal('show');
    });
    $(document).on('click', '.deleteMultiLayer', function () {
        $('#multiDelete').val(1);
        $("#deleteLayerModal").modal('show');
    });
    $(document).on('change', '.designCheckbox', function () {
        checkDesignCheckbox();
    });
    $(document).on('click', '.deleteLayerNow', function () {
        let toDeleteIds = [state.currentDesignID];
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
            showMessage(
                "موردی برای حذف وجود ندارد.",
                "error"
            );
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
                    state.paper.project.clear();
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
    });
    //add New layer
    $(document).on('click', '.addNewLayer', function () {
        // نوع آیتم
        const itemType = $(this).data('type');
        if (itemType === 'rectangle') {
            $('#ofcAddNew').removeClass('wd-non-rectangle-mode');
            $('#ofcAddNew .wd-right-site-title').text('افزودن آیتم مستطیل');
            $('#ofcAddNew .shape-selector-list').hide();
            $('#ofcAddNew .wd-gap-fields').show();
            // مخفی کردن ورودی‌های مخصوص غیرمستطیل
            $('#ofcAddNew .shape-corner-input').hide();
            $('#ofcAddNew input[name="shape"]').prop('checked', false);
            $('#fullShapeView').attr('src', './icons/shapes/rectangle.svg');
        } else {
            $('#ofcAddNew').addClass('wd-non-rectangle-mode');
            $('#ofcAddNew .shape-selector-list').show();
            $('#ofcAddNew .wd-gap-fields').hide();
            $('#ofcAddNew input[name="shape"]').prop('checked', false);
            $('#ofcAddNew input[name="shape"]:not(#simple_rectangle)')
                .first()
                .prop('checked', true)
                .trigger('change');
            $('#ofcAddNew .wd-right-site-title').text('افزودن آیتم غیر مستطیل');
            $('#fullShapeView').attr('src', './icons/shapes/trapezoid.svg');
        }
        saveDesign(state.currentDesignID).then(function (message) {
            if (typeof message !== "undefined") {
                showMessage(message);
            }
        }).catch(function (error) {
            console.error("خطا در ذخیره:", error);
        });
        $('.updateDiv').hide();
        $('.select_windows_type_bar').show();
        $('.select_windows_detials_bar').show();
        $('#ofcAddNew').modal('show');
        let selectedSystem = state.unitData['system'] ?? 'UPVC';
        (selectedSystem == "UPVC")
            ? $('#system_UPVC').prop('checked', true)
            : $('#system_Al').prop('checked', true);
        $('#profile_id option[data-system], #profile_color option[data-system], #accessory_id option[data-system]').each(function () {
            $(this).data('system') == selectedSystem
                ? $(this).show()
                : $(this).hide();
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
        if (state.unitData['profile_id']) {
            $('#profile_id').val(state.unitData['profile_id']);
        }
        if (state.unitData['profile_color']) {
            $('#profile_color').val(state.unitData['profile_color']);
        }
        if (state.unitData['accessory_id']) {
            $('#accessory_id').val(state.unitData['accessory_id']);
        }
        $('#ofcAddNew .modal-body').get(0).scroll({
            top: 10,
            behavior: 'smooth'
        });
    });
    //Update layer
    $(document).on('click', '.update_profile_selection', function () {
        state.unitData.pattern_id = $('#pattern_id').val();
        state.unitData.quantity = $('#quantity').val();
        $('.quantity_number').html(state.unitData.quantity);
        let newProfile_id = $('#profile_id').val();
        let newProfile_color = $('#profile_color').val();
        let newAccessory_id = $('#accessory_id').val();
        let newGlass_id = $('#glass_id').val();
        state.unitData.system = $('#profile_id option[value="' + newProfile_id + '"]').data('system');
        state.unitData.type = $('#profile_id option[value="' + newProfile_id + '"]').data('type');
        if (state.unitData.profile_color !== newProfile_color) {
            state.unitData.profile_color = $('#profile_color').val();
            state.unitData.profile_color_hex = $('#profile_color option[value="' + newProfile_color + '"]').data('hex');
            state.frameColor = state.unitData['profile_color_hex'];
            setDefaultData(null, "resetAllProfilesColors");
            updateLayerDetailsMenuOptions();
            createTempLayerCard();
        }
        if (state.unitData.profile_id !== newProfile_id) {
            state.unitData.profile_id = newProfile_id;
            setDefaultData(null, "resetAllProfiles");
            updateLayerDetailsMenuOptions();
            createTempLayerCard();
        }
        if (state.unitData.accessory_id !== newAccessory_id) {
            state.unitData.accessory_id = newAccessory_id;
            setDefaultData(null, "resetAllAccessories");
            updateLayerDetailsMenuOptions();
            createTempLayerCard();
        }
        if (state.unitData.glass_id !== newGlass_id) {
            state.unitData.glass_id = newGlass_id;
            setDefaultData(null, "resetAllGlasses");
            updateLayerDetailsMenuOptions();
            createTempLayerCard();
        }
        updateLayerDetailsMenuOptions();
        $('#ofcAddNew').modal('hide');
        $('#leftCanvas').offcanvas('hide');
        enableSave();
    });
    //Config layer
    $(document).on('click', '.layerConfig', function () {
        $('.updateDiv').show();
        $('.select_windows_type_bar').hide();
        $('.select_windows_detials_bar').hide();
        let selectedSystem = state.unitData['system'] ?? 'UPVC';
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
        $('#pattern_id').val(state.unitData.pattern_id);
        $('#profile_id').val(state.unitData.profile_id);
        $('#accessory_id').val(state.unitData.accessory_id);
        $('#glass_id').val(state.unitData.glass_id);
        $('#profile_color').val(state.unitData.profile_color);
        $('#quantity').val(state.unitData.quantity);
        $('#ofcAddNew').offcanvas('show');
    });
    //clone layer
    $(document).on('click', '.layerClone', function () {
        //save current
        saveDesign(state.currentDesignID).then(function (message) {
            if (typeof message !== "undefined") {
                showMessage(message);
            }
        }).catch(function (error) {
            console.error("خطا در ذخیره:", error);
        });
        enableSave();
        state.unitData['name'] = parseInt($('#countDesign').text()) + 1;
        saveDesign().then(function (message) {
            if (typeof message !== "undefined") {
                showMessage(message);
            }
        }).catch(function (error) {
            console.error("خطا در ذخیره:", error);
        });
        showMessage(state.unitData['name'] + ' ایجاد شد');
    });
    //Disable layer
    $(document).on('click', '.layerDisable', function () {
        if (state.unitData.visibility) {
            state.unitData.visibility = false;
            $(this).html('<i class="icon ti ti-eye-off text-danger"></i>');
        } else {
            state.unitData.visibility = true;
            $(this).html('<i class="icon ti ti-eye"></i>');
        }
        enableSave();
    });
    //Lock layer
    $(document).on('click', '.layerLock', function () {
        if (state.unitData.locked) {
            state.unitData.locked = false;
            $(this).html('<i class="icon ti ti-lock-open"></i>');
        } else {
            state.unitData.locked = true;
            $(this).html('<i class="icon ti ti-lock text-danger"></i>');
        }
        enableSave();
    });
    $(document).on('click', '#myCanvas', function (event) {
        $('.layerName').blur();
        $('.location').blur();
        $('.layerQuantity').blur();
    });
    // undo
    $(document).on('click', '.undo', function () {
        if (state.history_index <= 0) {
            $('.undo').prop('disabled', true);
            return;
        }
        state.history_index--;
        importToProject(
            state.history[state.history_index]
        );
        $('.undo').prop(
            'disabled',
            state.history_index <= 0
        );
        $('.redo').prop(
            'disabled',
            false
        );
    });
    // redo
    $(document).on('click', '.redo', function () {
        if (
            state.history_index >=
            state.history.length - 1
        ) {
            $('.redo').prop('disabled', true);
            return;
        }
        state.history_index++;
        importToProject(
            state.history[state.history_index]
        );
        $('.undo').prop(
            'disabled',
            false
        );
        $('.redo').prop(
            'disabled',
            state.history_index >=
            state.history.length - 1
        );
    });
    //open config ,emu by click itemDetails
    $(document).on('click', '.loadConfig', function () {
        if (state.selectedItem) {
            $("#configMenuDropDown").trigger('click');
        }
    });
    //change frame size by changeFrameSize btn
    $(document).on('click', '.changeFrameSize', function () {
        let frameWidthInput = Number($('.frameWidthInput').val());
        let frameHeightInput = Number($('.frameHeightInput').val());
        reDrawMainFrame(state.selectedItem.parent, [frameWidthInput, frameHeightInput]);
    });
    $(document).on('click', '.mouseHelperBg', function () {
        cancelAll();
    });
    //animate btn
    $(document).on('click', '#playAnimation', function () {
        $('#playAnimation').prop('disabled', true);
        let animationPromises = [];
        // slides
        let slides = state.paper.project.activeLayer.getItems({ name: 'slide' });
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
        let windoors = state.paper.project.activeLayer.getItems({
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
    });
    //change quantity BTN
    $(document).on('click', '.quantity_minus', function () {
        let quan = Number($('#quantity').val());
        if (quan > 2) {
            $('#quantity').val(quan - 1);
        } else {
            $('#quantity').val(1);
        }
    });
    $(document).on('click', '.quantity_plus', function () {
        let quan = Number($('#quantity').val());
        $('#quantity').val(quan + 1);
    });
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
                showMessage(
                    "ارتفاع پاخور صحیح نمی‌باشد.",
                    "error"
                );
            }
        }
        $('#leftCanvas').offcanvas('hide');
    });
    $(document).on('click', '.plusQuantity', function () {
        let layerQuantity = parseInt($('.layerQuantity').text()) || 1;
        layerQuantity++;
        $('.layerQuantity').text(layerQuantity);
        state.unitData.quantity = layerQuantity;
        enableSave(3000);
    });
    $(document).on('click', '.minusQuantity', function () {
        let layerQuantity = parseInt($('.layerQuantity').text()) || 1;
        if (layerQuantity > 1) {
            layerQuantity--;
            $('.layerQuantity').text(layerQuantity);
            state.unitData.quantity = layerQuantity;
            enableSave(3000);
        }
    });
    $(document).on('click', '.toggleSashType', function () {
        toggleSashType();
    });
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
    });
    $(document).on('click', '.clearDesign', function () {
        let baseGroups = state.paper.project.activeLayer.getItems({ name: "baseGroup" });
        $.each(baseGroups, function (key, baseGroup) {
            deleteItem(baseGroup);
        });
        createDimensionBar();
    });
    //automateCreation
    $(document).on('click', '.automateCreation', function () {
        if (state.unitData.locked) {
            showMessage(
                "یونیت قفل است. لطفاً ابتدا قفل را بردارید.",
                "error"
            );
            return;
        }
        let baseGroups = state.paper.project.activeLayer.getItems({ name: "baseGroup" });
        $.each(baseGroups, function (key, baseGroup) {
            deleteItem(baseGroup);
        });
        let patternX = JSON.parse($(this).attr('data-pattern-x'));
        let y = parseInt($(this).attr('data-y'));
        let ym = parseInt($(this).attr('data-y-m'));
        let dTop = $(this).attr('data-d-top');
        let dPanel = parseInt($(this).attr('data-panel'));
        let dType = $(this).attr('data-type') || "Turn";
        let unitWidth = parseInt(state.unitData['dimension']['0']);
        let unitHeight = parseInt(state.unitData['dimension']['1']);
        if (state.unitData['type'] == "Slide" && dType == "Slide") {
            let drawPoint = new state.paper.Point(unitWidth / 2, unitHeight / 2);
            let flats = state.paper.project.activeLayer.getItems({ name: 'flat' });
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
                let drawPoint = new state.paper.Point(left, top);
                let flats = state.paper.project.activeLayer.getItems({ name: 'flat' });
                let containingFlat = flats.find(flat => flat.contains(drawPoint));
                if (containingFlat) {
                    addMullian('hMullian', containingFlat, drawPoint, containingFlat.parent);
                    if (ym) {
                        let left = parseInt(unitWidth / 2);
                        let top = parseInt(unitHeight - y - 100);
                        let drawPoint = new state.paper.Point(left, top);
                        let flats = state.paper.project.activeLayer.getItems({ name: 'flat' });
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
                let drawPoint = new state.paper.Point(left, top);
                let flats = state.paper.project.activeLayer.getItems({ name: 'flat' });
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
                    let drawPoint = new state.paper.Point(left, top);
                    let flats = state.paper.project.activeLayer.getItems({ name: 'flat' });
                    let containingFlat = flats.find(flat => flat.contains(drawPoint));
                    if (containingFlat) {
                        if (["window_simple_left", "window_simple_right"].includes(itemType)) {
                            addWindow(itemType, containingFlat, containingFlat.parent);
                        } else if (["door_simple_left", "door_simple_right"].includes(itemType)) {
                            let door = addDoor(itemType, containingFlat, containingFlat.parent);
                            if (door && dTop && ["top", "bottom"].includes(dTop)) {
                                let left = door.bounds.width / 2;
                                let top = (dTop == "bottom") ? door.bounds.height - 750 : door.bounds.y + 750;
                                let drawPoint = new state.paper.Point(left, top);
                                let flats = door.getItems({ name: 'flat' });
                                let containingFlat = flats.find(flat => flat.contains(drawPoint));
                                if (containingFlat) {
                                    addMullian('hMullian', containingFlat, drawPoint, containingFlat.parent);
                                }
                            }
                            if (door && dPanel) {
                                let left = door.bounds.width / 2;
                                let top = door.bounds.height - 300;
                                let drawPoint = new state.paper.Point(left, top);
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
    });
}