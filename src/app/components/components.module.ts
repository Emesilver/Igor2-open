import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectCompanyComponent } from './select-company/select-company.component';
import { ToolbarToolsComponent } from './toolbar-tools/toolbar-tools.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [
    SelectCompanyComponent,
    ToolbarToolsComponent
  ],
  imports: [
    CommonModule,
    IonicModule.forRoot(),
  ],
  exports: [
    SelectCompanyComponent,
    ToolbarToolsComponent
  ]
})
export class ComponentsModule { }
