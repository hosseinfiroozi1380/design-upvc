// src/utils/calculate.js
import state from '../core/state.js';
import { calcItem } from './calcItem.js';
import { calcPanel } from '../items/calcPanel.js';
import { calcFrame } from './calcFrame.js';
// CALCULATIONS
export function calculate() {
    state.calculations = {};
    state.calculations.mainFrame = {};
    state.calculations.doorFrame = {};
    state.calculations.windowFrame = {};
    state.calculations.flat = {};
    state.calculations.mullian = {};
    state.calculations.panel = {};
    state.calculations.coupling = {};
    state.calculations.lace = {};
    state.calculations.glazing = {};
    let items = state.paper.project.getItems({
        name: function (value) {
            return [
                'vMullian',
                'hMullian',
                'flat',
                'vCoupling',
                'hCoupling'
            ].includes(value);
        }
    });
    $.each(items, function (key, item) {
        calcItem({
            item: item,
            id: item.id,
            type: item.name,
            parent: item.parent.id,
        });
    });
    items = state.paper.project.getItems({
        name: function (value) {
            return [
                'vPanel',
                'hPanel'
            ].includes(value);
        }
    });
    $.each(items, function (key, item) {
        calcPanel({
            item: item,
            id: item.id,
            type: item.name,
            parent: item.parent.id,
        });
    });
    items = state.paper.project.getItems({
        name: function (value) {
            return [
                'mainFrame'
            ].includes(value);
        }
    });
    $.each(items, function (key, item) {
        calcFrame({
            item: item,
            id: item.id,
            type: item.name,
            parent: item.parent.id,
        });
    });
    items = state.paper.project.getItems({
        name: function (value) {
            return [
                'windowFrame',
                'doorFrame'
            ].includes(value);
        }
    });
    $.each(items, function (key, item) {
        calcFrame({
            item: item,
            id: item.parent.id,
            type: item.parent.name,
            parent: item.parent.id,
        });
        if (item.data.lace !== 0) {
            calcItem({
                item: item,
                id: item.data.lace,
                type: 'lace',
                parent: item.id,
            });
        }
    });
}