/**
 * Runs a collection of validation functions on given data
 * @param {Array} data 
 * @returns Boolean
 */
function validatePaymentData(data) {
    // Array of validation methods
    let validation = [validType(data[0]), validDate(data[1]), validName(data[2]), validValue(data[3])];
    // Check if frequency is present
    switch(data.length) {
        case 5:
            validation.push(validOption(data[4]));
            break;
        case 6:
            validation.push(validFrequency(data[4]), validBool(data[5]));
            break;
        case 7:
            validation.push(validFrequency(data[4]), validBool(data[5]), validDate(data[6]));
            break;
    }

    // Run validation checks
    for(let valid of validation) {
        // Check if not valid
        if(!valid) {
            // If not valid return false
            return false;
        }
    }

    // If all is successful, return true.
    return true;
}


/**
 * Checks that the payment type is In or OUT
 * Returns Boolean.
 * @param {String} type 
 * @returns Boolean
 */
function validType(type) {
    switch(type) {
        case 'IN':
        case 'OUT':
            return true;
        default:
            return false;
    }
}

/**
 * Checks that input is a valid date string.
 * Returns a Boolean
 * @param {String} date 
 * @returns Boolean
 */
function validDate(date) {
    let d = new Date(date);

    if(d == 'Invalid Date') {
        return false;
    } else {
        return true;
    }
}


/**
 * Checks if given name is not blank
 * @param {Number} value 
 * @returns Boolean
 */
function validName(name) {
    // Check value is NOT NaN
    if(name.length != 0) {
        return true;
    }
    return false;
}


/**
 * Checks if given value is a Number
 * @param {Number} value 
 * @returns Boolean
 */
function validValue(value) {
    // Check value is NOT NaN
    if(!Number.isNaN(value)) {
        // No negative numbers allowed
        if(value >= 0.0) {
            return true;
        }
    }
    return false;
}


/**
 * Checks that frequency is valid
 * @param {string} frequency 
 * @returns Boolean
 */
function validFrequency(frequency) {
    freq = frequency.split('=')
    switch(freq[0]) {
        case 'WEEKDAYS':
        case 'WEEK':
        case 'FORTNIGHT':
        case 'MONTH':
            return true
        default:
            switch(freq[0]) {
                case 'DAYS':
                case 'WEEKS':
                case 'MONTHS':
                case 'YEARS':
                    if(freq[1].isNaN) {
                        return false
                    } else {
                        return true
                    }
            }

            // Return false as never caught
            return false
        }
}

/**
 * Checks that UC Option is valid
 * @param {string} opt 
 * @returns Boolean
 */
function validOption(opt) {
    switch(opt) {
        case 'WEEK':
        case 'FORTNIGHT':
        case 'MONTH':
            return true;
        default:
            return false;
    }
}


/**
 * Checks that UC Option is valid
 * @param {string} opt 
 * @returns Boolean
 */
function validBool(bool) {
    switch(bool) {
        case true:
        case false:
            return true;
        default:
            return false;
    }
}