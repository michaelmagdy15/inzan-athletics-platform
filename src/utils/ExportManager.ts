export class ExportManager {
  /**
   * Converts an array of objects to a CSV string.
   */
  static convertToCSV(data: any[]): string {
    if (!data || !data.length) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => 
      headers.map(header => {
        const val = obj[header];
        if (typeof val === 'string') {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Triggers a browser download for the provided text content as a file.
   */
  static downloadFile(filename: string, content: string, mimeType: string = 'text/csv;charset=utf-8;') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Exports a given dataset as a CSV file.
   */
  static exportDataToCSV(data: any[], filename: string) {
    if (!data || data.length === 0) {
      console.warn("No data to export");
      return;
    }
    const csvContent = this.convertToCSV(data);
    this.downloadFile(`${filename}_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
  }
}
