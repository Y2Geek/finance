from fileio import read_contents, write_list_to_file
from datemod import add_month
from datetime import date, datetime

""" A Script to clean out old payments from Payments.txt """

def get_date(date):
    """ Returns a date object for given date """
    d = ''
    try:
        d = datetime.strptime(date.strip(), '%Y-%m-%d').date()
        return d
    except ValueError:
        print(f'ERROR: {d}')

# Path to payments file
file_path = '/home/paul/.local/share/Cryptomator/mnt/Finance/Payments.txt'

# Get todays date 
today = datetime.today().date()

# Get file contents
file_contents = read_contents(file_path)

# Only continue if file contents exist
if file_contents:
    print(f'\n***** Checking for payments before {today} *****\n')

    # Split into keep and remove lists
    keep = []
    remove = []

    for line in file_contents:
        data = line.split(';')

        if len(data) == 4:
            if today > get_date(data[1]):
                remove.append(line)
            else: 
                keep.append(line)
        elif len(data) == 7:
            if today > get_date(data[6]):
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

        if answer.upper() == 'Y':
            write_list_to_file(file_path, keep)
            print('\n\tFile Cleaned\n')
        else:
            print('\n\tNothing Changed\n')
    else:
        print('\tNothing to remove yet\n')