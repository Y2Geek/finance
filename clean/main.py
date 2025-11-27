from fileio import read_contents, write_list_to_file
from datemod import add_month
from datetime import date, datetime

""" A Script to clean out old payments from Payments.txt """

def get_date(date):
    """ Returns date set to 5, 6, or 7 """
    tmp = date.replace(day=7)

    if tmp.weekday() == 5:
        return tmp.replace(day=6)
    elif tmp.weekday() == 6:
        return tmp.replace(day=5)
    
    return tmp


file_path = '/home/paul/.local/share/Cryptomator/mnt/Finance/Payments.txt'

# Get todays date 
today = datetime.today().date()

# Get 7th of current month and next month
# Move back if on weekend
current_month = get_date(today)
next_month = get_date(add_month(current_month))

if today >= current_month:
    print(f'\n***** Checking for payments before {next_month} *****\n')

    file_contents = read_contents(file_path)

    # Split into keep and remove lists
    keep = []
    remove = []

    for line in file_contents:
        data = line.split(';')

        if len(data) == 4:
            if next_month > datetime.strptime(data[1].strip(), '%Y-%m-%d').date():
                remove.append(line)
            else: 
                keep.append(line)
        elif len(data) == 7:
            if next_month > datetime.strptime(data[6].strip(), '%Y-%m-%d').date():
                remove.append(line)
            else:
                keep.append(line)
        else:
            keep.append(line)

    # Check if user is happy for payments to be removed
    if len(remove) > 0:
        print(' * The following payments will be removed: * \n')

        for line in remove:
            data = line.split(';')
            print(f' * {'\t'.join(data)} * ')

        answer = input(f'\nDelete these {len(remove)} payments? (Y/N):')

        if answer == 'Y':
            write_list_to_file(file_path, keep)
            print('\n\tFile Cleaned\n')
        else:
            print('\n\tNothing Changed\n')
    else:
        print('\tNothing to remove yet\n')
else:
    print('Nothing to do\n')