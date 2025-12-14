from account import Account
from payment import Payment
from fileio import read_contents, write_list_to_file
from os import listdir

accounts = []
dir = '/home/paul/.local/share/Cryptomator/mnt/Finance/Savings/'

def get_accounts():
    """ Gets account names from file names """
    files = listdir(dir)
    files = sorted(files)

    for file in files:
        if file.endswith('.txt'):
            accounts.append(Account(file[:-4]))
            get_payments(accounts[-1])


def get_payments(account):
    """ Adss payments to the given account object """
    contents = read_contents(f'{dir}{account.get_name()}.txt')
    for line in contents:
        data = line.split('\t')
        if len(data) == 4:
            pay = create_payment(data)
            account.add_payment(pay)
        else:
            print(line)

def create_payment(data = ''):
    """ Gets data from user to create payment object """
    if not data:
        print('Type of payment:')
        type_input = input('\t0) Credit\n\t1) Debit\nOption: ')

        try:
            type_input = int(type_input)
            if type_input == 0:
                type = 'Credit'
            elif type_input == 1:
                type = 'Debit'
            else:
                raise IndexError
            
            date = input('Date of payment: ')
            name = input('Name of payment: ')

            value = float(input('Value of payment: '))
            value = int((value * 100))

            data = [type, date, name, value]

        except (IndexError):
            print('Invalid option')
        except ValueError:
            print('Invalid Number')

    return Payment(data[0], data[1], data[2], int(data[3]))

def add_to_account(account, payment):
    """ Adds given payment to given account """
    account.add_payment(payment)
    write_list_to_file(f'{dir}{account.get_name()}.txt', account.get_all_payments())

def list_accounts():
    print(f'\n\t{'Index':^10}{'Name':^10}{'Balance':^10}')
    i = 0
    for acc in accounts:
        print(f'\t{i:^10}{acc.get_name():<10}{acc.get_balance():>10}')
        i += 1
    print('\n')

def add_multi_accounts(indexes, payment):
    """ Adds the given payment to each account at given index """
    indexes = indexes.split(' ')

    for i in indexes:
        add_to_account(accounts[int(i)], payment)


get_accounts()
done = False
while not done:
    # Give user optoins:
    print(
        '\t0) Add Payment\n' +
        '\t1) Xmas\n' +
        '\t2) View Balances\n' +
        '\t3) Exit'
    )
    option = input('Option: ')

    if option == '0':
        pay = create_payment()
        list_accounts()
        accs = input('Which accounts would you like to add this payment to? ')
        add_multi_accounts(accs, pay)

    elif option == '1':
        pay = create_payment()
        accs = '5 4 6 4 7 4'
        add_multi_accounts(accs, pay)

    elif option == '2':
        list_accounts()
    elif option == '3':
        done = True
    else:
        print('Invalid option')