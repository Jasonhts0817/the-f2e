import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import { ApiService } from 'src/app/core/service/api.service';
import { Properties, TaiwanMap } from 'src/app/core/models/map.model';
import { Observable, forkJoin, from, map, mergeMap } from 'rxjs';

@Component({
  selector: 'app-map-chart',
  standalone: true,
  imports: [CommonModule],
  template: `<svg #mapChart></svg> `,
})
export class MapChartComponent implements AfterViewInit {
  @ViewChild('mapChart') mapChart!: ElementRef<Element>;
  @Input() width: number = 400;
  @Input() height: number = 800;
  country!: any;
  townsObj!: any;
  countryGElement!: d3.Selection<SVGGElement, unknown, null, undefined>;
  projection = d3.geoMercator().center([122.5, 24.5]).scale(10000);
  path = d3.geoPath(this.projection) as any;

  constructor(private apiService: ApiService) {}
  ngAfterViewInit(): void {
    this.apiService
      .getCountryJson()
      .pipe(
        mergeMap((country) => {
          const townReqs = country.objects.map.geometries.reduce<{
            [key: string]: Observable<TaiwanMap>;
          }>((townObj, town) => {
            townObj[town.properties.id] = this.apiService.getTownJson(
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
    const svg = d3
      .select(this.mapChart.nativeElement)
      .attr('viewBox', [0, 0, this.width, this.height])
      .attr(
        'style',
        'max-width: 100%; height: auto; max-height: calc(100dvh - 66px)',
      )
      .on('click', () => this._reset());

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
      .attr('fill', (d: any) => '#444')
      .append('title')
      .text((d: any) => d.properties?.name);

    // town path
    countryGroup
      .append('g')
      .attr('class', 'town')
      .attr('display', 'none')
      .attr('id', (d: any) => d.properties.id)
      .selectAll('g')
      .data((d: any) => {
        const townId = d.properties.id;
        return (
          topojson.feature<Properties>(
            this.townsObj[townId],
            this.townsObj[townId].objects.map,
          ) as any
        ).features;
      })
      .join('path')
      .attr('d', this.path)
      .attr('stroke', 'white')
      .attr('stroke-width', 0.1)
      .attr('fill', (d: any) => '#444')
      .append('title')
      .text((d: any) => d.properties?.name);

    svg.call(this._zoom());
  }

  private _clicked(event: any, d: any) {
    event.stopPropagation();
    const svg = d3.select(this.mapChart.nativeElement);
    this._displayTown(d.properties.id);

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

  private _displayTown(townId?: string) {
    const towns = this.countryGElement.selectAll('g.town');
    towns.attr('display', (townData: any) =>
      townData.properties.id === townId ? '' : 'none',
    );
  }

  private _reset() {
    this._displayTown();
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
