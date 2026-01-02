/**
 * Calculates the days between two given dates and returns the result as an Int.
 * @param {Date} date1 
 * @param {Date} date2 
 * @returns Int
 */
function getDays(date1, date2) {
    const miliSeconds = 86400000; //Miliseconds within 24 hours
    return (date1 - date2) / miliSeconds;
}


/**
 * Returns a new Date object with the smae date as the one suplied.
 * @param {Date} date 
 * @returns Date
 */
function cloneDate(date) {
    return new Date(date.toDateString());
}


/**
 * Calculates the number of days between the date given and today.
 * Returns the result as an int.
 * @param {Date} startDate 
 * @returns Int
 */
function getDaysSince(startDate) {
    return Math.floor(getDays(new Date(), startDate));
}


/**
 * Calculates the number of days until the given date from today.
 * Returns the result as an Int.
 * @param {Date} endDate 
 * @returns Int
 */
function getDaysUntil(endDate) {
    return Math.ceil(getDays(endDate, new Date()));
}


/**
 * Returns a new Date object with the given number of days added to the supplied Date object.
 * @param {Date} date 
 * @param {Int} days 
 * @returns Date
 */
function addDays(date, days) {
    let newDate = cloneDate(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
}


/**
 * Returns a new Date object with the given number of weeks added to the supplied Date object.
 * @param {Date} date 
 * @param {Int} weeks 
 * @returns Date
 */
function addWeeks(date, weeks) {
    let newDate = cloneDate(date);
    let days = weeks * 7;
    newDate = addDays(newDate, days);
    return newDate;
}


/**
 * Returns a new Date object with the given number of months added to the supplied Date object.
 * @param {Date} date 
 * @param {Int} months 
 * @returns Date
 */
function addMonths(date, months) {
    let newDate = cloneDate(date);
    newDate.setMonth(newDate.getMonth() + months);
    
    if(newDate.getDate() < date.getDate()) {
		newDate.setDate(1);
		newDate = minusDays(newDate, 1);
	}
    
    return newDate;
}


/**
 * Returns a new Date object with the given number of years added to the supplied Date object.
 * @param {Date} date 
 * @param {Int} years 
 * @returns Date
 */
function addYears(date, years) {
    let newDate = cloneDate(date);
    
    // If not a leap year, and date lands on 29th Feb
    // set date to 28.
    if(date.getMonth() == 1 && date.getDate() == 29 && date.getFullYear() + years % 4 != 0) {
		newDate.setDate(28);
	}
    newDate.setFullYear(newDate.getFullYear() + years);
    return newDate;
}


function minusDays(date, days) {
	let newDate = cloneDate(date);
    newDate.setDate(newDate.getDate() - days);
    return newDate;
}


function minusWeeks(date, weeks) {
	let newDate = cloneDate(date);
    newDate.setDate(newDate.getDate() - (7 * weeks));
    return newDate;
}


function minusMonths(date, months) {
	let newDate = cloneDate(date);
    newDate.setMonth(newDate.getMonth() - months);
    return newDate;
}


function minusYears(date, years) {
	let newDate = cloneDate(date);
    newDate.setFullYear(newDate.getFullYear() - years);
    return newDate;
}


function setDateOfMonth(date, dayOfMonth) {
    // Clone date for modificatoin
    let tmpDate = cloneDate(date);

    if(dayOfMonth >= 29) {
        switch(date.getMonth() + 1) {
            case 1:
            case 3:
            case 5:
            case 7:
            case 8:
            case 10:
            case 12:
                tmpDate.setDate(dayOfMonth);
                return tmpDate;
                break;
            case 4:
            case 6:
            case 9:
            case 11:
                if(dayOfMonth <= 30) {
                    tmpDate.setDate(dayOfMonth)
                    return tmpDate
                } else {
                    tmpDate.setDate(30)
                    return tmpDate
                }
            default:
                if(tmpDate.getFullYear % 4 != 0) {
                    tmpDate.setDate(28)
                    return tmpDate
                } else {
                    tmpDate.setDate(29)
                    return tmpDate
                }
        }
    } else {
        tmpDate.setDate(dayOfMonth)
        return tmpDate
    }
}


function printDate(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}


function findNextDay(date, day) {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

    current_day = date.getDay()
    target_day = days.indexOf(day)

    if(current_day == target_day) {
        return date
    } else {
        if(current_day < target_day) {
            let days_to_add = target_day - current_day
            return addDays(date, days_to_add)
        } else {
            let days_to_add = (6 - current_day) + target_day + 1
            return addDays(date, Math.abs(days_to_add))
        }
    }
}


function findLastDay(date, day) {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    date = setDateOfMonth(date, 31)

    current_day = date.getDay()
    target_day = days.indexOf(day)

    if(current_day == target_day) {
        return date
    } else {
        if(current_day < target_day) {
            let days_to_remove = Math.abs(current_day - (6 - target_day)) + 1
            return minusDays(date, days_to_remove)
        } else {
            let days_to_remove = Math.abs(current_day - target_day)
            return minusDays(date, Math.abs(days_to_remove))
        }
    }
}


function findFirstWorkingDay(date) {
    date = setDateOfMonth(date, 1)
    current_day = date.getDay()

    if(current_day == 0) {
        return addDays(date, 1)
    } else if(current_day == 6) {
        return addDays(date, 2)
    }

    return date
}


function findLastWorkingDay(date) {
    date = setDateOfMonth(date, 31)
    current_day = date.getDay()

    if(current_day == 0) {
        return minusDays(date, 2)
    } else if(current_day == 6) {
        return minusDays(date, 1)
    }

    return date
}


function findEaster(Y) {
    // This code was copied from:
    // https://stackoverflow.com/questions/1284314/easter-date-in-javascript
    let C = Math.floor(Y/100);
    let N = Y - 19*Math.floor(Y/19);
    let K = Math.floor((C - 17)/25);
    let I = C - Math.floor(C/4) - Math.floor((C - K)/3) + 19*N + 15;
    I = I - 30*Math.floor((I/30));
    I = I - Math.floor(I/28)*(1 - Math.floor(I/28)*Math.floor(29/(I + 1))*Math.floor((21 - N)/11));
    let J = Y + Math.floor(Y/4) + I + 2 - C + Math.floor(C/4);
    J = J - 7*Math.floor(J/7);
    let L = I - J;
    let M = 3 + Math.floor((L + 40)/44);
    let D = L + 28 - 31*Math.floor(M/4);

    return new Date(`${Y}-${M}-${D}`);
}


function getPublicHolidays(year) {
    let easter = findEaster(year)
    public_holidays = [
        new Date(`${year + 1}-01-01`), // New Year
        minusDays(easter, 2), // Good Friday
        addDays(easter, 1), // Easter Monday
        findNextDay(new Date(`${year}-05-01`), 'MONDAY'), // May Day
        findLastDay(new Date(`${year}-05-01`), 'MONDAY'), // Spring bank holiday
        findLastDay(new Date(`${year}-08-01`), 'MONDAY'), // sUMMER BANK HOLIDAY
        new Date(`${year}-12-25`), // Christmas Day
        new Date(`${year}-12-26`) // Boxing day
    ];
    return public_holidays
}


function isUkPublicHoliday(date) {
    let year = date.getFullYear()
    let public_holidays = getPublicHolidays(year)

    for(let i = 0; i < public_holidays.length; i++){
        if(public_holidays[i].toLocaleDateString() == date.toLocaleDateString()) {
            return true
        }
    }
    return false
}