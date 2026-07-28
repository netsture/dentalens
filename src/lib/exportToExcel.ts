/** Build and download an Excel-compatible .xls file (SpreadsheetML). */
export function exportToExcel(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
  sheetName = "Sheet1"
) {
  const escapeXml = (value: string | number) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const headerRow = `<Row>${headers
    .map((h) => `<Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`)
    .join("")}</Row>`;

  const dataRows = rows
    .map(
      (row) =>
        `<Row>${row
          .map((cell) => {
            const text = String(cell ?? "");
            const isNumber = text !== "" && !Number.isNaN(Number(text)) && /^-?\d+(\.\d+)?$/.test(text);
            return `<Cell><Data ss:Type="${isNumber ? "Number" : "String"}">${escapeXml(text)}</Data></Cell>`;
          })
          .join("")}</Row>`
    )
    .join("");

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="${escapeXml(sheetName)}">
  <Table>
   ${headerRow}
   ${dataRows}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeName = filename.endsWith(".xls") ? filename : `${filename}.xls`;
  link.href = url;
  link.download = safeName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
