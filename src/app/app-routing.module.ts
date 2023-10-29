import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

const routes: Routes = [
  {
    path: 'sand-box',
    title: '測試區',
    loadComponent: () =>
      import('./pages/sand-box/sand-box.component').then(
        (mod) => mod.SandBoxComponent
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes), HttpClientModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}
