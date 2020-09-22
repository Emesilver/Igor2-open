
export function setMaskTelephone(v) {
  if(!v) return '';
  v = v.replace(/\D/g, '');
  v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
  v = v.length > 14 ?
    v.replace(/(\d)(\d{5})$/, '$1-$2') :
    v.replace(/(\d)(\d{4})$/, '$1-$2');
  return v;
}

export function removeMaskTelephone(v) {
  if(!v) return '';
  return v.replace(/\D/g, '');
}