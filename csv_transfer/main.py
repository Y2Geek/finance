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
			data = line.split('\t')
			if ((len(data) >= 4 and len(data) <= 6) or
			(len(data) == 1 and data[0].startswith('£')) or
			len(data) == 1 and data[0].startswith('Left:')):
				# Only keep usable data
				content_lists.append(data)
	
	return content_lists

def update_value(entry, index):
	""" Set amount_in and amouint_out to the same value"""
	if entry[3] == '':
		entry[3] = f'=e{index}'
	elif entry[4] == '':
		entry[4] = f'=d{index}'
	
	entry[5] = ''

	return entry

def update_formula(formula):
	""" Updates the current formula for complete payments """
	# Split formula at the ':'
	tmp = formula.split(':')
	# get the numbers only
	tmp1 = tmp[1][1:-1]
	# Return new formula
	return f'{tmp[0]}:{tmp[1][0]}{int(tmp1) + 1})'

def get_formula(end, if_state = False):
	''' Returns a formula to subtract the D colum from the E colum '''
	formula = f'=sum(d3:d{end})-sum(e3:e{end})'

	if if_state:
		formula = f'=if({formula[1:]} < 0.00, " ", {formula[1:]})'
	
	return formula

def create_row(day='', date='', name='', amount_in='', amount_out='', done='X', notes=''):
	""" Returns a list with given args as elements """
	if amount_in.startswith('£'):
		amount_in = amount_in[1:]
	elif amount_out.startswith('£'):
		amount_out = amount_out[1:]
	
	return [day, date, name, amount_in, amount_out, done, notes]

def create_comp_row(day, date, name, amount_in = '', amount_out = ''):
	""" Create new row with given data, adding -Complete to name """
	return create_row(day, date, f"{name}-(Complete)", amount_in, amount_out)

def create_savings_row(day, date, amount=0.0):
	""" Returns a list with given args and empty elements for rest of row """
	return create_row(day=day, date=date, name="Savings", amount_out=amount)

def create_total_row(end, total='', date=''):
	""" Returns a list with formula and est_total. blank elements for rest of row """
	if total.startswith('Left: '):
		total = total[6:]
	
	if total.startswith('-'):
		total = f'{total[0]}{total[2:]}'
		print(f'\tBalance warning {date} {total}')
	else:
		total = total[1:]
	return create_row(done=get_formula(end), notes=total)

def get_end_rows(previous, end, if_state):
	""" Creates the savings, and total row """
	rows = []
	rows.append(create_savings_row(previous[0], previous[1], get_formula(end, if_state)))
	rows.append(create_total_row(end + 1))

	return rows

def get_output_for_csv(data):
	""" Returns a list of content to be added to CSV file """
	# Create list and add header 
	new_contents = [create_row(*file_contents[0][0:5], 'Done', 'Notes'),[]]
	previous_entry = ''

	# Now create rest of rows
	index = 1
	while index < len(data):
		current = data[index]
		line_len = len(current)
		row = ''

		if line_len == 4 or line_len == 5:
			current_name = current[2].split(' ')
			row = create_row(*current)

			# We need previous entry to have something, as used for comparison
			if previous_entry == '':
				new_contents.append(row)
			else:
				previous_name = previous_entry[2].split(' ')

				# Lets see if the names start the same
				if current_name[0] not in ignore_list:
					if previous_name[0].startswith(current_name[0]) and 'Complete' not in previous_name[0]:
						update_value(new_contents[-1], len(new_contents))
						new_contents.append(update_value(row, len(new_contents) + 1))

						# Check if payment in or payment out
						if current[3] == '':
							new_contents.append(create_comp_row(row[0], row[1], current_name[0], amount_out=f'=sum(d{len(new_contents) - 1}:d{len(new_contents)})'))
						else:
							new_contents.append(create_comp_row(row[0], row[1], current_name[0], amount_in=f'=sum(e{len(new_contents) - 1}:e{len(new_contents)})'))
					elif previous_name[0].startswith(current_name[0]) and 'Complete' in previous_name[0]:
						type = ''

						if current[3] == '':
							type = 'OUT'
						else:
							type = 'IN'
						
						new_contents.insert(-1, update_value(row, len(new_contents)))
						
						# Now time to modify the formula
						tmp = ''

						if type == 'IN':
							# get current formula of complete payment
							tmp = new_contents[-1][3]
							
							# Replace formula
							new_contents[-1][3] = update_formula(tmp)
						else:
							# get current formula of complete payment
							tmp = new_contents[-1][4]
							
							# Replace formula
							new_contents[-1][4] = update_formula(tmp)

					else:
						new_contents.append(row)
				else:
					# In ignore list
					new_contents.append(row)
		elif line_len == 1:
			# Remove testing 
			# current[0] = ' '
			row = create_total_row(len(new_contents), current[0], new_contents[-1][1])
			new_contents.append(row)
			
		previous_entry = new_contents[-1]
		index += 1
	
	# Add final rows (withdrawn)
	# new_contents += get_end_rows(new_contents[-1], len(new_contents), get_formula(len(new_contents), True))

	return new_contents

def create_csv(file, data):
	""" Creates a csv file with an ods extension """
	file_name = f'{file[:-4]}.ods'
	with open(file_name, 'w') as csv_file:
		writer = csv.writer(csv_file)
		for line in data:
			writer.writerow(line)

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
