import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BarChartComponent } from './shared/charts/bar-chart/bar-chart.component';
import { PieChartComponent } from './shared/charts/pie-chart/pie-chart.component';
import { LineChartComponent } from './shared/charts/line-chart/line-chart.component';

@NgModule({
  declarations: [
    AppComponent,
    BarChartComponent,
    PieChartComponent,
    LineChartComponent,
  ],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
