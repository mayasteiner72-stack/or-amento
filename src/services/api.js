export const API = '/api';

export async function apiList(resource){
  const res = await fetch(`${API}/${resource}`);
  return res.json();
}
export async function apiSave(resource, data, id){
  const res = await fetch(`${API}/${resource}${id ? '/' + id : ''}`, {
    method: id ? 'PUT' : 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(data)
  });
  return res.json();
}
export async function apiDelete(resource, id){
  const res = await fetch(`${API}/${resource}/${id}`, {method:'DELETE'});
  return res.json();
}
