class Payment():
    """ Simple representation of a payment """
    def __init__(self, type, date, name, value):
        """ Initalize a new Payment object """
        self.type = type
        self.date = date
        self.name = name
        self.value = value
    def __lt__(self, other):
        if self.get_date() < other.get_date():
            return True
        return False
    def get_type(self):
        """ Returns the type Credit/Denot """
        return self.type
    def get_date(self):
        return self.date
    def get_value(self):
        """ Returns the value of a payment """
        return self.value
    def to_string(self):
        return f'{self.type}\t{self.date}\t{self.name}\t{self.value}'