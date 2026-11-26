export const fileCategories = ['All', 'Matmul', 'Nonlinear Units', 'MNN', 'Camera Integration', 'ECE496 Deliverables', 'Other'];
export function fileCategory(file) {
  if (fileCategories.includes(file.category) && file.category !== 'All') return file.category;
  const text = `${file.id} ${file.title} ${file.url}`;
  if (/softmax|layernorm|gelu|nonlinear/i.test(text)) return 'Nonlinear Units';
  if (/camera|live.demo|live.classification|\.mp4/i.test(text)) return 'Camera Integration';
  if (/matmul|systolic|cpu-baseline|quartus-resource-utilization/i.test(text)) return 'Matmul';
  if (/mnn|tinyvit|tiny-vit/i.test(text) && !/poster|presentation/i.test(text)) return 'MNN';
  if (/proposal|capstone|poster|presentation|submission/i.test(text)) return 'ECE496 Deliverables';
  return 'Other';
}
export function filterFiles(files, category = 'All') {
  return category === 'All' ? files : files.filter(file => fileCategory(file) === category);
}

export function isArchived(file) {
  return typeof file.archived === 'boolean' ? file.archived : /historical|superseded/i.test(`${file.title} ${file.status}`);
}
export function visibleFiles(files, category, archived = false) {
  return filterFiles(files, category).filter(file => isArchived(file) === archived);
}
