import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';

const DATA_DIR_PATH = path.join(`${__dirname}/..`, 'data');
const DATA_FILE_EXT = '.csv';
const API_DIR_PATH = path.join(`${__dirname}/..`, 'src/api');

function getDataFilePath(folderPath: string): string[] {
  let filePathList: string[] = [];
  const files = fs.readdirSync(folderPath);

  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    const fileStat = fs.statSync(filePath);

    switch (true) {
      case fileStat.isDirectory():
        filePathList = [...filePathList, ...getDataFilePath(filePath)];
        break;
      case fileStat.isFile():
        if (DATA_FILE_EXT === path.parse(file).ext) {
          filePathList.push(filePath);
        }
        break;
    }
  });
  return filePathList;
}

function convertCSVtoJson(dataFilePath: string) {
  const results: any = [];
  fs.createReadStream(dataFilePath)
    .pipe(csv({ headers: false }))
    .on('data', (data) => {
      results.push(data);
    })
    .on('end', () => {
      const { base, name } = path.parse(dataFilePath);
      const jsonString = JSON.stringify(dataFilter(name, results), null, 2);
      const subPath = dataFilePath.replace(DATA_DIR_PATH, '').replace(base, '');
      const apiFilePath = `${API_DIR_PATH}${subPath}`;

      fs.mkdirSync(apiFilePath, { recursive: true });
      fs.writeFileSync(`${apiFilePath}${name}.json`, jsonString);
    });
}

function dataFilter(name: string, results: any) {
  switch (name) {
    case 'elprof':
      return results.map((elprof: any) => {
        delete elprof[9];
        delete elprof[10];
        delete elprof[11];
        delete elprof[12];
        delete elprof[13];
        delete elprof[14];
        delete elprof[15];
        delete elprof[16];
        delete elprof[17];
        delete elprof[19];
        return elprof;
      });

    default:
      return results;
  }
}

function dataTransform() {
  const dataFilePaths = getDataFilePath(DATA_DIR_PATH);
  dataFilePaths.forEach((dataFilePath) => {
    convertCSVtoJson(dataFilePath);
  });
}
dataTransform();
