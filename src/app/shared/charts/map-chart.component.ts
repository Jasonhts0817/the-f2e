import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import { ApiService } from 'src/app/core/service/api.service';
import { Properties, TaiwanMap } from 'src/app/core/models/map.model';
import { Observable, forkJoin, from, map, mergeMap } from 'rxjs';
import { VoteYearEnum } from 'src/app/core/enums/vote-year.enum';

@Component({
  selector: 'app-map-chart',
  standalone: true,
  imports: [CommonModule],
  template: `<svg #mapChart></svg> `,
})
export class MapChartComponent implements AfterViewInit {
  @ViewChild('mapChart') mapChart!: ElementRef<Element>;
  @Input() year?: VoteYearEnum;
  @Input() width: number = 500;
  @Input() height: number = 860;
  @Input() countryData: { areaName: string; hex: string }[] | null = [];
  @Input() areaData: { areaName: string; hex: string }[] | null = [];
  @Output() changeCity = new EventEmitter<string>();
  country!: any;
  townsObj!: any;
  countryGElement!: d3.Selection<SVGGElement, unknown, null, undefined>;
  projection = d3.geoMercator().center([122, 24.3]).scale(13000);
  path = d3.geoPath(this.projection) as any;

  currentTownId?: string;

  constructor(private apiService: ApiService) {}
  ngAfterViewInit(): void {
    d3.select(this.mapChart.nativeElement)
      .attr('viewBox', [0, 0, this.width, this.height])
      .attr(
        'style',
        'max-width: 100%; height: auto; max-height: calc(100dvh - 66px)',
      )
      .on('click', () => this._reset());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['year']) {
      this.getMapPathData();
    }
    if (
      changes['countryData'] &&
      changes['countryData'].currentValue.length > 0
    ) {
      this.creatCountryChart();
    }
    if (changes['areaData'] && changes['areaData'].currentValue.length > 0) {
      this._setTownTheme();
    }
  }
  getMapPathData() {
    if (!this.year) return;
    this.apiService
      .getCountryJson(this.year)
      .pipe(
        mergeMap((country) => {
          const townReqs = country.objects.map.geometries.reduce<{
            [key: string]: Observable<TaiwanMap>;
          }>((townObj, town) => {
            townObj[town.properties.id] = this.apiService.getTownJson(
              this.year as VoteYearEnum,
              town.properties.id,
            );
            return townObj;
          }, {});
          return forkJoin(townReqs).pipe(map((towns) => ({ country, towns })));
        }),
      )
      .subscribe(({ country, towns }) => {
        this.country = country;
        this.townsObj = towns;
        this.creatCountryChart();
      });
  }

  creatCountryChart() {
    if (!this.countryData || !this.mapChart || !this.year) return;
    this.mapChart.nativeElement.innerHTML = '';
    const svg = d3.select(this.mapChart.nativeElement);
    this.countryGElement = svg.append('g');

    // country group
    const countryGroup = this.countryGElement
      .attr('cursor', 'pointer')
      .selectAll('g')
      .data(
        (
          topojson.feature<Properties>(
            this.country,
            this.country.objects.map,
          ) as any
        ).features,
      )
      .join('g');

    // country path
    countryGroup
      .attr('stroke', 'white')
      .append('path')
      .on('click', (event, d) => this._clicked(event, d))
      .attr('d', this.path)
      .attr('fill', (d: any) => {
        const { properties } = d;
        const area = this.countryData?.find(
          ({ areaName }) => areaName === properties.name,
        );
        return area ? area.hex : '#fff';
      })
      .append('title')
      .text((d: any) => d.properties?.name);

    this.countryGElement
      .append('g')
      .attr('id', 'cityName')
      .selectAll('text')
      .data(
        (
          topojson.feature<Properties>(
            this.country,
            this.country.objects.map,
          ) as any
        ).features,
      )
      .join('text')
      .on('click', (event, d) => this._clicked(event, d))
      .style('font', '700 16px sans-serif')
      .attr('fill', 'white')
      .attr('stroke', 'black')
      .attr('stroke-width', 0.3)
      .attr('x', (d: any) => {
        const [[x0, y0], [x1, y1]] = this.path.bounds(d);
        return (x0 + x1) * 0.5;
      })
      .attr('y', (d: any) => {
        const [[x0, y0], [x1, y1]] = this.path.bounds(d);
        return (y0 + y1) * 0.5;
      })
      .attr('dx', '-20px')
      .text((d: any) => {
        return d.properties?.name;
      });

    // town path
    const townGroup = countryGroup
      .append('g')
      .attr('class', 'town')
      .attr('display', 'none')
      .attr('id', (d: any) => `town_${d.properties.id}`)
      .selectAll('g')
      .data((d: any) => {
        const townId = d.properties.id;
        return (
          topojson.feature<Properties>(
            this.townsObj[townId],
            this.townsObj[townId].objects.map,
          ) as any
        ).features;
      });
    townGroup
      .join('path')
      .attr('d', this.path)
      .attr('stroke', 'white')
      .attr('stroke-width', 0.1)
      .attr('fill', (d: any) => '#fff')
      .append('title')
      .text((d: any) => d.properties?.name);
    townGroup
      .join('text')
      .style('font', '700 5px sans-serif')
      .attr('fill', 'white')
      .attr('stroke', 'black')
      .attr('stroke-width', 0.1)
      .attr('x', (d: any) => {
        const [[x0, y0], [x1, y1]] = this.path.bounds(d);
        return (x0 + x1) * 0.52;
      })
      .attr('y', (d: any) => {
        const [[x0, y0], [x1, y1]] = this.path.bounds(d);
        return (y0 + y1) * 0.5;
      })
      .attr('dx', '-20px')
      .text((d: any) => {
        return d.properties?.name;
      });

    svg.call(this._zoom());
  }

  private _clicked(event: any, d: any) {
    event.stopPropagation();
    const svg = d3.select(this.mapChart.nativeElement);
    this._hiddenAllTown(d.properties);
    this.countryGElement.select('g#cityName').attr('display', 'none');

    const [[x0, y0], [x1, y1]] = this.path.bounds(d);
    svg
      .transition()
      .duration(750)
      .call(
        this._zoom().transform,
        d3.zoomIdentity
          .translate(this.width / 2, this.height / 2)
          .scale(
            Math.min(
              8,
              0.9 / Math.max((x1 - x0) / this.width, (y1 - y0) / this.height),
            ),
          )
          .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
        d3.pointer(event, svg.node()),
      );
  }

  private _hiddenAllTown(properties?: Properties) {
    this.changeCity.emit(properties?.name);
    this.currentTownId = `town_${properties?.id}`;
    this.countryGElement.selectAll('g.town').attr('display', 'none');
  }

  private _setTownTheme() {
    if (!this.currentTownId) return;
    this.countryGElement
      .selectAll(`#${this.currentTownId}`)
      .attr('display', '')
      .selectAll('path')
      .attr('fill', (d: any) => {
        const { properties } = d;
        const area = this.areaData?.find(
          ({ areaName }) => areaName === properties.name,
        );
        return area ? area.hex : '#fff';
      });
  }

  private _reset() {
    this._hiddenAllTown();
    this.countryGElement.select('g#cityName').attr('display', '');
    const svg = d3.select(this.mapChart.nativeElement);
    svg
      .transition()
      .duration(750)
      .call(
        this._zoom().transform,
        d3.zoomIdentity,
        d3
          .zoomTransform(svg.node() as Element)
          .invert([this.width / 2, this.height / 2]),
      );
  }

  private _zoom() {
    return d3
      .zoom()
      .scaleExtent([1, 8])
      .on('zoom', (event) => this._zoomed(event));
  }

  private _zoomed(event: any) {
    const { transform } = event;
    this.countryGElement.attr('transform', transform);
    this.countryGElement.attr('stroke-this.width', 1 / transform.k);
  }
}
