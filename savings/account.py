class Account():
    """ A simple representation of a bank account """
    def __init__(self, name):
        """ initialize a new object """
        self.name = name
        self.credits = []
        self.debits = []
    def get_name(self):
        """ Returns the account name """
        return self.name
    def add_payment(self, payment):
        """ Adds payment ot either credit or debit list """
        if payment.get_type() == 'Credit':
            self.credits.append(payment)
        else:
            self.debits.append(payment)
    def get_balance(self):
        """ Returns the balance of the account """
        debit = self.get_total(self.debits)
        credit = self.get_total(self.credits)

        return (credit - debit) / 100
    def get_total(self, ls):
        """ Returns the value of all payments in given list """
        total = 0
        for pay in ls:
            total += pay.get_value()
        return total
    def get_all_payments(self):
        """ Returns both credits and debits """
        all = self.credits + self.debits
        #all.sort()

        all_strings = []

        for pay in sorted(all):
            all_strings.append(pay.to_string())
        return all_strings