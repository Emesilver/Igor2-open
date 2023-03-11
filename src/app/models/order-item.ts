export class OrderItem {
  constructor(
    // Propriedades locais (apenas na APP)
    public idxItem: number, // Chave local para item do pedido
    public descricao: string,
    public codCliErp: string,
    // Propriedades gerais (existem no siControl)
    public codProErp: string,
    public precoUnit: number,
    public qtd: number,
    public unidade: string,
    public subTotalItem: number,
    public desctoPerc: number,
    public desctoVal: number,
    public comissaoPerc: number,
    public comissaoVal: number,
    public totalItem: number,
    public precoUnitFat: number, // Preco unitario na unidade de faturamento
    public qtdFat: number, // Quantidade na unidade de faturamento
    public unidadeFat: string, // Unidade usada no faturamento
    public codOperacErp: string,
    public pesoUnitario: number,
    public livre1: string,
    public livre2: string,
    public livre3: string
  ) {}
}
