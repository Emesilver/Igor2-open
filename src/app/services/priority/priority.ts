import { Injectable } from '@angular/core';
import { AppState } from 'src/app/app.global';

@Injectable({
    providedIn: 'root'
})
export class PriorityProvider {
    rows: Array<any>;
    codRepErp: string;
    codCliErp: string;
    codProErp: string;
    constructor(
        private global: AppState,
    ) {
    }

    getByPriority(rows, codCliErp: string, codProErp: string) {
        this.rows = rows;
        this.codRepErp = this.global.getProperty('codRepErp')
        this.codCliErp = codCliErp;
        this.codProErp = codProErp;
        return this.getByFirstLevel();
    }

    /**
     * em primeiro lugar tenta buscar o registro levando em consideracao
     * todos os campos.
     */
    getByFirstLevel() {
        const row = this.rows.find(r => {
            return r.codRepErp === this.codRepErp
                && r.codCliErp === this.codCliErp
                && r.codProErp === this.codProErp;
        });
        return (row ? row : this.getBySecondLevel());
    }

    /**
     * a segunda busca vai desconsiderar o codigo do produto.
     */
    getBySecondLevel() {
        const row = this.rows.find(r => {
            return r.codRepErp === this.codRepErp
                && r.codCliErp === this.codCliErp
                && r.codProErp === '';
        });
        return (row ? row : this.getByThirdLevel());
    }

    /**
     * na terceira tentativa, vai ignorar o codigo do cliente.
     */
    getByThirdLevel() {
        const row = this.rows.find(r => {
            return r.codRepErp === this.codRepErp
                && r.codProErp === this.codProErp
                && r.codCliErp === '';
        });
        return (row ? row : this.getByForthLevel());
    }

    /**
     * vai tenter achar o registro apenas pelo codigo do representante
     */
    getByForthLevel() {
        const row = this.rows.find(r => {
            return r.codRepErp === this.codRepErp
                && r.codProErp === ''
                && r.codCliErp === '';
        });
        return (row ? row : this.getByFifthLevel());
    }

    /**
     * ignora apenas o codigo do representante
     */
    getByFifthLevel() {
        const row = this.rows.find(r => {
            return r.codCliErp === this.codCliErp
                && r.codProErp === this.codProErp
                && r.codRepErp === '';
        });
        return (row ? row : this.getBySixthLevel());
    }

    /**
     * vai considerar apenas o codigo do cliente
     */
    getBySixthLevel() {
        const row = this.rows.find(r => {
            return r.codCliErp === this.codCliErp
                && r.codProErp === ''
                && r.codRepErp === '';
        });
        return (row ? row : this.getBySeventhLevel());
    }

    /**
     * vai considerar apenas o codigo do produto
     */
    getBySeventhLevel() {
        const row = this.rows.find(r => {
            return r.codProErp === this.codProErp
                && r.codCliErp === ''
                && r.codRepErp === '';
        });
        return (row ? row : this.getDefault());
    }

    /**
     * vai buscar o registro com tudo em branco, registro default
     */
    getDefault() {
        const row = this.rows.find(r => {
            return r.codProErp === ''
                && r.codCliErp === ''
                && r.codRepErp === '';
        });
        return row;
    }
}
