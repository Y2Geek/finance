function getResultsOutput(fileContents, dates) {
    let allPayments = getAllPayments(fileContents);
    let output = "";

    // Check if there are any broken payments
    if(allPayments != undefined) {
        if(allPayments[1].length != 0) {
            output += getBPaymentError(allPayments[1]);
        } else {
            let phMsg = getPublicHolMessage()

            if(phMsg != '') {
                setScreenReaderMessage('There is a message regarding public/bank holidays underneath the copy to clipboard message')
                output += phMsg
            } else {
                setScreenReaderMessage()
            }
        }

        // Now get upcoming payments
        if(allPayments[0].length != 0) {
            let upcoming = getUpcomingPayments(dates, allPayments[0]);
            if(upcoming.length != 0) {
                output += getUpcomingOutput(upcoming);
                output += getTotalsOutput(upcoming);
            } else {
                output += "No payments to show within givne dates";
            }
        }
        
        return output;
    }
}

function setScreenReaderMessage(msg = '') {
    let sra = document.getElementById('screenReaderMessage')
    if(msg) {
        sra.innerHTML = msg
    } else {
        sra.innerHTML = '<br>'
    }
}

function getBPaymentError(broken) {
    let msg = "<div id='warning'>Warning:<br><br>The following payments have not been included as they contain errors<br><br>";
    setScreenReaderMessage('There is an error message underneath the copy to clipboard button')

    // Add each payment
    for(let pay of broken) {
        msg += pay + "<br>";
    }

    return `${msg}</div>`;
}

function getPublicHolMessage() {
    let dates = getDates()
    let hols = []
    let upcomingHols = []
    let year1 = dates[0].getFullYear()
    let year2 = dates[1].getFullYear()

    if(year1 == year2) {
        hols = getPublicHolidays(year1)
    } else {
        hols = getPublicHolidays(year1)
        hols = hols.concat(getPublicHolidays(year2))
    }
    console.log(hols.length)
    for(let hol of hols){
        let iso = hol.toISOString()
        if(iso >= dates[0].toISOString()) {
            // Now ensure its before the end date
            if(iso < dates[1].toISOString()) {
                upcomingHols.push(hol)
            }
        }
    }

    if(upcomingHols.length != 0) {
        let msg = '<div id="ph"><h2>Public Holidays</h2>'
        
        // Set message based on length of upcoming hols
        if(upcomingHols.length == 1) {
            msg += 'The following date is a '
        } else {
            msg += 'The following dates are '
        }

        msg += 'bank/public holiday, and may affect direct debits and standing orders: <br><ul>'

        for(let hol of upcomingHols) {
            msg += `<li>${hol.toDateString()}</li>`
        }

        return `${msg}</ul><br></div>`
    }
    return ''
}

function getUpcomingOutput(payments) {
    let output = `<table><tr><th>Day</th><th>Date</th><th>Name</th><th>In</th><th>Out</th><th>Balance</th></tr>`;
    let prevDate = ''

    // get the short string for each payment and add to output
    for(let i = 0; i < payments.length; i++) {
        let pay = payments[i]

        if(prevDate != '') {
            if(pay.date.toLocaleDateString() != prevDate.toLocaleDateString()) {
                let totals = getTotals(payments.slice(0,i))
                output += `<tr><td></td><td></td><td></td><td></td><td></td><td>${totals[2]}</td>`
            }
        }
        output += pay.toRow();
        prevDate = pay.date;
    }

    return `${output}</table>`;
}

function getTotalsOutput(upcoming) {
    let output = "<div id='totals'><h2>Totals</h2><hr>";

    // Create the rest of the output
    let totals = getTotals(upcoming);
    let cats = ['Paid in: ', 'Paid out:', 'Left: ']

    let index = 0

    while(index < cats.length) {
        if(totals[index][0] == '-') {
            totals[index] = addCommas(totals[index].slice(1,))
            totals[index] = `-£${totals[index]}`
        } else {
            totals[index] = addCommas(totals[index])
            totals[index] = `£${totals[index]}`
        }

        output += `${cats[index]} ${totals[index]}<br>`
        index++
    }
    
    return output;
}


