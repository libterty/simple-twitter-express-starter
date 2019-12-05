/****************  Variables ****************/
const adminPage = document.querySelector('.admin-page');
let lastSortedColumn = null;
let tableName = '';

/****************  Execute ****************/
adminPage.addEventListener('click', function(event) {
  const regExp = /^(thead-row-)\w+/g;
  const elementId = event.target.parentElement.parentElement.id;
  if (regExp.test(elementId)) {
    tableName = elementId.split('-')[2];
  }
});

/****************  Functiions ****************/
function sortTableColumn(columnIndex, type) {
  const { table, tbody, rows } = getElementsOfTable();
  const arrayOfRows = [];

  for (let i = 0; i < rows.length; i++) {
    let cellValue = rows[i].children[columnIndex].innerText;

    if (type === 'number') {
      cellValue = Number(cellValue);
    } else {
      cellValue = cellValue
        .replace(/\W+/g, '')
        .substring(0, 8)
        .toUpperCase();
    }

    arrayOfRows[i] = {
      value: cellValue,
      row: rows[i]
    };
  }

  if (lastSortedColumn === columnIndex) {
    arrayOfRows.reverse();
  } else {
    lastSortedColumn = columnIndex;
    arrayOfRows.sort(compareNumbers);
  }

  replaceTable(arrayOfRows);
}

function replaceTable(arr) {
  const { table, tbody } = getElementsOfTable();
  for (let i = 0; i < arr.length; i++) {
    tbody.appendChild(arr[i].row);
  }
}

function compareNumbers(a, b) {
  return a.value === b.value ? 0 : a.value > b.value ? -1 : 1;
}

function getElementsOfTable() {
  const table = document.querySelector(`#table-${tableName}`);
  const tbody = table.getElementsByTagName('tbody')[0];
  const rows = tbody.getElementsByTagName('tr');
  return { table, tbody, rows };
}
