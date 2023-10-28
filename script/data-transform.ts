import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';

const DATA_DIR_PATH = path.join(`${__dirname}/..`, 'data');
const DATA_FILE_EXT = '.csv';
const API_DIR_PATH = path.join(`${__dirname}/..`, 'src/assets/api');

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
      const jsonString = JSON.stringify(results, null, 2);
      const { base, name } = path.parse(dataFilePath);
      const subPath = dataFilePath.replace(DATA_DIR_PATH, '').replace(base, '');
      const apiFilePath = `${API_DIR_PATH}${subPath}`;
      console.log(apiFilePath);
      fs.mkdirSync(apiFilePath, { recursive: true });
      fs.writeFileSync(`${apiFilePath}${name}.json`, jsonString);
    });
}

function dataTransform() {
  const dataFilePaths = getDataFilePath(DATA_DIR_PATH);
  dataFilePaths.forEach((dataFilePath) => {
    convertCSVtoJson(dataFilePath);
  });
}
dataTransform();
