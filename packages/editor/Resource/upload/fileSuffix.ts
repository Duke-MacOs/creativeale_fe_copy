export default function getFileSuffix(filename: string) {
  return filename.split('.').pop()?.toLowerCase();
}
