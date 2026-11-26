export const fileCategories = ['All', 'Performance & Benchmarks', 'FPGA Resources & Integration', 'Demos & Videos', 'ECE496 Deliverables', 'Archive', 'Other'];
export function fileCategory(file) {
  if (/historical|superseded/i.test(`${file.title} ${file.status}`)) return 'Archive';
  if (fileCategories.includes(file.category) && file.category !== 'All') return file.category;
  const text = `${file.id} ${file.title} ${file.url}`;
  if (/\.mp4|video|demo/i.test(text)) return 'Demos & Videos';
  if (/proposal|capstone|poster|presentation|submission/i.test(text)) return 'ECE496 Deliverables';
  if (/resource|quartus|placement|integration|operation map/i.test(text)) return 'FPGA Resources & Integration';
  if (/timing|latency|throughput|accuracy|baseline|softmax|layernorm|benchmark/i.test(text)) return 'Performance & Benchmarks';
  return 'Other';
}
export function filterFiles(files, category = 'All') {
  return category === 'All' ? files : files.filter(file => fileCategory(file) === category);
}
