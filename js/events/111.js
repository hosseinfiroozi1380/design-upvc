// src/events/initPaperToolEvents.js
import state from "../core/state.js";
import { layersLayout } from "../utils/layersLayout.js";
import { showGLs } from "../utils/showGLs.js";
import { hideGLs } from "../utils/hideGLs.js";
import { recuringSelectItem } from "../utils/recuringSelectItem.js";
import { cancelAll } from "../utils/cancelAll.js";
import {
 changeMullianPosition
} from "../items/changeMullianPosition.js";
import {
 changeWindowDoorPanelPosition
} from "../items/changeWindowDoorPanelPosition.js";
import { mouseHelperHide } from "./mouseHelperHide.js";
import {
 addNewItem
} from "../items/addNewItem.js";
import { showMessage } from "../utils/showMessage.js";

export function initPaperToolEvents() {
 console.log("INIT PAPER TOOL EVENTS");
 console.log({
  paper: state.paper,
  tool: state.tool
 });
 const tool = state.tool;
 // مخفی کردن تمام تنظیمات آیتم
 function hideItemConfigOptions() {
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
  // مخفی کردن منوی جزئیات آیتم
  $('.wd-unit-details').hide();
  $('.itemDetails').html('');
  state.selectedItem = false;
 }
 function resetSelectedItemAppearance() {
  if (!state.paper) {
   return;
  }

  state.paper.project.getItems({
   match: function (item) {
    return (
     item.data &&
     item.data.originalFillColor &&
     ["vMullian", "hMullian"].includes(item.name)
    );
   }
  }).forEach(item => {
   item.fillColor = item.data.originalFillColor;
   delete item.data.originalFillColor;
  });

  if (
   state.selectedItem &&
   state.selectedItem.data &&
   state.selectedItem.data.originalFillColor
  ) {
   state.selectedItem.fillColor =
    state.selectedItem.data.originalFillColor;

   delete state.selectedItem.data.originalFillColor;
  }
 }

 function applySelectedItemAppearance() {
  if (!state.selectedItem) {
   return;
  }

  if (
   [
    "mainFrame",
    "windowFrame",
    "doorFrame",
    "vPanel",
    "hPanel",
    "vMullian",
    "hMullian"
   ].includes(state.selectedItem.name)
  ) {
   state.selectedItem.data.originalFillColor =
    state.selectedItem.fillColor;

   state.selectedItem.fillColor =
    new state.paper.Color("#eeeeee");
  }
 }
 // Mouse Down
 tool.onMouseDown = function (event) {
  $('[data-bs-toggle="tooltip"]').tooltip('hide');
  // بررسی قفل بودن یونیت
  if (state.unitData.locked) {
   showMessage(
    "یونیت قفل است. لطفاً ابتدا قفل را بردارید.",
    "error"
   );
   return;
  }
  layersLayout();
  resetSelectedItemAppearance();
  hideItemConfigOptions();
  state.paper.project.deselectAll();
  state.paper.project.activeLayer.selected = false;
  if (state.waitingToAddItemFlag) {
   state.glG.sendToBack();
  }
  if (event.item) {
   if (event.item.hasChildren()) {
    recuringSelectItem(
     event.item,
     event.point
    );
   } else {
    state.selectedItem = event.item;
   }
   // اگر آیتمی انتخاب نشده
   if (!state.selectedItem) {
    hideItemConfigOptions();
    return;
   }
   applySelectedItemAppearance();
   if (state.debug) {
    console.log(
     state.selectedItem
    );
   }
   // حالت حذف
   if (
    state.deleteMode &&
    state.selectedItem
   ) {
    $('.dellItem').trigger('click');
    return;
   }
   // مشخص کردن آیتم انتخاب شده در لیست لایه‌ها
   $('.layersLi').removeClass(
    'text-danger'
   );
   if (state.selectedItem) {
    $('.layer_' + state.selectedItem.id)
     .addClass('text-danger');
   }
   // نمایش خطوط راهنما
   //showgl should be after state.selectedItem
   showGLs();
   if (state.selectedItem.name == "mainFrame") {
       $('.frameConfig').show();
       $(".frameWidthInput").val(round2decimal(state.selectedItem.parent.bounds.width));
       $(".frameHeightInput").val(round2decimal(state.selectedItem.parent.bounds.height));
       $(".frameInput").val(state.selectedItem.data.profile);
       $(".cornicInput").val(state.selectedItem.data.cornic);
       $(".bottomdoorStat").val((state.selectedItem.data.bottomdoor > 0) ? 1 : 0);
       $(".bottomdoorValue").val(state.selectedItem.data.bottomdoor);
       $(".thresholdInput").val(state.selectedItem.data.threshold);
       $(".cornic_checkbox").prop("checked", false);
       let cornics = state.paper.project.activeLayer.getItem({
           name: "cornic"
       });
       if (cornics) {
           for (let i = 0; i < cornics.children.length; i++) {
               $("#cornic_" + cornics.children[i].name).prop("checked", true);
           }
       }
   } else if (state.selectedItem.name == "flat") {
       $('.glazingConfig').show();
       $('.glassConfig').show();
       $(".glassInput").val(state.selectedItem.data.glass);
       $(".glazingInput").val(state.selectedItem.data.glazing);
   } else if (state.selectedItem.name == "doorFrame") {
       rebuildAccessoryMenu(state.selectedItem.parent.name, state.selectedItem.data.accessory);
       $('.doorSashConfig').show();
       $('.accessoryConfig').show();
       $('.laceConfig').show();
       $(".doorSashInput").val(state.selectedItem.data.profile);
       $(".doorSashLock").val(state.selectedItem.data.lock);
       $(".accessoryInput").val(state.selectedItem.data.accessory);
       $(".accessoryTypeInput").val(state.selectedItem.data.accessoryType);
       $(".lockTypeInput").val(state.selectedItem.data.lockType);
       $(".laceInput").val(state.selectedItem.data.lace);
   } else if (state.selectedItem.name == "windowFrame") {
       if (event.modifiers.alt) {
           event.preventDefault();
           $('.toggleSashType').trigger('click');
       }
       rebuildAccessoryMenu(state.selectedItem.parent.name, state.selectedItem.data.accessory);
       $('.windowSashConfig').show();
       $('.accessoryConfig').show();
       $('.laceConfig').show();
       $(".windowSashInput").val(state.selectedItem.data.profile);
       $(".doorSashLock").val(state.selectedItem.data.lock);
       $(".accessoryInput").val(state.selectedItem.data.accessory);
       $(".accessoryTypeInput").val(state.selectedItem.data.accessoryType);
       $(".lockTypeInput").val(state.selectedItem.data.lockType);
       $(".laceInput").val(state.selectedItem.data.lace);
   } else if (state.selectedItem.name == "vCoupling" || state.selectedItem.name == "hCoupling") {
       $('.couplingConfig').show();
       $(".couplingInput").val(state.selectedItem.data.profile);
   } else if (state.selectedItem.name == "vPanel" || state.selectedItem.name == "hPanel") {
       $('.panelConfig').show();
       $('.glazingConfig').show();
       $(".panelInput").val(state.selectedItem.data.profile);
       $(".glazingInput").val(state.selectedItem.data.glazing);
   } else if (state.selectedItem.name == "vMullian" || state.selectedItem.name == "hMullian") {
       $('.mullianConfig').show();
       $('.positionConfig').show();
       if (state.selectedItem.name == "vMullian") {
           $('.positionConfigInput').val(round2decimal(state.selectedItem.bounds.left + state.frameSize / 2));
       } else {
           $('.positionConfigInput').val(round2decimal(state.selectedItem.bounds.top + +state.frameSize / 2));
       }
       $(".mullianInput").val(state.selectedItem.data.profile);
   } else if (["mXBarT", "mYBarT"].includes(state.selectedItem.name)) {
       let sectionID = state.selectedItem.data.section;
       let section = state.paper.project.activeLayer.getItem({
           id: sectionID
       });
       let mXBarT, mYBarT;
       let dbG = state.paper.project.activeLayer.getItem({
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
       // حذف مودال قبلی
       const oldModal = document.querySelector(".wd-edit-item-modal");
       if (oldModal) {
           oldModal.remove();
       }
       // ایجاد مودال
       const modal = document.createElement("div");
       modal.className = "wd-edit-item-modal wd-single-field-modal";
       modal.innerHTML = `
<div class="wd-edit-item-overlay"></div>
<div class="wd-edit-item-container">
<!-- Header -->
<header class="wd-right-brand">
   <div class="wd-right-brand-inner">
       <div class="wd-right-site-info-addedit">
           <strong class="wd-right-site-title">
               ویرایش ابعاد
           </strong>
           <button
               type="button"
               class="wd-selection-close wd-edit-item-close"
               aria-label="Close"
           >
               <i class="ti ti-x"></i>
           </button>
       </div>
   </div>
</header>
<!-- Body -->
<div class="wd-edit-item-body">
   <!-- اطلاعات ابعاد -->
   <div class="wd-edit-item-fields">
       <!-- عرض -->
       <div class="wd-edit-item-field">
           <label
               class="wd-form-label"
               for="editItemWidth"
           >
               عرض
           </label>
           <input
               type="number"
               id="editItemWidth"
               class="wd-input-box"
               value="${mXBarT_Text}"
               min="1"
           >
       </div>
       <!-- ارتفاع -->
       <div class="wd-edit-item-field">
           <label
               class="wd-form-label"
               for="editItemHeight"
           >
               ارتفاع
           </label>
           <input
               type="number"
               id="editItemHeight"
               class="wd-input-box"
               value="${mYBarT_Text}"
               min="1"
           >
       </div>
   </div>
   <!-- خطا -->
   <div
       class="wd-edit-item-error"
       id="editItemError"
   ></div>
   <!-- عملیات -->
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
       setTimeout(() => {
           modal.classList.add("show");
       }, 10);
       // ورودی‌ها
       const widthInput =
           modal.querySelector("#editItemWidth");
       const heightInput =
           modal.querySelector("#editItemHeight");
       const errorBox =
           modal.querySelector("#editItemError");
       // بستن مودال
       function closeEditModal() {
           modal.classList.remove("show");
           setTimeout(() => {
               if (modal.parentNode) {
                   modal.remove();
               }
           }, 200);
       }
       // تغییر
       modal
           .querySelector(".wd-edit-item-save")
           .addEventListener("click", function () {
               const width =
                   parseInt(widthInput.value);
               const height =
                   parseInt(heightInput.value);
               if (!width || width < 1) {
                   errorBox.textContent =
                       "لطفاً عرض را وارد کنید.";
                   widthInput.focus();
                   return;
               }
               if (!height || height < 1) {
                   errorBox.textContent =
                       "لطفاً ارتفاع را وارد کنید.";
                   heightInput.focus();
                   return;
               }
               reDrawMainFrame(section, [
                   width,
                   height
               ]);
               closeEditModal();
           });
       // لغو
       modal
           .querySelector(".wd-edit-item-cancel")
           .addEventListener("click", function () {
               closeEditModal();
           });
       // ضربدر
       modal
           .querySelector(".wd-edit-item-close")
           .addEventListener("click", function () {
               closeEditModal();
           });
       // کلیک روی پس‌زمینه
       modal
           .querySelector(".wd-edit-item-overlay")
           .addEventListener("click", function () {
               closeEditModal();
           });
       // پاک کردن خطا
       widthInput.addEventListener("input", function () {
           errorBox.textContent = "";
       });
       heightInput.addEventListener("input", function () {
           errorBox.textContent = "";
       });
       // Enter برای ثبت
       widthInput.addEventListener("keypress", function (e) {
           if (e.key === "Enter") {
               e.preventDefault();
               modal
                   .querySelector(".wd-edit-item-save")
                   .click();
           }
       });
       heightInput.addEventListener("keypress", function (e) {
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
   } else if (state.selectedItem.name == "vMGLT") {
       const modal = document.createElement("div");
       modal.className = "wd-edit-item-modal wd-single-field-modal";
       modal.innerHTML = `
           <div class="wd-edit-item-overlay"></div>
           <div class="wd-edit-item-container">
               <header class="wd-right-brand">
                   <div class="wd-right-brand-inner">
                       <div class="wd-right-site-info-addedit">
                           <strong class="wd-right-site-title">
                               ویرایش اندازه
                           </strong>
                           <button
                               type="button"
                               class="wd-selection-close wd-edit-item-close"
                               aria-label="Close"
                           >
                               <i class="ti ti-x"></i>
                           </button>
                       </div>
                   </div>
               </header>
               <div class="wd-edit-item-body">
                   <div class="wd-edit-item-fields">
                       <div class="wd-edit-item-field">
                           <label
                               class="wd-form-label"
                               for="editItemSize"
                           >
                               اندازه
                           </label>
                           <input
                               type="number"
                               id="editItemSize"
                               class="wd-input-box"
                               value="${vMGLT.content}"
                               min="1"
                           >
                       </div>
                   </div>
                   <div
                       class="wd-edit-item-error"
                       id="editItemError"
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
       const sizeInput = modal.querySelector("#editItemSize");
       const errorBox = modal.querySelector("#editItemError");
       function closeEditModal() {
           modal.classList.remove("show");
           setTimeout(() => {
               if (modal.parentNode) {
                   modal.remove();
               }
           }, 200);
       }
       modal
           .querySelector(".wd-edit-item-save")
           .addEventListener("click", function () {
               const value = Number(sizeInput.value);
               if (!value || value < 1) {
                   errorBox.textContent =
                       "لطفاً اندازه را وارد کنید.";
                   sizeInput.focus();
                   return;
               }
               state.selectedItem = previousSelectedItem;
               changeMullianPosition(
                   new state.paper.Point(
                       value,
                       state.selectedItem.bounds.centerY
                   )
               );
               hideGLs();
               closeEditModal();
           });
       modal
           .querySelector(".wd-edit-item-cancel")
           .addEventListener("click", closeEditModal);
       modal
           .querySelector(".wd-edit-item-close")
           .addEventListener("click", closeEditModal);
       modal
           .querySelector(".wd-edit-item-overlay")
           .addEventListener("click", closeEditModal);
       sizeInput.addEventListener("input", function () {
           errorBox.textContent = "";
       });
       sizeInput.addEventListener("keydown", function (e) {
           if (e.key === "Enter") {
               e.preventDefault();
               modal
                   .querySelector(".wd-edit-item-save")
                   .click();
           }
       });
       setTimeout(() => {
           sizeInput.focus();
       }, 200);
   } else if (state.selectedItem.name == "vMGRT") {
       const modal = document.createElement("div");
       modal.className = "wd-edit-item-modal wd-single-field-modal";
       modal.innerHTML = `
           <div class="wd-edit-item-overlay"></div>
           <div class="wd-edit-item-container">
               <header class="wd-right-brand">
                   <div class="wd-right-brand-inner">
                       <div class="wd-right-site-info-addedit">
                           <strong class="wd-right-site-title">
                               ویرایش اندازه
                           </strong>
                           <button
                               type="button"
                               class="wd-selection-close wd-edit-item-close"
                               aria-label="Close"
                           >
                               <i class="ti ti-x"></i>
                           </button>
                       </div>
                   </div>
               </header>
               <div class="wd-edit-item-body">
                   <div class="wd-edit-item-fields">
                       <div class="wd-edit-item-field">
                           <label
                               class="wd-form-label"
                               for="editItemSize"
                           >
                               اندازه
                           </label>
                           <input
                               type="number"
                               id="editItemSize"
                               class="wd-input-box"
                               value="${vMGRT.content}"
                               min="1"
                           >
                       </div>
                   </div>
                   <div
                       class="wd-edit-item-error"
                       id="editItemError"
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
       const sizeInput = modal.querySelector("#editItemSize");
       const errorBox = modal.querySelector("#editItemError");
       function closeEditModal() {
           modal.classList.remove("show");
           setTimeout(() => {
               if (modal.parentNode) {
                   modal.remove();
               }
           }, 200);
       }
       modal
           .querySelector(".wd-edit-item-save")
           .addEventListener("click", function () {
               const value = Number(sizeInput.value);
               if (!value || value < 1) {
                   errorBox.textContent =
                       "لطفاً اندازه را وارد کنید.";
                   sizeInput.focus();
                   return;
               }
               state.selectedItem = previousSelectedItem;
               changeMullianPosition(
                   new state.paper.Point(
                       mainFrame.bounds.x +
                       mainFrame.bounds.width -
                       value,
                       state.selectedItem.bounds.centerY
                   )
               );
               hideGLs();
               closeEditModal();
           });
       modal
           .querySelector(".wd-edit-item-cancel")
           .addEventListener("click", closeEditModal);
       modal
           .querySelector(".wd-edit-item-close")
           .addEventListener("click", closeEditModal);
       modal
           .querySelector(".wd-edit-item-overlay")
           .addEventListener("click", closeEditModal);
       sizeInput.addEventListener("input", function () {
           errorBox.textContent = "";
       });
       sizeInput.addEventListener("keydown", function (e) {
           if (e.key === "Enter") {
               e.preventDefault();
               modal
                   .querySelector(".wd-edit-item-save")
                   .click();
           }
       });
       setTimeout(() => {
           sizeInput.focus();
       }, 200);
   } else if (state.selectedItem.name == "hMGTT") {
       const modal = document.createElement("div");
       modal.className = "wd-edit-item-modal wd-single-field-modal";
       modal.innerHTML = `
           <div class="wd-edit-item-overlay"></div>
           <div class="wd-edit-item-container">
               <header class="wd-right-brand">
                   <div class="wd-right-brand-inner">
                       <div class="wd-right-site-info-addedit">
                           <strong class="wd-right-site-title">
                               ویرایش اندازه
                           </strong>
                           <button
                               type="button"
                               class="wd-selection-close wd-edit-item-close"
                               aria-label="Close"
                           >
                               <i class="ti ti-x"></i>
                           </button>
                       </div>
                   </div>
               </header>
               <div class="wd-edit-item-body">
                   <div class="wd-edit-item-fields">
                       <div class="wd-edit-item-field">
                           <label
                               class="wd-form-label"
                               for="editItemSize"
                           >
                               اندازه
                           </label>
                           <input
                               type="number"
                               id="editItemSize"
                               class="wd-input-box"
                               value="${hMGTT.content}"
                               min="1"
                           >
                       </div>
                   </div>
                   <div
                       class="wd-edit-item-error"
                       id="editItemError"
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
       const sizeInput = modal.querySelector("#editItemSize");
       const errorBox = modal.querySelector("#editItemError");
       function closeEditModal() {
           modal.classList.remove("show");
           setTimeout(() => {
               if (modal.parentNode) {
                   modal.remove();
               }
           }, 200);
       }
       modal
           .querySelector(".wd-edit-item-save")
           .addEventListener("click", function () {
               const value = Number(sizeInput.value);
               if (!value || value < 1) {
                   errorBox.textContent =
                       "لطفاً اندازه را وارد کنید.";
                   sizeInput.focus();
                   return;
               }
               state.selectedItem = previousSelectedItem;
               changeMullianPosition(
                   new state.paper.Point(
                       state.selectedItem.bounds.centerX,
                       value
                   )
               );
               hideGLs();
               closeEditModal();
           });
       modal
           .querySelector(".wd-edit-item-cancel")
           .addEventListener("click", closeEditModal);
       modal
           .querySelector(".wd-edit-item-close")
           .addEventListener("click", closeEditModal);
       modal
           .querySelector(".wd-edit-item-overlay")
           .addEventListener("click", closeEditModal);
       sizeInput.addEventListener("input", function () {
           errorBox.textContent = "";
       });
       sizeInput.addEventListener("keydown", function (e) {
           if (e.key === "Enter") {
               e.preventDefault();
               modal
                   .querySelector(".wd-edit-item-save")
                   .click();
           }
       });
       setTimeout(() => {
           sizeInput.focus();
       }, 200);
   } else if (state.selectedItem.name == "hMGBT") {
       const modal = document.createElement("div");
       modal.className = "wd-edit-item-modal wd-single-field-modal";
       modal.innerHTML = `
           <div class="wd-edit-item-overlay"></div>
           <div class="wd-edit-item-container">
               <header class="wd-right-brand">
                   <div class="wd-right-brand-inner">
                       <div class="wd-right-site-info-addedit">
                           <strong class="wd-right-site-title">
                               ویرایش اندازه
                           </strong>
                           <button
                               type="button"
                               class="wd-selection-close wd-edit-item-close"
                               aria-label="Close"
                           >
                               <i class="ti ti-x"></i>
                           </button>
                       </div>
                   </div>
               </header>
               <div class="wd-edit-item-body">
                   <div class="wd-edit-item-fields">
                       <div class="wd-edit-item-field">
                           <label
                               class="wd-form-label"
                               for="editItemSize"
                           >
                               اندازه
                           </label>
                           <input
                               type="number"
                               id="editItemSize"
                               class="wd-input-box"
                               value="${hMGBT.content}"
                               min="1"
                           >
                       </div>
                   </div>
                   <div
                       class="wd-edit-item-error"
                       id="editItemError"
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
       const sizeInput = modal.querySelector("#editItemSize");
       const errorBox = modal.querySelector("#editItemError");
       function closeEditModal() {
           modal.classList.remove("show");
           setTimeout(() => {
               if (modal.parentNode) {
                   modal.remove();
               }
           }, 200);
       }
       modal
           .querySelector(".wd-edit-item-save")
           .addEventListener("click", function () {
               const value = Number(sizeInput.value);
               if (!value || value < 1) {
                   errorBox.textContent =
                       "لطفاً اندازه را وارد کنید.";
                   sizeInput.focus();
                   return;
               }
               state.selectedItem = previousSelectedItem;
               changeMullianPosition(
                   new state.paper.Point(
                       state.selectedItem.bounds.centerX,
                       mainFrame.bounds.y +
                       mainFrame.bounds.height -
                       value
                   )
               );
               hideGLs();
               closeEditModal();
           });
       modal
           .querySelector(".wd-edit-item-cancel")
           .addEventListener("click", closeEditModal);
       modal
           .querySelector(".wd-edit-item-close")
           .addEventListener("click", closeEditModal);
       modal
           .querySelector(".wd-edit-item-overlay")
           .addEventListener("click", closeEditModal);
       sizeInput.addEventListener("input", function () {
           errorBox.textContent = "";
       });
       sizeInput.addEventListener("keydown", function (e) {
           if (e.key === "Enter") {
               e.preventDefault();
               modal
                   .querySelector(".wd-edit-item-save")
                   .click();
           }
       });
       setTimeout(() => {
           sizeInput.focus();
       }, 200);
   } else if (state.selectedItem.name == "xBarT") {
       const modal = document.createElement("div");
       modal.className = "wd-edit-item-modal wd-single-field-modal";
       modal.innerHTML = `
           <div class="wd-edit-item-overlay"></div>
           <div class="wd-edit-item-container">
               <header class="wd-right-brand">
                   <div class="wd-right-brand-inner">
                       <div class="wd-right-site-info-addedit">
                           <strong class="wd-right-site-title">
                               ویرایش اندازه
                           </strong>
                           <button
                               type="button"
                               class="wd-selection-close wd-edit-item-close"
                               aria-label="Close"
                           >
                               <i class="ti ti-x"></i>
                           </button>
                       </div>
                   </div>
               </header>
               <div class="wd-edit-item-body">
                   <div class="wd-edit-item-fields">
                       <div class="wd-edit-item-field">
                           <label
                               class="wd-form-label"
                               for="editItemSize"
                           >
                               اندازه
                           </label>
                           <input
                               type="number"
                               id="editItemSize"
                               class="wd-input-box"
                               value="${state.selectedItem.content}"
                               min="1"
                           >
                       </div>
                   </div>
                   <div
                       class="wd-edit-item-error"
                       id="editItemError"
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
       const sizeInput = modal.querySelector("#editItemSize");
       const errorBox = modal.querySelector("#editItemError");
       function closeEditModal() {
           modal.classList.remove("show");
           setTimeout(() => {
               if (modal.parentNode) {
                   modal.remove();
               }
           }, 200);
       }
       modal
           .querySelector(".wd-edit-item-save")
           .addEventListener("click", function () {
               const value = Number(sizeInput.value);
               if (!value || value < 1) {
                   errorBox.textContent =
                       "لطفاً اندازه را وارد کنید.";
                   sizeInput.focus();
                   return;
               }
               changeMullianPositionByNumber({
                   from: state.selectedItem.data.position,
                   to:
                       state.selectedItem.data.position +
                       (value - state.selectedItem.content),
                   label: state.selectedItem.content,
                   mullianType: "vMullian",
                   sectionID: state.selectedItem.data.section
               });
               closeEditModal();
           });
       modal
           .querySelector(".wd-edit-item-cancel")
           .addEventListener("click", closeEditModal);
       modal
           .querySelector(".wd-edit-item-close")
           .addEventListener("click", closeEditModal);
       modal
           .querySelector(".wd-edit-item-overlay")
           .addEventListener("click", closeEditModal);
       sizeInput.addEventListener("input", function () {
           errorBox.textContent = "";
       });
       sizeInput.addEventListener("keydown", function (e) {
           if (e.key === "Enter") {
               e.preventDefault();
               modal
                   .querySelector(".wd-edit-item-save")
                   .click();
           }
       });
       setTimeout(() => {
           sizeInput.focus();
       }, 200);
   } else if (state.selectedItem.name == "yBarT") {
       const modal = document.createElement("div");
       modal.className = "wd-edit-item-modal wd-single-field-modal";
       modal.innerHTML = `
           <div class="wd-edit-item-overlay"></div>
           <div class="wd-edit-item-container">
               <header class="wd-right-brand">
                   <div class="wd-right-brand-inner">
                       <div class="wd-right-site-info-addedit">
                           <strong class="wd-right-site-title">
                               ویرایش اندازه
                           </strong>
                           <button
                               type="button"
                               class="wd-selection-close wd-edit-item-close"
                               aria-label="Close"
                           >
                               <i class="ti ti-x"></i>
                           </button>
                       </div>
                   </div>
               </header>
               <div class="wd-edit-item-body">
                   <div class="wd-edit-item-fields">
                       <div class="wd-edit-item-field">
                           <label
                               class="wd-form-label"
                               for="editItemSize"
                           >
                               اندازه
                           </label>
                           <input
                               type="number"
                               id="editItemSize"
                               class="wd-input-box"
                               value="${state.selectedItem.content}"
                               min="1"
                           >
                       </div>
                   </div>
                   <div
                       class="wd-edit-item-error"
                       id="editItemError"
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
       const sizeInput = modal.querySelector("#editItemSize");
       const errorBox = modal.querySelector("#editItemError");
       function closeEditModal() {
           modal.classList.remove("show");
           setTimeout(() => {
               if (modal.parentNode) {
                   modal.remove();
               }
           }, 200);
       }
       modal
           .querySelector(".wd-edit-item-save")
           .addEventListener("click", function () {
               const value = Number(sizeInput.value);
               if (!value || value < 1) {
                   errorBox.textContent =
                       "لطفاً اندازه را وارد کنید.";
                   sizeInput.focus();
                   return;
               }
               changeMullianPositionByNumber({
                   from: state.selectedItem.data.position,
                   to:
                       state.selectedItem.data.position +
                       (value - state.selectedItem.content),
                   label: state.selectedItem.content,
                   mullianType: "hMullian",
                   sectionID: state.selectedItem.data.section
               });
               closeEditModal();
           });
       modal
           .querySelector(".wd-edit-item-cancel")
           .addEventListener("click", closeEditModal);
       modal
           .querySelector(".wd-edit-item-close")
           .addEventListener("click", closeEditModal);
       modal
           .querySelector(".wd-edit-item-overlay")
           .addEventListener("click", closeEditModal);
       sizeInput.addEventListener("input", function () {
           errorBox.textContent = "";
       });
       sizeInput.addEventListener("keydown", function (e) {
           if (e.key === "Enter") {
               e.preventDefault();
               modal
                   .querySelector(".wd-edit-item-save")
                   .click();
           }
       });
       setTimeout(() => {
           sizeInput.focus();
       }, 200);
   }
   //show details on itemDetails
   itemDetailsBar(state.selectedItem);
   setItemProfileName();
  }

  // اگر روی قسمت خالی Canvas کلیک شده باشد

  else {
   state.paper.project.deselectAll();
   state.paper.project.activeLayer.selected = false;
   hideItemConfigOptions();
  }
 };
 // Mouse Up
 tool.onMouseUp = function (event) {
  $(".unitOptions")
   .removeClass(
    'position-fixed unitOptionsExtra'
   );
  $(".unitOptions").css({
   'left': 'auto',
   'top': 'auto'
  });

  // تغییر موقعیت Mullian

  if (state.changeMullianPositionFlag) {
   state.changeMullianPositionFlag = false;
   changeMullianPosition(
    new state.paper.Point(
     Math.ceil(
      event.point.x /
      state.moveStepFactor
     ) * state.moveStepFactor,
     Math.ceil(
      event.point.y /
      state.moveStepFactor
     ) * state.moveStepFactor
    )
   );
   hideGLs();
  }

  // تغییر موقعیت Window / Door / Panel

  else if (
   state.changeWindowDoorPanelPositionFlag
  ) {
   state.changeWindowDoorPanelPositionFlag = false;
   changeWindowDoorPanelPosition(
    new state.paper.Point(
     Math.ceil(
      event.point.x /
      state.moveStepFactor
     ) * state.moveStepFactor,
     Math.ceil(
      event.point.y /
      state.moveStepFactor
     ) * state.moveStepFactor
    )
   );
   hideGLs();
  }

  // اضافه کردن آیتم جدید

  else if (
   state.waitingToAddItemFlag
  ) {
   state.waitingToAddItemFlag = false;
   addNewItem(
    state.addNewItemType,
    state.selectedItem,
    new state.paper.Point(
     Math.ceil(
      event.point.x /
      state.moveStepFactor
     ) * state.moveStepFactor,
     Math.ceil(
      event.point.y /
      state.moveStepFactor
     ) * state.moveStepFactor
    )
   );
   state.paper.project.activeLayer.selected = false;
   hideItemConfigOptions();
   state.selectedItem = false;
  }

  // پایان Drag

  else if (state.tryingToDrag) {
   state.tryingToDrag = false;
   hideGLs();
  }
  document.body.style.cursor = "default";
  mouseHelperHide();
 };
 // Mouse Move
 tool.onMouseMove = function (event) {
  if (
   state.waitingToAddItemFlag ||
   state.changeMullianPositionFlag ||
   state.changeWindowDoorPanelPositionFlag
  ) {
   showGLs(event);
  }
  $('.mousePosition').html(
   '<span class="small ms-1">' +
   'x:' +
   Math.round(event.point.x) +
   ' y:' +
   Math.round(event.point.y) +
   '</span>'
  );
 };
 // Mouse Drag
 tool.onMouseDrag = function (event) {
  let dragDistance =
   event.downPoint.getDistance(
    event.point
   );

  // Drag کردن Mullian

  if (
   state.selectedItem &&
   !state.deleteMode &&
   (
    state.selectedItem.name == "vMullian" ||
    state.selectedItem.name == "hMullian"
   )
  ) {
   state.tryingToDrag = true;
   showGLs(event);
   if (
    dragDistance >
    state.dragThreshold
   ) {
    state.changeMullianPositionFlag = true;
    state.tryingToDrag = false;
   }
  }

  // Drag کردن Window / Door / Panel

  else if (
   state.selectedItem &&
   !state.deleteMode &&
   [
    "windowFrame",
    "doorFrame",
    "vPanel",
    "hPanel"
   ].includes(
    state.selectedItem.name
   )
  ) {
   state.tryingToDrag = true;
   showGLs(event);
   if (
    dragDistance >
    state.dragThreshold
   ) {
    state.changeWindowDoorPanelPositionFlag = true;
    state.tryingToDrag = false;
   }
  }

  // حرکت Canvas

  else {
   state.paper.view.center =
    event.downPoint
     .subtract(event.point)
     .add(
      state.paper.view.center
     );
  }
 };
 // Keyboard
 if (!state.keyboard) {
  state.keyboard = {
   shift: false,
   ctrl: false
  };
 }
 // Key Down
 tool.onKeyDown = function (event) {
  let ofcAddNew =
   $('#ofcAddNew').css(
    'visibility'
   );
  if (
   ofcAddNew !== 'visible' &&
   !$('input').is(':focus')
  ) {
   // Escape
   if (event.key == "escape") {
    cancelAll();
   }
   // Shift + V
   if (
    event.modifiers.shift &&
    event.key == "v"
   ) {
    event.preventDefault();
    $('.vMullianEualling')
     .trigger('click');
   }
   // Shift + H
   if (
    event.modifiers.shift &&
    event.key == "h"
   ) {
    event.preventDefault();
    $('.hMullianEualling')
     .trigger('click');
   }
   // Ctrl + S
   if (
    event.modifiers.control &&
    event.key == "s"
   ) {
    event.preventDefault();
    $('#saveProject:visible')
     .trigger('click');
   }
   // Ctrl + Z
   if (
    event.modifiers.control &&
    event.key == "z"
   ) {
    $('.undo:visible')
     .trigger('click');
   }
   // Ctrl + Y
   if (
    event.modifiers.control &&
    event.key == "y"
   ) {
    $('.redo:visible')
     .trigger('click');
   }
   // Delete
   if (event.key == "delete") {
    $('.dellItem')
     .trigger('click');
   }
   // U
   if (event.key == "u") {
    $(".addNewLayer:visible")
     .trigger('click');
   }
   // M
   if (event.key == "m") {
    $("button[data-bs-target='#ofcMullian']:visible")
     .trigger('click');
   }
   // W
   if (event.key == "w") {
    $("button[data-bs-target='#ofcWindow']:visible")
     .trigger('click');
   }
   // D
   if (event.key == "d") {
    $("button[data-bs-target='#ofcDoor']:visible")
     .trigger('click');
   }
   // S
   if (
    event.key == "s" &&
    !event.modifiers.control
   ) {
    $("button[data-bs-target='#ofcSlide']:visible")
     .trigger('click');
   }
   // P
   if (event.key == "p") {
    $("button[data-bs-target='#ofcPanel']:visible")
     .trigger('click');
   }
   // O
   if (event.key == "o") {
    $("button[data-bs-target='#ofcCoupling']:visible")
     .trigger('click');
   }
   // ذخیره وضعیت Shift
   if (event.modifiers.shift) {
    state.keyboard.shift = true;
   }
   // ذخیره وضعیت Ctrl
   if (event.modifiers.control) {
    state.keyboard.ctrl = true;
   }
  }
 };
 // Key Up
 tool.onKeyUp = function (event) {
  state.keyboard.shift = false;
  state.keyboard.ctrl = false;
 };
 // ویرایش نام و تعداد آیتم
 $(document)
 .off(
     "click.tempLayerEdit",
     ".wd-item-edit"
 )
 .on(
     "click.tempLayerEdit",
     ".wd-item-edit",
     function (e) {
         e.preventDefault();
         e.stopPropagation();
         const $card = $(this).closest(".wd-item-card");
         if (!$card.length) {
             return;
         }
         const designID = $card
             .attr("id")
             .replace("layer_", "");
         const design = state.tempDesigns?.find(
             item =>
                 String(item.id) ===
                 String(designID)
         );
         if (!design) {
             return;
         }
         const itemName =
             design.unitData?.itemName || "";
         const quantity =
             design.unitData?.quantity || 1;
         // Modal ویرایش آیتم
         const oldModal = document.querySelector(".wd-edit-item-modal");
         if (oldModal) {
             oldModal.remove();
         }
         const modal = document.createElement("div");
         modal.className = "wd-edit-item-modal";
         modal.innerHTML = `
<div class="wd-edit-item-overlay"></div>
<div class="wd-edit-item-container" >
 <!-- Header -->
 <header class="wd-right-brand">
     <div class="wd-right-brand-inner">
         <div class="wd-right-site-info-addedit">
             <strong class="wd-right-site-title">
                 ویرایش آیتم
             </strong>
             <button
                 type="button"
                 class="wd-selection-close wd-edit-item-close"
                 aria-label="Close"
             >
                 <i class="ti ti-x"></i>
             </button>
         </div>
     </div>
 </header>
 <!-- Body -->
 <div class="wd-edit-item-body">
     <!-- اطلاعات آیتم -->
     <div class="wd-edit-item-fields">
         <!-- شماره آیتم -->
         <div class="wd-edit-item-field">
             <label
                 class="wd-form-label"
                 for="editItemNumber"
             >
                 شماره آیتم
             </label>
             <input
                 type="text"
                 id="editItemNumber"
                 class="wd-input-box"
                 value="${design.unitData?.itemNumber || ""}"
                 placeholder="شماره آیتم"
             >
         </div>
         <!-- نام آیتم -->
         <div class="wd-edit-item-field">
             <label
                 class="wd-form-label"
                 for="editItemName"
             >
                 نام آیتم
             </label>
             <input
                 type="text"
                 id="editItemName"
                 class="wd-input-box"
                 value="${itemName}"
                 placeholder="نام آیتم"
             >
         </div>
         <!-- تعداد -->
         <div class="wd-edit-item-field wd-edit-item-quantity-field">
             <label
                 class="wd-form-label"
                 for="editItemQuantity"
             >
                 تعداد
             </label>
             <div class="wd-counter-control">
                 <button
                     type="button"
                     class="wd-counter-button edit_quantity_plus"
                 >
                     +
                 </button>
                 <input
                     type="number"
                     id="editItemQuantity"
                     class="wd-counter-number"
                     value="${quantity}"
                     min="1"
                 >
                 <button
                     type="button"
                     class="wd-counter-button edit_quantity_minus"
                 >
                     −
                 </button>
             </div>
         </div>
     </div>
     <!-- خطا -->
     <div
         class="wd-edit-item-error"
         id="editItemError"
     ></div>
     <!-- عملیات -->
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
         setTimeout(() => {
             modal.classList.add("show");
         }, 10);
         // ورودی‌ها
         const numberInput =
             modal.querySelector("#editItemNumber");
         const nameInput =
             modal.querySelector("#editItemName");
         const quantityInput =
             modal.querySelector("#editItemQuantity");
         const errorBox =
             modal.querySelector("#editItemError");
         // بستن
         function closeEditModal() {
             modal.classList.remove("show");
             setTimeout(() => {
                 if (modal.parentNode) {
                     modal.remove();
                 }
             }, 200);
         }
         // تغییر
         modal
             .querySelector(".wd-edit-item-save")
             .addEventListener("click", function () {
                 const itemNumber =
                     numberInput.value.trim();
                 const name =
                     nameInput.value.trim();
                 const newQuantity =
                     parseInt(quantityInput.value);
                 if (!itemNumber) {
                     errorBox.textContent =
                         "لطفاً شماره آیتم را وارد کنید.";
                     numberInput.focus();
                     return;
                 }
                 if (!name) {
                     errorBox.textContent =
                         "لطفاً نام آیتم را وارد کنید.";
                     nameInput.focus();
                     return;
                 }
                 if (!newQuantity || newQuantity < 1) {
                     errorBox.textContent =
                         "تعداد باید حداقل ۱ باشد.";
                     quantityInput.focus();
                     return;
                 }
                 design.unitData = {
                     ...design.unitData,
                     itemNumber: itemNumber,
                     itemName: name,
                     quantity: newQuantity
                 };
                 design.name = name;
                 // بروزرسانی کارت
                 $card
                     .find(".wd-item-title")
                     .text(
                         `${itemNumber} - ${name}`
                     );
                 $card
                     .find(".wd-item-quantity")
                     .text(
                         ` | تعداد: ${newQuantity}`
                     );
                 // اگر طراحی فعال است
                 if (
                     state.currentDesignID &&
                     String(state.currentDesignID) ===
                     String(designID)
                 ) {
                     state.unitData = {
                         ...state.unitData,
                         itemNumber: itemNumber,
                         itemName: name,
                         quantity: newQuantity
                     };
                 }
                 closeEditModal();
             });
         // لغو
         modal
             .querySelector(".wd-edit-item-cancel")
             .addEventListener("click", function () {
                 closeEditModal();
             });
         // ضربدر
         modal
             .querySelector(".wd-edit-item-close")
             .addEventListener("click", function () {
                 closeEditModal();
             });
         // کلیک روی پس زمینه
         modal
             .querySelector(".wd-edit-item-overlay")
             .addEventListener("click", function () {
                 closeEditModal();
             });
         // افزایش تعداد
         modal
             .querySelector(".edit_quantity_plus")
             .addEventListener("click", function () {
                 let value =
                     parseInt(quantityInput.value) || 1;
                 value++;
                 quantityInput.value = value;
             });
         // کاهش تعداد
         modal
             .querySelector(".edit_quantity_minus")
             .addEventListener("click", function () {
                 let value =
                     parseInt(quantityInput.value) || 1;
                 if (value > 1) {
                     value--;
                 }
                 quantityInput.value = value;
             });
         // پاک کردن خطا
         numberInput.addEventListener("input", function () {
             errorBox.textContent = "";
         });
         nameInput.addEventListener("input", function () {
             errorBox.textContent = "";
         });
         quantityInput.addEventListener("input", function () {
             errorBox.textContent = "";
         });
         // فوکوس
         setTimeout(() => {
             numberInput.focus();
         }, 200);
     }
 );
}