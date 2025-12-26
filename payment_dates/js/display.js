/**
 * Returns true if the class list of the given element includes 'hide'
 * Returns false otherwise.
 * @param {HTML Element} ele 
 * @returns Boolean
 */
function isIdHidden(ele) {
    return ele.classList.contains('hide');
}


/**
 * Toggle the 'hide' class on and off for given element
 * @param {HTMLElement} ele 
 */
function toggleHide(ele) {
    ele.classList.toggle('hide');
}


/**
 * Toggle the 'hide' class on and off for given element
 * @param {Collection} col
 */
function toggleHideForCollection(col) {
    for(let ele of col) {
        toggleHide(ele);
    }
}


/**
 * Returns an element or a HTML Collection of elements 
 * @param {String} by (get element by)
 * @param {String} name (name to search for)
 * @returns HTML Element/HTML Collection
 */
function getElement(by, name) {
    switch(by) {
        case 'id':
            return document.getElementById(name);
        case 'name':
            return document.getElementsByName(name);
        case 'class':
            return document.getElementsByClassName(name);
        case 'tag':
            return document.getElementsByTagName(name);
    }
}


/**
 * Toggle the 'hide' class for an element with given ID
 * @param {string} ele 
 */
function showHideID(name) {
    // Get element by ID
    let ele = getElement('id', name);

    // Now set value
    toggleHide(ele);
}


/**
 * Toggle the 'hide' class for an element with given name
 * @param {string} ele 
 */
function showHideName(name) {
    // Get element by ID
    let ele = getElement('name', name);

    // Now set value
    toggleHide(ele);
}


/**
 * Toggle the 'hide' class for each element of a given class
 * @param {string} ele 
 */
function showHideClass(name) {
    // Get collection of elements
    let elements = getElement('class', name);
    toggleHideForCollection(elements);
}


/**
 * Toggle the 'hide' class for each element of a given tag
 * @param {string} name 
 */
function showHideTag(name) {
    // Get collection of elements
    let elements = getElement('tag', name);
    toggleHideForCollection(elements);
}


