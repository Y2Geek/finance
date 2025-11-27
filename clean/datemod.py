from datetime import datetime, date

def add_day(date):
    """ Adds a day to given date """
    tmp = date

    try:
        tmp = tmp.replace(day=tmp.day + 1)
    except (ValueError):
        # Error most likely due to end of month
        tmp = tmp.replace(day=1)
        # Send to add_month to cope with end of year
        tmp = add_month(tmp)
    
    return tmp

def add_week(date):
    """ Adds a week to given date """
    tmp = date

    try:
        tmp = tmp.replace(day=tmp.day + 7)
    except (ValueError):
        i = 0
        while i < 7:
            tmp = add_day(tmp)
            i += 1

    return tmp
    
def add_month(date):
    """ Adds month """
    tmp = date
    
    # If month is December, move year ahead
    if tmp.month == 12:
        tmp = tmp.replace(year=tmp.year + 1) 
        tmp = tmp.replace(month=1)
        return tmp
    
    try:
        tmp = tmp.replace(month=tmp.month + 1)
    except (ValueError):
        if tmp.month + 1 == 2:
            if tmp.year % 4 == 0:
                # Leap year
                tmp = tmp.replace(day=29)
            else:
                tmp = tmp.replace(day=28)
        else:
            # Most likely a 30 day month
            tmp = tmp.replace(day=30)
        
        # Add the month
        tmp = tmp.replace(month=tmp.month + 1)
    
    return tmp

