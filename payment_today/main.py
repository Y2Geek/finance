from datetime import datetime, date
from datemod import add_day
from fileio import read_contents
from os import listdir

def print_list(title, list):
    """ Prints the title, and then the lsit given"""
    index = 0
    print(f'\n\t{title}\n')
    for ele in list:
        msg = f'\t{index:<4}{ele[2]:30}{ele[3]:10}{ele[4]:10}'
        index += 1
        
        if len(ele) >= 7:
            msg = f'{msg}{ele[6]}'

        print(msg)

def calculate(list):
    """ Calculates the values of given selection of list"""
    done = False
    while not done:
        try:
            indexs = input('\tEnter Index numbers to add up: ')

            if indexs != '':
                indexs = indexs.split(' ')
    
                total = 0.0
                for index in indexs:
                    index = int(index)
                    value = float(list[index][4][1:])
                    total += round(value, 2)
                
                return total
            else:
                return 0.0
            
            done = True
        except (IndexError, ValueError):
            print('\n\tTry Again!\n')

# Import files and find txt file
files = listdir()
files = sorted(files)
file_name = ''

if files:
    tmp = []

    for f in files:
        if f.endswith('.txt'):
            tmp.append(f)
    
    files = tmp

# Compare date to see if any bills today
#today = datetime.strptime('2025-08-09', '%Y-%m-%d').date() #
today = datetime.today().date()
tomorrow = add_day(today)
monday = ''

if today.weekday() == 5:
    monday = add_day(tomorrow)

# Hold list for today and tomorrow - and flag for end of file
todays_list = []
tomorrows_list = []
mondays_list = []

if files:
    for f in files:        
        # Split contents in to an array of arrays 
        file_contents = read_contents(f)
        contents = []

        for line in file_contents[1:]:
            data = line.split('\t')
            if len(data) >= 4:
                contents.append(data)

        calc = False
        index = 0

        for ele in contents:
            if ele[1] != '':
                tmp_date = datetime.strptime(ele[1].strip(), '%d/%m/%Y').date()

            if tmp_date > tomorrow and tmp_date != monday:
                break
            elif tmp_date == today:
                todays_list.append(ele)

                if index == 0:
                    calc = True

            elif tmp_date == tomorrow:
                tomorrows_list.append(ele)
            elif tmp_date == monday:
                mondays_list.append(ele)
            
            index += 1
        
        total = 0.0

    if todays_list:
        print_list('Today', todays_list)
        if calc == True:
            print('\n')
            total += calculate(todays_list)


    if tomorrows_list:
        print_list('Tomorrow', tomorrows_list)
        print('\n')
        total += calculate(tomorrows_list)
    
    if mondays_list:
        print_list('Monday', mondays_list)
        print('\n')
        total += calculate(mondays_list)

    if total > 0.0:
        print(f'\n\tTransfer: £{round(total, 2)}')

    # Print message if both lists are empty
    if len(todays_list) == 0 and len(tomorrows_list) == 0:
        print('\n\tNothing to display')

    print('\n')
else:
    print('No files found')
