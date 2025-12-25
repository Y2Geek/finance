class Payment {
    _type;
    _date;
    _name;
    _value;

    constructor(type, date, name, value) {
        this._type = type;
        this._date = new Date(date + " 00:00:00");
        this._name = name;
        this._value = value;
    }
    get type() {
        return this._type;
    }
    set type(type) {
        this._type = type;
    }
    get date() {
        return this._date;
    }
    set date(date) {
        this._date = date;
    }
    get name() {
        return this._name;
    }
    set name(name) {
        this._name = name;
    }
    get value() {
        return parseFloat(this._value);
    }
    set value(value) {
        this._value = parseFloat(value);
    }
    toString() {
        let date = `${this._date.getFullYear()}-${this._date.getMonth() + 1}-${this._date.getDate()}`;
        return `${this._type};${date};${this._name};${this._value}`;
    }
}


class OngoingPayment extends Payment {
    _frequency;
    _autoPayment; // Direct Debit or Standing Order

    constructor(type, date, name, value, frequency, autoPayment) {
        super(type, date, name, value);
        this._frequency = frequency;
        this._autoPayment = autoPayment; //Boolean
    }
    get frequency() {
        return this._frequency;
    }
    set frequency(frequency) {
        this._frequency = frequency;
    }
    get autoPayment() {
        return this._autoPayment;
    }
    set autoPayment(arg) {
        this._autoPayment = arg;
    }
    clone() {
        return new OngoingPayment(this._type, this._date.toDateString(), this._name, this._value, this._frequency, this._autoPayment);
    }
    moveDateAheadTo(date) {
        const dayOfMonth = this._date.getDate();

        while(this._date < date) {
            this.moveDateAhead();
        }

        // Make sure day of month matches or the date is set to end of month
        switch(this._frequency) {
            case 'MONTHS':
            case 'YEARS':
            
                if(this._date.getDate() != dayOfMonth) {
                    this._date = setDateOfMonth(this._date, dayOfMonth);
                }
        }
    }
    moveDateAhead() {
        let freq = this._frequency.split('=')
        const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        let tmpDate = addMonths(this._date, 1)

        switch(freq[0]) {
            case 'PENNY-CHALLENGE':
                this._date = addDays(this._date, 1);
                this.value = (this.value + 0.01).toFixed(2);
                break;
            case 'FIRST':
            case 'SECOND':
            case 'THIRD':
            case 'FOURTH':
                let start_at = 0

                switch(freq[0]) {
                    case 'FIRST':
                        start_at = 1
                        break;
                    case 'SECOND':
                        start_at = 8
                        break;
                    case 'THIRD':
                        start_at = 15
                        break;
                    case 'FOURTH':
                        start_at = 22
                }

                tmpDate = setDateOfMonth(tmpDate, start_at)

                if(freq[1] == 'WORKING-DAY') {
                    // Now set date to the last working day (Mon - Fri)
                    if(tmpDate.getDay() == 0) {
                        this.date = addDays(tmpDate, 1)
                    } else if(tmpDate.getDay() == 6) {
                        this.date = addDays(tmpDate, 2)
                    } else {
                        this.date = tmpDate
                    }
                } else {
                    // Now compare days to see if they match
                    let freq_day = days.indexOf(freq[1])
                    let tmp_day = tmpDate.getDay()

                    if (freq_day == tmp_day) {
                        this.date = tmpDate
                    } else {
                        if(tmp_day < freq_day) {
                            let days_to_add = freq_day - tmp_day
                            this.date = addDays(tmpDate, days_to_add)
                        } else {
                            let days_to_add = (6 - tmp_day) + freq_day + 1
                            // console.log(Math.abs(freq_day - tmp_day))
                            this.date = addDays(tmpDate, Math.abs(days_to_add))
                        }
                    }
                }
                break;
            case 'LAST':
                tmpDate = setDateOfMonth(tmpDate, 31)

                if(freq[1] == 'WORKING-DAY') {
                    // Now set date to the last working day (Mon - Fri)
                    if(tmpDate.getDay() == 0) {
                        this.date = minusDays(tmpDate, 2)
                    } else if(tmpDate.getDay() == 6) {
                        this.date = minusDays(tmpDate, 1)
                    } else {
                        this.date = tmpDate
                    }
                } else {
                    // Now compare days to see if they match
                    let freq_day = days.indexOf(freq[1])
                    let tmp_day = tmpDate.getDay()

                    if (freq_day == tmp_day) {
                        this.date = tmpDate
                    } else {
                        if(tmp_day < freq_day) {
                            let days_to_remove = Math.abs(0 - tmp_day) + (6 - freq_day) + 1
                            this.date = minusDays(tmpDate, days_to_remove)
                        } else {
                            let days_to_remove = Math.abs(freq_day - tmp_day)
                            // console.log(Math.abs(freq_day - tmp_day))
                            this.date = minusDays(tmpDate, Math.abs(days_to_remove))
                        }
                    }
                }
                break;
            case 'WEEKDAYS':
                this._date = addDays(this._date, 1);
                if (this._date.getDay() == 6) {
                    // Move away from Saturday
                    this._date = addDays(this._date, 2);
                } else if (this._date.getDay() == 0) {
                    // Move away from Sunday
                    this._date = addDays(this._date, 1);
                }
                break;
            default:
                freq[1] = parseInt(freq[1])
                switch(freq[0]) {
                case 'DAYS':
                    this._date = addDays(this._date, freq[1]);
                    break;
                case 'WEEKS':
                    this._date = addWeeks(this._date, freq[1]);
                    break;
                case 'MONTHS':
                    this._date = addMonths(this._date, freq[1]);
                    break;
                case 'YEARS':
                    this._date = addYears(this._date, freq[1]);
                    break
                default:
                    console.log('Broken: ' + freq);
                }
        }
    }
    moveOffWeekend() {
        // Only move if a direct debit
        if(this.autoPayment == true) {
            if(this.date.getDay() == 0) {
                this._date = addDays(this.date, 1);//.toDateString();
            } else if(this.date.getDay() == 6) {
                this._date = addDays(this.date, 2);//.toDateString();
            }
        }
    }
    toString() {
        return `${super.toString()};${this._frequency};${this._autoPayment}`;
    }
}


