function getResultsOutput(fileContents, dates) {
    let allPayments = getAllPayments(fileContents);
    let output = "";

    // Check if there are any broken payments
    if(allPayments != undefined) {
        if(allPayments[1].length != 0) {
            output += getBPaymentError(allPayments[1]);
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

function getBPaymentError(broken) {
    let msg = "<div id='warning'>Warning:<br><br>The following payments have not been included as they contain errors<br><br>";

    // Add each payment
    for(let pay of broken) {
        msg += pay + "<br>";
    }

    return `${msg}</div>`;
}

function getUpcomingOutput(payments,) {
    let output = `<table><tr><th>Day</th><th>Date</th><th>Name</th><th>In</th><th>Out</th></tr>`;

    // get the short string for each payment and add to output
    for(let pay of payments) {
        output += getPayInfo(pay);
    }

    return `${output}</table>`;
}

function getTotalsOutput(upcoming) {
    let output = "<div id='totals'><h2>Totals</h2><hr>";

    // Create the rest of the output
    let totals = getTotals(upcoming);
    output += `Paid in: £${totals[0]}<br>`;
    output += `Paid out: £${totals[1]}<br>`;
    output += `Left: £${totals[2]}</div>`;
    
    return output;
}

function getPayInfo(pay) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let value;
    let output = "";
    if(pay.type == 'IN') {
        // Add blank for extra td
        value = [pay.value,''];
    } else {
        value = ['', pay.value];
    }
    let date = pay.date;
    let info = [days[pay.date.getDay()],
                pay.date.toLocaleDateString(),
                pay.name,
                value[0],
                value[1]];
    
    for(let i = 0; i < info.length; i++) {
        output += `<td>${info[i]}</td>`;
    }

    return `${output}</tr>`;
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
                        // Set boolean for Direct Debit flag
                        if(parts.length >= 6) {
                            if(parts[5] == 'true') {
                                parts[5] = true;
                            } else if(parts[5] == 'false') {
                                parts[5] = false;
                            } else {
                                console.log('Failed autoPayment');
                            }
                        }

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
            pay.moveOffWeekend();
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
        if(pay.type === 'IN') {
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