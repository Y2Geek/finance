let fileContents;

/**
 * A function to load all the contents from the uploaded file.
 * @param {Blob} f f 
 */
function getFileContents(f) {
    let fr = new FileReader();
    fr.onload = function(e) {
        fileContents = e.target.result;
        fileContents = fileContents.toString();
        fileContents = fileContents.split('\n');
    };
    fr.readAsText(f[0]);
}

/**
 * Converts data into a Payment, OngoingPayment or LimitedPayment object.
 * @param {Array} data 
 * @returns Payment Object
 */
function createPayment(data) {
    // Have data validated before creation
    if(validatePaymentData(data)) {
        data[0] = data[0].toUpperCase()

        // Remove comma if included
        while(data[3].includes(',')) {
            data[3] = data[3].replace(',', '')
        }
        
        switch(data.length) {
            case 4:
                return new Payment(data[0], data[1], data[2], data[3]);
            case 5:
            case 6:
            case 7:
                data[4] = data[4].toUpperCase()
                
                if(data.length == 5) {
                    return new UCPayment(data[0], data[1], data[2], data[3], data[4]);
                }
                
                if(data[5].toLowerCase() == 'true') {
                    data[5] = true
                } else {
                    data[5] = false
                }

                if(data.length == 6) {
                    return new OngoingPayment(data[0], data[1], data[2], data[3], data[4], data[5]);
                }
                
                return new LimitedPayment(data[0], data[1], data[2], data[3], data[4], data[5], data[6]);
            default:
                return;
        }
    }
}

/**
 * Copies the data from the element with the given ID to the clipboard
 * Also gives an alert to inform the user.
 * @param {string} id 
 */
function copyOutput(id) {
    let content = document.getElementById(id).innerText;

    copyToClipboard(content);

    // Let the user know the data has been copied to their devices clipboard.
    alert('Copied to clipboard');
    content;
}

function showCopyButton() {
    let btn = document.getElementById('copyButton');

    if(btn.classList.contains('hide')) {
        btn.classList.remove('hide');
    }
    btn;
}


function addCommas(val) {
    switch(val.length) {
        case 10:
            val = `${val.slice(0, val.length - 9)},${val.slice(val.length - 9,)}`
        case 7:
            return `${val.slice(0, val.length - 6)},${val.slice(val.length - 6,)}`
        default:
            return `${val}`
    }
}


/**
 * Gets the start and end date from the Results page
 * @returns Array of Date objects
 */
function getDates() {
    let dates = [];
    
    // Start Date 
    dates[0] = getElement('name', 'startDate');
    dates[0] = new Date(dates[0][0].value + " 00:00:00");
    
    // End Date
    dates[1] = getElement('name', 'endDate');
    dates[1] = new Date(dates[1][0].value + " 00:00:00");

    if(dates[1] < dates[0]) {
        return [];
    } else {
        return dates;
    }
}

/**
 * A function to monitor the dates, if dates are not valid, the button is disabled.
 */
function resultsGoButtonStatus() {
    let dates = getDates();
    let goButton = getElement('id', 'goButton');

    if(dates[0] < dates[1]) {
            goButton.removeAttribute('disabled');
            goButton.style.background = 'green';
    }
    else {
        goButton.setAttribute('disabled', true);
        goButton.style.background = 'grey';
    }
}

/**
 * THe coordinating function for the results page
 */
function outputResults() {
    let output;
    if(fileContents != undefined) {
        if(fileContents.length != 0) {
            output = getResultsOutput(fileContents, getDates());
            showCopyButton();
        } else {
            output = 'The file provided has no data that can be used to create payments.'
        }
    } else {
        output = 'No file was uploaded'
    }

    document.getElementById('resultsOutput').innerHTML = output;
    
    // Clear variable as no longer needed.
    output;
}