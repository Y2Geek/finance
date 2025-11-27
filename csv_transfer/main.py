import os
import csv
import fileio

def get_files():
	""" Gets files starting with number 2 and ending in txt """	
	files = []
	
	for file in os.listdir():
		if file.startswith('2') and file.endswith('.txt'):
			files.append(file)
	
	return files

def get_file_content(file):
	""" Returns contents of file with each line split into sections """
	contents = fileio.read_contents(file)
	content_lists = []
	
	if contents != None:
		for line in contents:
			content_lists.append(line.split('\t'))
	
	return content_lists

def update_value(entry, index):
	""" Set amount_in and amouint_out to the same value"""
	if entry[3] == '':
		entry[3] = f'=e{index}'
	else:
		entry[4] = f'=d{index}'
	
	entry[5] = ''

	return entry

def get_formula(end, if_state = False):
	''' Returns a formula to subtract the D colum from the E colum '''
	formula = f'=sum(d3:d{end})-sum(e3:e{end})'

	if if_state:
		formula = f'=if({formula[1:]} < 0.00, " ", {formula[1:]})'
	
	return formula

def create_csv(file, data):
	""" Creates a csv file with an ods extension """
	file_name = f'{file[:-4]}.ods'
	with open(file_name, 'w') as csv_file:
		writer = csv.writer(csv_file)
		for line in data:
			writer.writerow(line)

def create_row(day='', date='', name='', amount_in='', amount_out='', done='X', notes=''):
	""" Returns a list with given args as elements """
	return [day, date, name, amount_in, amount_out, done, notes]

def get_end_rows(previous, end, if_state, amount_in, amount_out):
	""" Creates the savings, and total row """
	rows = []
	rows.append(create_savings_row(previous[0], previous[1], get_formula(end, if_state)))
	rows.append(create_total_row(end + 1, amount_in, amount_out, previous[1]))

	return rows

def create_savings_row(day, date, amount=0.0):
	""" Returns a list with given args and empty elements for rest of row """
	return create_row(day=day, date=date, name="Savings", amount_out=amount)

def create_total_row(end, amount_in, amount_out, date):
	""" Returns a list with formula and est_total. blank elements for rest of row """
	total = round(amount_in - amount_out, 2)

	if total < 0.0:
		print(f'\t\t{date} - BALANCE WARNING! ({total})')

	return create_row(done=get_formula(end), notes=total)

def create_comp_row(day, date, name, amount_in = '', amount_out = ''):
	""" Create new row with given data, adding -Complete to name """
	return create_row(day, date, f"{name}-(Complete)", amount_in, amount_out)

def get_output_for_csv(data):
	""" Returns a list of content to be added to CSV file """
	# Create lis and add header 
	new_contents = [create_row(*file_contents[0], 'Done', 'Notes'),[]]

	# Running totals
	total_in = 0.0
	total_out = 0.0

	index = 1
	while index < len(data):
		current = data[index]
		line_len = len(current)
		previous_entry = data[index - 1]

		# Old expression (kept as backup)
		# line_len == 4 and len(previous_entry) == 5
		
		# Stop if current line length is above 5, or less than  4
		if line_len < 4 or line_len > 5:
			new_contents = new_contents + get_end_rows(previous_entry, len(new_contents), True, total_in, total_out)
			break
		elif data[index][1] != previous_entry[1]:
			if len(new_contents) != 2:
				new_contents.append(create_total_row(len(new_contents), total_in, total_out, previous_entry[1]))

		if line_len == 4:
			total_in += round(float(current[3]), 2)
		else:
			total_out += round(float(current[4]), 2)
		
		# Create row
		row = create_row(*current)

		# Lets see if previous starts with the same name as line
		previous_name = previous_entry[2].split(' ')
		current_name = current[2].split(' ')

		if current_name[0] not in ignore_list and (current[2].startswith(previous_name[0]) and current[1] == previous_entry[1]):
			# Keep track of type of payment for complete 
			type_of_payment = ''

			if row[3] == '':
				type_of_payment = 'OUT'
			else:
				type_of_payment = 'IN'

			if new_contents[-1][2].endswith('(Complete)') == False:
				new_contents[-1] = update_value(new_contents[-1], len(new_contents))
				new_contents.append(update_value(row, len(new_contents) + 1))
				
				formula = f'=sum(d{len(new_contents) - 1}:d{len(new_contents)})'

				if type_of_payment == 'IN':
					new_contents.append(create_comp_row(previous_entry[0], previous_entry[1], previous_name[0], amount_in = formula))
				else:
					new_contents.append(create_comp_row(previous_entry[0], previous_entry[1], previous_name[0], amount_out = formula))

			else:
				index_of_d = formula.find('d')
				end_index = formula.find(':')
				formula = f'=sum({formula[index_of_d:end_index]}:d{len(new_contents)})'
				new_contents.insert(-1, update_value(row, len(new_contents)))
				
				# Update completes formula
				if type_of_payment == 'IN':
					new_contents[-1][3] = formula
				else:
					new_contents[-1][4] = formula
		else:
			new_contents.append(create_row(*data[index]))

		index += 1
	
	return new_contents

files = get_files()

if files:
	ignore_list = fileio.read_contents('ignore.txt')

	for file in files:
		contents = file_contents = get_file_content(file)
		
		if contents:
			data = get_output_for_csv(contents)
			if data:
				create_csv(file, data)
				print('\n\tDone\n')
			else:
				print('ERROR')
else:
	print('\n\tNo files found\n')
