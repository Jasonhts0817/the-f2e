import { Component, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { PieChartData, PieDataType } from './pie-chart.data';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
})
export class PieChartComponent {
  @ViewChild('pieChart') pieChart!: ElementRef<SVGElement>;
  data = PieChartData;
  ngAfterViewInit(): void {
    this.createPieChart();
  }
  createPieChart() {
    // Specify the chart’s dimensions.
    const width = 928;
    const height = Math.min(width, 500);

    // Create the color scale.
    const color = d3
      .scaleOrdinal<string>()
      .domain(this.data.map((d) => d.name))
      .range(
        d3
          .quantize(
            (t) => d3.interpolateSpectral(t * 0.8 + 0.1),
            this.data.length,
          )
          .reverse(),
      );

    // Create the pie layout and arc generator.
    const pie = d3
      .pie<PieDataType>()
      .sort(null)
      .value((d) => d.value);

    const arc = d3
      .arc<void, d3.PieArcDatum<PieDataType>>()
      .innerRadius(0)
      .outerRadius(Math.min(width, height) / 2 - 1);

    const labelRadius = (d: d3.PieArcDatum<PieDataType>) =>
      arc.outerRadius()(d) * 0.8;

    // A separate arc generator for labels.
    const arcLabel = d3
      .arc<void, d3.PieArcDatum<PieDataType>>()
      .innerRadius(labelRadius)
      .outerRadius(labelRadius);

    const arcs = pie(this.data);

    // Create the SVG container.
    const svg = d3
      .select(this.pieChart?.nativeElement)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-width / 2, -height / 2, width, height])
      .attr('style', 'max-width: 100%; height: auto; font: 10px sans-serif;');

    // Add a sector path for each value.
    svg
      .append('g')
      .attr('stroke', 'white')
      .selectAll()
      .data(arcs)
      .join('path')
      .attr('fill', (d) => color(d.data.name))
      .attr('d', arc as any)
      .append('title')
      .text((d) => `${d.data.name}: ${d.data.value.toLocaleString('en-US')}`);

    // Create a new arc generator to place a label close to the edge.
    // The label shows the value if there is enough room.
    svg
      .append('g')
      .attr('text-anchor', 'middle')
      .selectAll()
      .data(arcs)
      .join('text')
      .attr('transform', (d) => `translate(${arcLabel.centroid(d)})`)
      .call((text) =>
        text
          .append('tspan')
          .attr('y', '-0.4em')
          .attr('font-weight', 'bold')
          .text((d) => d.data.name),
      )
      .call((text) =>
        text
          .filter((d) => d.endAngle - d.startAngle > 0.25)
          .append('tspan')
          .attr('x', 0)
          .attr('y', '0.7em')
          .attr('fill-opacity', 0.7)
          .text((d) => d.data.value.toLocaleString('en-US')),
      );
  }
}
