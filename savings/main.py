from account import Account
from payment import Payment
from fileio import read_contents, write_list_to_file
from os import listdir

dir = '/home/paul/.local/share/Cryptomator/mnt/Finance/Savings/'

def get_accounts():
    """ Gets account names from file names """
    accounts = []
    files = listdir(dir)
    files = sorted(files)

    for file in files:
        if file.endswith('.txt'):
            accounts.append(Account(file[:-4]))
    return accounts

def get_payments(account):
    """ Adss payments to the given account object """
    contents = read_contents(f'{dir}{account.get_name()}.txt')
    for line in contents:
        data = line.split('\t')
        if len(data) == 4:
            account.add_payment(create_payment(data))
        else:
            print(line)

def create_payment(data):
    """ Returns a payment object with given info """
    return Payment(data[0], data[1], data[2], int(data[3]))

def add_payment(accounts):
    """ Gets data from user to add payment ot account """
    print('Whcih Account?')
    index = 0
    for acc in accounts:
        print(f'\t{index}\t{acc.get_name()}')
        index += 1
    option = input('Option: ')

    print('Type of payment:')
    type_input = input('\t0) Credit\n\t1) Debit\nOption: ')

    try:
        acc = accounts[int(option)]
        type_input = int(type_input)
        if type_input == 0:
            type = 'Credit'
        elif type_input == 1:
            type = 'Debit'
        else:
            raise IndexError
    except (ValueError, IndexError):
        print('Invalid option')
    else:
        date = input('Date of payment: ')
        name = input('Name of payment: ')
    
        try:
            value = float(input('Value of payment: '))
            value = int((value * 100))
        except ValueError:
            print('Invalid amount')
        else:
            acc.add_payment(Payment(type, date, name, value))

def view_balances(accounts):
    print(f'\n\t{'Name':^10}{'Balance':^10}')
    for acc in accounts:
        print(f'\t{acc.get_name():^10}{acc.get_balance():^10}')
    print('\n')
    
# Inital set up
accounts = get_accounts()
for acc in accounts:
    get_payments(acc)

done = False
while not done:
    # Give user optoins:
    print(
        '\t0) Add Payment\n' +
        '\t1) View Balances\n' +
        '\t2) Exit'
    )
    option = input('Option: ')

    if option == '0':
        add_payment(accounts)
        for acc in accounts:
            all = acc.get_all_payments()
            write_list_to_file(f'{dir}{acc.get_name()}.txt', all)
    elif option == '1':
        view_balances(accounts)
    elif option == '2':
        done = True
    else:
        print('Invalid option')