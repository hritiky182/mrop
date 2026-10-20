/**
 * Escapes a cell value for CSV output
 */
function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '""';
  }
  const stringVal = String(value);
  // If the cell contains quotes, commas, or newlines, wrap in quotes and escape internal quotes
  if (stringVal.includes('"') || stringVal.includes(',') || stringVal.includes('\n') || stringVal.includes('\r')) {
    return `"${stringVal.replace(/"/g, '""')}"`;
  }
  return `"${stringVal}"`;
}

/**
 * Exports data to CSV and triggers a client-side download
 */
export function exportToCsv<T extends Record<string, unknown>>(
  filename: string,
  data: T[],
  columnMap: { key: keyof T; header: string }[]
): void {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  // Create Header row
  const headers = columnMap.map((col) => escapeCsvCell(col.header)).join(',');

  // Create Data rows
  const rows = data.map((item) => {
    return columnMap
      .map((col) => {
        const val = item[col.key];
        return escapeCsvCell(val);
      })
      .join(',');
  });

  const csvContent = [headers, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace(/\.csv$/, '')}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
