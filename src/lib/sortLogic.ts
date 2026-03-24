export function sortFilesNumerically(files: File[]): File[] {
  return [...files].sort((a, b) => {
    return a.name.localeCompare(b.name, undefined, {
      numeric: true,
      sensitivity: 'base'
    });
  });
}