/**
 * A function to send lines with specific number of parts to create a payments
 */
function getAllPayments(filecontents) {
    // Reset allPayments
    let allPayments = [];
    let brokenPayments = [];
    
    // Create payments.
    if(filecontents.length != 0) {
        for(let line of filecontents) {
            // If line doesn't begin with a # symbol and is not an empty line
            if(line.startsWith('#') == false && line.length > 0) {
                // split using ; as comma maybe used in larger numbers
                let parts = line.split(';');
                
                // If parts is not between following, move on
                switch(parts.length) {
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                        let pay = createPayment(parts);
                        if(pay != undefined) {
                            allPayments.push(pay);
                        } else {
                            brokenPayments.push(parts.toString());
                        }
                        break;
                    default:
                        brokenPayments.push(parts.toString());
                }
            }
        }
        return [allPayments, brokenPayments];
    }
}

/**
 * Gathers a list of payments that are within the given start and end dates.
 * @returns Array of Payment Objects
 */
function getUpcomingPayments(dates, allPayments) {
    let upcoming = [];

    // update dates of all payments that are not single payments
    for(payment of allPayments) {
        let addPayment = true;
        let isOngoingPayment = payment instanceof OngoingPayment;

        // Check that payment can move forward
        if(isOngoingPayment) {
            // Move payment date ahead and store the returned as may be an array
            // Treat UC Payments slightly differently due to installments
            let returned;
            if(payment instanceof UCPayment) {
                // Send both dates
                returned = payment.moveDateAheadTo(dates);
            } else {
                returned = payment.moveDateAheadTo(dates[0]);
            }

            if(returned == false) {
                addPayment = false;
            } else if(returned != undefined) {
                // UCPayments return an array
                for(let pay of returned) {
                    allPayments.push(pay);
                }
            }
        }
        
        if(addPayment == true) {
            // Now check if payment is within given dates
            let tmpDate = cloneDate(payment.date);
            
            if(tmpDate >= dates[0] && tmpDate < dates[1]) {
                
                upcoming.push(payment);
                if(isOngoingPayment) {
                    // If the payment is ongoing, clone, move date forward and re-add 
                    // as may appear again within dates.
                    let pay = payment.clone();
                    pay.moveDateAhead();
                    allPayments.push(pay);
                }
            }
        }
    }
    // Move Direct Debits ahead (if applicable)
    upcoming = updateDates(upcoming);

    upcoming = upcoming.sort(function(p1, p2){
        return p1.date - p2.date || p1.type.localeCompare(p2.type) || p1.name.localeCompare(p2.name);
    });
    return upcoming;
}


function updateDates(payments) {
    for(let pay of payments) {
        if(pay instanceof OngoingPayment) {
            pay.moveOffWeekendAndPH();
        }
    }
    return payments;
}

/**
 * Gets the total in, out and whats left.
 * Returns a string to display on HTML document.
 * @param {Array} payments 
 * @returns String
 */
function getTotals(payments) {
    let credits = [];
    let debits = [];

    for(let pay of payments) {
        if(pay.type === 'IN' || pay.type == 'CREDIT') {
            credits.push(pay.value);
        }
        else {
            debits.push(pay.value)
        }
    }

    let credit = calculateArray('addition', credits, 2);
    let debit = calculateArray('addition', debits, 2);
    let remaining = toDecimalPlaces(credit - debit);

    return [credit, debit, remaining];
}


function showCopyButton() {
    // Enable copy button
    let copyButton = document.getElementById('copyButton');
    copyButton.style.backgroundColor = 'green';
    copyButton.removeAttribute('disabled');
    if(copyButton.classList.contains('hide')) {
        copyButton.classList.remove('hide');
    }
}


function copyToClipboard(data) {
    navigator.clipboard.writeText(data);
}