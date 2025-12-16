from account import Account
from payment import Payment
from fileio import read_contents, write_list_to_file
from datetime import date
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


def get_sub_account(acc):
    """ Returns the name after the closing bracket"""
    return acc.get_name()[acc.get_name().index(')') + 2:]


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
    print(f'\n\t{'Index':^10}{'Name':^30}{'Balance':^10}\n')
    i = 0
    for acc in accounts:
        print(f'\t{i:^10}{acc.get_name():<30}{acc.get_balance():>10}')
        i += 1
    print('\n')


def add_multi_accounts(indexes, payment):
    """ Adds the given payment to each account at given index """
    indexes = indexes.split(' ')

    for i in indexes:
        acc = accounts[int(i)]
        parant = acc.get_name()[:acc.get_name().index(')') + 1]
        parant_index = ''

        index = 0
        for a in accounts:
            if a.get_name() == parant:
                parant_index = index
            index += 1

        add_to_account(accounts[int(i)], payment)
        
        # If index is not the same as parent add to parent too 
        if int(i) != parant_index:
            add_to_account(accounts[parant_index], Payment(payment.get_type(), payment.get_date(), f'{payment.get_name()} ({get_sub_account(acc)})', payment.get_value()))


get_accounts()
done = False
while not done:
    # Give user optoins:
    print(
        '\t0) Add Payment\n' +
        '\t1) Penny Challenge\n' # 
        '\t2) Xmas\n' +
        '\t3) Transfer\n' +
        '\t4) View Balances\n' +
        '\t5) Exit'
    )
    option = input('Option: ')

    if option == '0':
        pay = create_payment()
        list_accounts()
        accs = input('Which accounts would you like to add this payment to? ')
        add_multi_accounts(accs, pay)
    elif option == '1':
        i = 0
        for acc in accounts:
            if 'Penny' in acc.get_name():
                d = date.today()
                d = f'{d.year}-{d.month}-{d.day}'
                value = input('\tValue: ')
                pay = create_payment(['Credit', d, 'Credit', float(value) * 100])
                add_multi_accounts(str(i), pay)
            i += 1
    elif option == '2':
        pay = create_payment()
        # Christmas is double the amount
        double = Payment(pay.get_type(), pay.get_date(), 'Weekly Credit (Christmas)', pay.get_value() * 2)
        
        # Find relavent accounts
        accs = []
        christmas_index = ''
        
        index = 0
        for acc in accounts:
            acc = acc.get_name()
            if 'Christmas' in acc:
                christmas_index = index
            elif 'Xmas' in acc:
                accs.append(index)
            
            index += 1
        
        tmp = ''
        for acc in accs:
            tmp += str(acc) + ' '

        add_multi_accounts(f'{christmas_index}', double)
        add_multi_accounts(tmp.strip(), pay)
    elif option == '3':
        list_accounts()
        acc1 = input('Which account are we transfering from? ')
        list_accounts()
        acc2 = input('Which account are we transfering to? ')

        if acc1 != acc2:
            date = input('Date: ')
            name = input('Name for transfer: ')
            amount = input('Value: ')
            amount = float(amount)
            amount = int(amount * 100)

            add_multi_accounts(acc1, Payment('Debit', date, f'{name} ({get_sub_account(accounts[int(acc2)])})', amount))
            add_multi_accounts(acc2, Payment('Credit', date, f'{name} ({get_sub_account(accounts[int(acc1)])})', amount))
    elif option == '4':
        list_accounts()
    elif option == '5':
        done = True
    else:
        print('Invalid option')