import {validateUpdate} from './member-publishing.js';

export const updateCategories = ['Result','Issue','Decision','General'];
export function prepareProjectUpdate(input, memberIds, id, createdAt) {
  if (!updateCategories.includes(input.category)) throw new Error('Choose an update category.');
  if ((input.measurement || '').length > 200 || (input.context || '').length > 5000) throw new Error('Keep the result under 200 characters and context under 5,000 characters.');
  return {...validateUpdate(input,memberIds),id,createdAt,scope:'project',category:input.category,measurement:(input.measurement || '').trim(),context:(input.context || '').trim()};
}
