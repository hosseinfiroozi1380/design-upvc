// src/utils/waterSlut.js
// find Water Sluts on horizontal profiles
export function waterSlut(item, type) {
    let sluts = [];
    if ([
        'hMullian',
        'vMullian',
        'windowFrame',
        'doorFrame',
        'mainFrame'
    ].includes(type)) {
        let width = item.bounds.width;
        if ([
            'windowFrame',
            'doorFrame',
            'mainFrame'
        ].includes(type)) {
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
}