class LimitedPayment extends OngoingPayment {
    _endDate;

    constructor(type, date, name, value, frequency, autoPayment, endDate) {
        super(type, date, name, value, frequency, autoPayment);
        this._endDate = new Date(endDate + " 00:00:00");
    }
    get endDate() {
        return this._endDate;
    }
    set endDate(date) {
        this._endDate = date;
    }
    clone() {
        return new LimitedPayment(this._type, this._date.toDateString(), this._name, this._value, this._frequency, this._autoPayment, this._endDate.toDateString());
    }
    moveDateAheadTo(date) {
        // Check if given date is after end date, if so just eturn false;
        if(date > this.endDate) {
            return false;
        }

        // If not move the date forward and check if the 
        // _date is now after endDate. 
        super.moveDateAheadTo(date);
        if(this._date > this.endDate) {
            return false;
        }
    }
    toString() {
        let date = `${this._endDate.getFullYear()}-${this._endDate.getMonth() + 1}-${this._endDate.getDate()}`;
        return `${super.toString()};${date}`;
    }
}


class UCPayment extends OngoingPayment {
    _option;

    constructor(type, date, name, value, option) {
        super(type, date, name, value, 'MONTHS=1', false);
        this._option = option;
    }
    get option() {
        return this._option;
    }
    set option(option) {
        this._option = option;
    }
    /**
     * Override some functions as they don't count for UC Payments
     */
    get frequency() {}
    set frequency(arg) {}
    get autoPayment() {}
    set autoPayment(arg) {}
    clone() {
        return new UCPayment(this._type, this._date.toDateString(), this._name, this._value, this._option);
    }
    createInstallment(date) {
        return new Payment(this._type, date, this._name, this._value);
    }
    getInstallments() {
        let tmpDate = cloneDate(this._date);
        let installments = [];

        switch(this._option) {
            case 'WEEK':
                for(let i = 0; i < 4; i++) {
                    let tmp = this.createInstallment(addWeeks(tmpDate, i).toDateString());
                    installments.push(tmp);
                }
                break;
            case 'FORTNIGHT':
                for(let i = 0; i < 4;) {
                    let tmp = this.createInstallment(addWeeks(tmpDate, i).toDateString());
                    installments.push(tmp);
                    i += 2;
                }
                break;
            case 'MONTH':
                installments.push(this.createInstallment(tmpDate.toDateString()));
                break;
        }
        return installments;
    }
    moveDateAheadTo(date) {
        let installments = [];
        const dayOfMonth = this._date.getDate();

        // Only get installments for UC Payments 1 month or less before the start date
        // Will also collect installments up to end date.
        let tmpDate = minusMonths(date[0], 1);

        do {
            // If date lands on a weekend, move to Friday
            this.moveOffWeekend();

            if(this.date >= tmpDate) {
                installments = installments.concat(this.getInstallments());
            }

            this.moveDateAhead();
            // Put date back to correct day of month
            this.date = setDateOfMonth(this.date, dayOfMonth)
            //this.date.setDate(dayOfMonth);

        } while(this._date < date[1]);
        
        return installments;
    }
    moveOffWeekend() {
        // Change date to Friday if date lands on weekend
        switch(this.date.getDay()) {
            case 0:
                this._date = minusDays(this._date, 2);
                break;
            case 6:
                this._date = minusDays(this._date, 1);
                break;
        }
    }
    toString() {
        // Split Supers toString() into pats, so only needed can be added to return string.
        let strParts = super.toString().split(';');;

        return `${strParts[0]};${strParts[1]};${str[2]};${strParts[3]};${this._option}`;
    }
}
