export const spanEvent = ({ row, $rowIndex, column, data }) => {
  const fields = ["securityGroupName"];
  const cellValue = row[column.property];
  if (cellValue && fields.includes(column.property)) {
    const prevRow = data[$rowIndex - 1];
    let nextRow = data[$rowIndex + 1];
    if (prevRow && prevRow[column.property] === cellValue) {
      return { rowspan: 0, colspan: 0 };
    } else {
      let countRowspan = 1;
      while (nextRow && nextRow[column.property] === cellValue) {
        nextRow = data[++countRowspan + $rowIndex];
      }
      if (countRowspan > 1) {
        return { rowspan: countRowspan, colspan: 1 };
      }
    }
  }
};
