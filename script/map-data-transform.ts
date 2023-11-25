import * as fs from 'fs';
import * as path from 'path';

const DATA_PATH = path.join(`${__dirname}/..`, 'data/map/twTown1982.topo.json');
const ELBASE_DATA_PATH = path.join(
  `${__dirname}/..`,
  'src/api/president/1996/elbase.json',
);
const API_DIR_PATH = path.join(`${__dirname}/..`, 'src/api/map/1982/towns');
function getCountryObj() {
  const elbaseRawData = fs.readFileSync(ELBASE_DATA_PATH).toString();
  const elbaseData = JSON.parse(elbaseRawData);
  return elbaseData
    .filter((elbase: any) => elbase[3] === '000' && elbase[4] === '0000')
    .reduce((countryObj: { [key: string]: string }, elbase: any) => {
      countryObj[elbase[5]] = `${elbase[0]}${elbase[1]}`;
      return countryObj;
    }, {});
}
function dataTransform() {
  const mapRawData = fs.readFileSync(DATA_PATH).toString();
  const mapData = JSON.parse(mapRawData);
  const countrObj = getCountryObj();
  const defaultMapData = {
    type: mapData.type,
    transform: mapData.transform,
    objects: {
      map: {
        type: mapData.objects.layer1.type,
        geometries: [],
        bbox: mapData.objects.layer1.bbox,
      },
    },
    arcs: mapData.arcs,
    bbox: mapData.bbox,
  };
  const countrysTopoJson: { [key: string]: any } = {};
  mapData.objects.layer1.geometries.forEach((geo: any) => {
    const { properties } = geo;
    const countryId: string = countrObj[properties.COUNTYNAME];

    if (!countrysTopoJson[countryId]) {
      countrysTopoJson[countryId] = JSON.parse(JSON.stringify(defaultMapData));
    }

    const geometry = {
      ...geo,
      properties: {
        id: properties.TOWNID,
        name: properties.TOWNNAME,
      },
    };
    countrysTopoJson[countryId].objects.map.geometries.push(geometry);
  });

  Object.keys(countrysTopoJson).map((countryId) => {
    fs.writeFileSync(
      `${API_DIR_PATH}/towns-${countryId}.json`,
      JSON.stringify(countrysTopoJson[countryId]),
    );
  });
  console.log(countrObj);
}

dataTransform();
