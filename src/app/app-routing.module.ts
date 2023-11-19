import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { LayoutComponent } from './layout/layout/layout.component';

const routes: Routes = [
  {
    path: '',
    title: '台灣歷年總統 都幾？',
    loadComponent: () =>
      import('./pages/landing-page/landing-page.component').then(
        (mod) => mod.LandingPageComponent,
      ),
  },
  {
    path: '',
    title: '台灣歷年總統 | 全台資訊',
    component: LayoutComponent,
    children: [
      {
        path: 'vote-map/:year',
        loadComponent: () =>
          import('./pages/vote-map/vote-map.component').then(
            (mod) => mod.VoteMapComponent,
          ),
      },
    ],
  },
  {
    path: 'sand-box',
    title: '測試區',
    loadComponent: () =>
      import('./pages/sand-box/sand-box.component').then(
        (mod) => mod.SandBoxComponent,
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes), HttpClientModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}
