"""A collection of functions to read and write text files"""

def clear_file(file_path):
    """Deletes all content from a file"""
    write_to_file(file_path)


def read_contents(file_path):
    """
    Returns the contents of a file, with each line stripped
    Returns None if file was not found
    """
    try:
        with open(file_path) as file_object:
            lines = file_object.readlines()
    except FileNotFoundError:
        return None
    else:
        contents = []
        for line in lines:
            contents.append(line.strip())
        
        return contents


def write_to_file(file_path, contents, write_option='w'):
    """Writes given contents to given file"""
    with open(file_path, write_option) as file_object:
        file_object.write(f"{contents}\n")

def write_list_to_file(file_path, contents):
    """Writes new contents to file from list"""
    
    if len(contents) > 0:
        # WRite first line then append the rest
        write_to_file(file_path, contents[0])
        append_list(file_path, contents[1:])

def append(file_path, contents):
    """Appends contents to given file"""
    write_to_file(file_path, contents, 'a')

def append_list(file_path, contents):
    """Appends given list to given file"""
    for line in contents:
        append(file_path, line)
