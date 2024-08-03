export const downloadFile = (base64: string, name: string) => {
  if (!base64) return;

  const link = document.createElement('a');
  link.href = base64;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
