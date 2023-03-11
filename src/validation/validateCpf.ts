export function isValidCpf(cpf: string) {
  if (!cpf) return;
  cpf = cpf.replace(/[^0-9]/g, '');
  let numeros: string;
  let digitos: string;
  let digitos_iguais;
  digitos_iguais = 1;
  if (cpf.length < 11) return false;
  for (let i = 0; i < cpf.length - 1; i++) {
    if (cpf.charAt(i) != cpf.charAt(i + 1)) {
      digitos_iguais = 0;
      break;
    }
  }
  if (!digitos_iguais) {
    numeros = cpf.substring(0, 9);
    digitos = cpf.substring(9);
    let soma = 0;
    for (let i = 10; i > 1; i--) {
      soma += Number(numeros.charAt(10 - i)) * i;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== Number(digitos.charAt(0))) {
      return false;
    }
    numeros = cpf.substring(0, 10);
    soma = 0;
    for (let i = 11; i > 1; i--) {
      soma += Number(numeros.charAt(11 - i)) * i;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== Number(digitos.charAt(1))) {
      return false;
    }
    return true;
  }
  return false;
}
