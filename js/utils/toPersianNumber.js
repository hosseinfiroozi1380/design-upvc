// src/utils/toPersianNumber.js

export function toPersianNumber(value) {
 return String(value)
  .replace(/\d/g, function (digit) {
   return "۰۱۲۳۴۵۶۷۸۹"[digit];
  });
}