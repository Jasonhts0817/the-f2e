import { DialogModule, DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MapChartComponent } from '../charts/map-chart.component';
import { VoteMapService } from 'src/app/pages/vote-map/vote-map.service';
import { map } from 'rxjs';
import { THEME_CONFIG } from 'src/app/core/consts/theme.const';

@Component({
  selector: 'app-map-dialog',
  templateUrl: './map-dialog.component.html',
  standalone: true,
  imports: [DialogModule, CommonModule, MapChartComponent],
})
export class MapDialogComponent {
  mapChartCountryData = this.voteMapService.countryVoteInfoVM.pipe(
    map((infos) =>
      infos.map((info) => {
        const theme = this._getPartyTheme(info.electedPartyName);
        return {
          areaName: info.areaName,
          ...theme,
        };
      }),
    ),
  );

  mapChartAreaData = this.voteMapService.areaVoteInfoVM.pipe(
    map((infos) =>
      infos.map((info) => {
        const theme = this._getPartyTheme(info.electedPartyName);
        return {
          areaName: info.areaName,
          ...theme,
        };
      }),
    ),
  );

  constructor(
    public dialogRef: DialogRef,
    public voteMapService: VoteMapService,
  ) {}

  changeCity(cityName: string) {
    let option = this.voteMapService.provinceAndCountryCityOptions.value.find(
      (country) => country.name == cityName,
    );
    option = option
      ? option
      : this.voteMapService.provinceAndCountryCityOptions.value[0];

    this.voteMapService.searchForm?.controls[
      'provinceAnyCountyCity'
    ].patchValue(option);
  }
  private _getPartyTheme(partyName: string) {
    return (
      THEME_CONFIG.find((theme) => theme.partyName === partyName) ??
      THEME_CONFIG[THEME_CONFIG.length - 1]
    );
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
