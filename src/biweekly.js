export const teammates=[
  {key:'jerry',name:'Jerry (Chenjia)'},
  {key:'stephanie',name:'Stephanie (Yixin)'},
  {key:'tiffany',name:'Tiffany (Yiling)'},
  {key:'winnie',name:'Winnie (Weini)'}
];
export function newestBiweeklyFirst(entries){
  return [...entries].sort((a,b)=>b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || '') || b.id.localeCompare(a.id));
}
