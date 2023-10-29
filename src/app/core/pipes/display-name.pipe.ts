import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'displayName',
  standalone: true,
})
export class DisplayNamePipe implements PipeTransform {
  transform(value: any, mappingObject: { [key: string]: any }): any {
    if (!value || !mappingObject) {
      return value;
    }

    if (value in mappingObject) {
      return mappingObject[value];
    } else {
      return value;
    }
  }
}
