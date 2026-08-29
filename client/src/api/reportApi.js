import axios from 'axios';

export const reportApi = {
  downloadReport: async ({ format = 'csv', startDate, endDate, categoryIds, personId }) => {
    const params = new URLSearchParams();
    params.append('format', format);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (categoryIds) {
      const catVal = Array.isArray(categoryIds) ? categoryIds.join(',') : categoryIds;
      if (catVal) params.append('categoryIds', catVal);
    }
    if (personId) params.append('personId', personId);

    const response = await axios.get(`/api/expenses/report?${params.toString()}`, {
      responseType: 'blob',
    });

    // Create a blob URL and trigger download
    const blob = new Blob([response.data], {
      type: format === 'pdf' ? 'application/pdf' : 'text/csv',
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `homeledger-report-${dateStr}.${format.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    return true;
  },
};
