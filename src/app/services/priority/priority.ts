import { Injectable } from '@angular/core';
import { AppState, Properties } from 'src/app/app.global';

@Injectable({
  providedIn: 'root',
})
export class PriorityProvider {
  rows!: any[];
  codRepErp!: string;
  codCliErp!: string;
  codProErp!: string;
  constructor(private global: AppState) {}

  getByPriority(rows: any[], codCliErp: string, codProErp: string) {
    this.rows = rows;
    this.codRepErp = this.global.getProperty(Properties.COD_REP_ERP) as string;
    this.codCliErp = codCliErp;
    this.codProErp = codProErp;
    return this.getByFirstLevel();
  }

  /**
   * em primeiro lugar tenta buscar o registro levando em consideracao
   * todos os campos.
   */
  private getByFirstLevel() {
    const row = this.rows.find((r) => {
      return (
        r.codRepErp === this.codRepErp &&
        r.codCliErp === this.codCliErp &&
        r.codProErp === this.codProErp
      );
    });
    return row ? row : this.getBySecondLevel();
  }

  /**
   * a segunda busca vai desconsiderar o codigo do produto.
   */
  private getBySecondLevel() {
    const row = this.rows.find((r) => {
      return (
        r.codRepErp === this.codRepErp &&
        r.codCliErp === this.codCliErp &&
        r.codProErp === ''
      );
    });
    return row ? row : this.getByThirdLevel();
  }

  /**
   * na terceira tentativa, vai ignorar o codigo do cliente.
   */
  private getByThirdLevel() {
    const row = this.rows.find((r) => {
      return (
        r.codRepErp === this.codRepErp &&
        r.codProErp === this.codProErp &&
        r.codCliErp === ''
      );
    });
    return row ? row : this.getByForthLevel();
  }

  /**
   * vai tenter achar o registro apenas pelo codigo do representante
   */
  private getByForthLevel() {
    const row = this.rows.find((r) => {
      return (
        r.codRepErp === this.codRepErp &&
        r.codProErp === '' &&
        r.codCliErp === ''
      );
    });
    return row ? row : this.getByFifthLevel();
  }

  /**
   * ignora apenas o codigo do representante
   */
  private getByFifthLevel() {
    const row = this.rows.find((r) => {
      return (
        r.codCliErp === this.codCliErp &&
        r.codProErp === this.codProErp &&
        r.codRepErp === ''
      );
    });
    return row ? row : this.getBySixthLevel();
  }

  /**
   * vai considerar apenas o codigo do cliente
   */
  private getBySixthLevel() {
    const row = this.rows.find((r) => {
      return (
        r.codCliErp === this.codCliErp &&
        r.codProErp === '' &&
        r.codRepErp === ''
      );
    });
    return row ? row : this.getBySeventhLevel();
  }

  /**
   * vai considerar apenas o codigo do produto
   */
  private getBySeventhLevel() {
    const row = this.rows.find((r) => {
      return (
        r.codProErp === this.codProErp &&
        r.codCliErp === '' &&
        r.codRepErp === ''
      );
    });
    return row ? row : this.getDefault();
  }

  /**
   * vai buscar o registro com tudo em branco, registro default
   */
  private getDefault() {
    const row = this.rows.find((r) => {
      return r.codProErp === '' && r.codCliErp === '' && r.codRepErp === '';
    });
    return row;
  }

  /**
   * retorna a lista de rows filtrando por prioridade apenas de 1-representante, 2-cliente
   */
  filterByPriorityRC(rows: any[], codCliErp: string) {
    this.rows = rows;
    this.codRepErp = this.global.getProperty(Properties.COD_REP_ERP) as string;
    this.codCliErp = codCliErp;
    return this.filterByFirstLevelRC();
  }

  /**
   * em primeiro lugar tenta filtrar os registros levando em consideracao
   * todos os campos.
   */
  private filterByFirstLevelRC() {
    const rows = this.rows.filter((r) => {
      return r.codRepErp === this.codRepErp && r.codCliErp === this.codCliErp;
    });
    return rows.length ? rows : this.filterBySecondLevelRC();
  }

  /**
   * segundo: tenta filtrar os registros levando em consideracao
   * apenas o representante.
   */
  private filterBySecondLevelRC() {
    const rows = this.rows.filter((r) => {
      return r.codRepErp === this.codRepErp && r.codCliErp === '';
    });
    return rows.length ? rows : this.filterByThirdLevelRC();
  }
  /**
   * terceiro: tenta filtrar os registros levando em consideracao
   * apenas o cliente.
   */

  private filterByThirdLevelRC() {
    const rows = this.rows.filter((r) => {
      return r.codRepErp === '' && r.codCliErp === this.codCliErp;
    });
    return rows.length ? rows : this.filterDefaultRC();
  }

  /**
   * vai buscar o registro com tudo em branco, registro default
   */
  private filterDefaultRC() {
    const rows = this.rows.filter((r) => {
      return r.codRepErp === '' && r.codCliErp === '';
    });
    return rows;
  }
}
