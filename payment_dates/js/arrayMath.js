/**
 * Returns the result of adding the value to the current total
 * @param {Number} currentTotal 
 * @param {Number} value 
 * @returns Number
 */
let addition = function(currentTotal, value) {
    return currentTotal + value;
}


/**
 * Returns the result of subtracting the value to the current total
 * @param {Number} currentTotal 
 * @param {Number} value 
 * @returns Number
 */
let subtraction = function(currentTotal, value) {
    return currentTotal - value;
}


/**
 * Returns the total to given number of decimal places
 * @param {Number} value 
 * @param {Number} places
 * @returns Number
 */
function toDecimalPlaces(value, places = 2) {
    return Number.parseFloat(value).toFixed(places);
}


/**
 * Performs the given funciotn on the given list of values
 * @param {function} calculation 
 * @param {Array of Numbers} valueList 
 * @returns Number
 */
function performCalculation(calculate, valueList) {
    // Start Total with the first value in the array
    let total = 0.0;

    for(let val of valueList) {
        val = Number.parseFloat(val);
        total = calculate(total, val);
    }

    return total;
}


/**
 * Calls a function and passes current total and given list of numbers
 * @param {String} sumType 
 * @param {Array of Numbners} valueList 
 * @returns Number
 */
function calculateArray(calcType, valueList, decimals) {
    let result;
    switch(calcType) {
        case 'addition':
            result = performCalculation(addition, valueList);
            return toDecimalPlaces(result, decimals);
        case 'subtraction':
            result = performCalculation(subtraction, valueList);
            return toDecimalPlaces(result, decimals);
        default:
            console.log('Error, sum not recognized');
    }
}


