// js/utils/persianNumbers.js
const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
function convertText(text) {
 return text.replace(
  /\d/g,
  function (digit) {
   return persianDigits[digit];
  }
 );
}
function convertVisibleText(root) {
 const walker = document.createTreeWalker(
  root,
  NodeFilter.SHOW_TEXT,
  {
   acceptNode: function (node) {
    const parent =
     node.parentElement;
    if (!parent) {
     return NodeFilter.FILTER_REJECT;
    }
    const tag =
     parent.tagName.toLowerCase();
    // این موارد نباید تغییر کنند
    if (
     tag === "script" ||
     tag === "style" ||
     tag === "noscript"
    ) {
     return NodeFilter.FILTER_REJECT;
    }
    return NodeFilter.FILTER_ACCEPT;
   }
  }
 );
 const nodes = [];
 let node;
 while ((node = walker.nextNode())) {
  nodes.push(node);
 }
 nodes.forEach(function (node) {
  const converted =
   convertText(node.nodeValue);
  if (converted !== node.nodeValue) {
   node.nodeValue = converted;
  }
 });
}
function convertInputs(root) {
 const inputs =
  root.querySelectorAll
   ? root.querySelectorAll(
    "input:not([type='hidden']), textarea"
   )
   : [];
 inputs.forEach(function (input) {
  if (input.value) {
   input.value =
    convertText(input.value);
  }
  if (input.placeholder) {
   input.placeholder =
    convertText(
     input.placeholder
    );
  }
 });
}
function convertAll(root = document.body) {
 if (!root) {
  return;
 }
 convertVisibleText(root);
 convertInputs(root);
}
// وقتی DOM کاملاً آماده شد
function startPersianNumbers() {
 convertAll();
 const observer =
  new MutationObserver(function (mutations) {
   mutations.forEach(function (mutation) {
    mutation.addedNodes.forEach(
     function (node) {
      if (
       node.nodeType ===
       Node.TEXT_NODE
      ) {
       const converted =
        convertText(
         node.nodeValue
        );
       if (
        converted !==
        node.nodeValue
       ) {
        node.nodeValue =
         converted;
       }
      }
      else if (
       node.nodeType ===
       Node.ELEMENT_NODE
      ) {
       convertAll(node);
      }
     }
    );
   });
  });
 observer.observe(
  document.body,
  {
   childList: true,
   subtree: true
  }
 );
 // اعداد هنگام تایپ در input
 document.addEventListener(
  "input",
  function (event) {
   const target =
    event.target;
   if (
    target.matches(
     "input:not([type='hidden']), textarea"
    )
   ) {
    const start =
     target.selectionStart;
    const oldValue =
     target.value;
    const newValue =
     convertText(oldValue);
    if (oldValue !== newValue) {
     target.value = newValue;
     if (
      start !== null
     ) {
      target.setSelectionRange(
       start,
       start
      );
     }
    }
   }
  }
 );
}
if (
 document.readyState ===
 "loading"
) {
 document.addEventListener(
  "DOMContentLoaded",
  startPersianNumbers
 );
} else {
 startPersianNumbers();
}