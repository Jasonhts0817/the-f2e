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

const yearsData: { [key: string]: any } = {
  '1996': {},
  '2004': {},
  '2008': {},
  '2012': {},
  '2000': {},
  '2016': {},
  '2020': {},
};

function convertCSVtoJson(dataFilePath: string) {
  return new Promise((resolve) => {
    const results: any = [];
    fs.createReadStream(dataFilePath)
      .pipe(csv({ headers: false }))
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', () => {
        const { base, name } = path.parse(dataFilePath);
        const jsonString = JSON.stringify(dataFilter(name, results), null, 2);
        const subPath = dataFilePath
          .replace(DATA_DIR_PATH, '')
          .replace(base, '');
        const year = subPath.replace(/\//g, '').replace('president', '');
        const apiFilePath = `${API_DIR_PATH}${subPath}`;
        yearsData[year][name] = results;
        fs.mkdirSync(apiFilePath, { recursive: true });
        fs.writeFileSync(`${apiFilePath}${name}.json`, jsonString);
        resolve(true);
      });
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
  Promise.all(
    dataFilePaths.map(async (dataFilePath) => {
      await convertCSVtoJson(dataFilePath);
    }),
  ).then(() => {
    getPartyInfos();
  });
}

function getPartyInfos() {
  Object.keys(yearsData).map((year) => {
    let { elcand, elpaty, elctks } = yearsData[year];
    elctks = elctks.filter(
      (elctk: any) => elctk[ElctksField.village] === '0000',
    );
    elcand = elcand
      .filter((elcand: any) => elcand[ElcandField.deputy] !== '*')
      .map((elcand: any) => {
        const party = elpaty.find(
          (epaty: any) =>
            epaty[ElpatiesField.politicalPartyCode] ===
            elcand[ElcandField.politicalPartyCode],
        );
        return {
          ...elcand,
          [ElcandField.politicalPartyName]:
            party[ElpatiesField.politicalPartyName],
        };
      });

    const results = elctks.map((elctk: any) => {
      const cand = elcand.find(
        (cand: any) =>
          cand[ElcandField.numberSequence] ===
          elctk[ElctksField.candidateNumber].trim(),
      );

      const result = {
        [ElpinfField.provinceCity]: elctk[ElctksField.provinceCity],
        [ElpinfField.countyCity]: elctk[ElctksField.countyCity],
        [ElpinfField.electoralDistrict]: elctk[ElctksField.electoralDistrict],
        [ElpinfField.townshipDistrict]: elctk[ElctksField.townshipDistrict],
        [ElpinfField.village]: elctk[ElctksField.village],
        [ElpinfField.pollingStation]: elctk[ElctksField.pollingStation],
        [ElpinfField.politicalPartyName]: cand[ElcandField.politicalPartyName],
        [ElpinfField.votePercentage]: elctk[ElctksField.votePercentage],
        [ElpinfField.voteCount]: elctk[ElctksField.voteCount],
      };
      return result;
    });

    const apiFilePath = `${API_DIR_PATH}/president/${year}`;
    const jsonString = JSON.stringify(results);
    fs.mkdirSync(apiFilePath, { recursive: true });
    fs.writeFileSync(`${apiFilePath}/elpinf.json`, jsonString);
  });
}

dataTransform();

enum ElctksField {
  provinceCity = 0,
  countyCity = 1,
  electoralDistrict = 2,
  townshipDistrict = 3,
  village = 4,
  pollingStation = 5,
  candidateNumber = 6,
  voteCount = 7,
  votePercentage = 8,
  electedMark = 9,
}
enum ElcandField {
  provinceCity = 0,
  countyCity = 1,
  electoralDistrict = 2,
  townshipDistrict = 3,
  village = 4,
  numberSequence = 5,
  name = 6,
  politicalPartyCode = 7,
  gender = 8,
  dateOfBirth = 9,
  age = 10,
  placeOfBirth = 11,
  education = 12,
  incumbent = 13,
  electedMark = 14,
  deputy = 15,
  politicalPartyName = 16,
}

enum ElpatiesField {
  politicalPartyCode = 0,
  politicalPartyName = 1,
}

enum ElpinfField {
  provinceCity = 0,
  countyCity = 1,
  electoralDistrict = 2,
  townshipDistrict = 3,
  village = 4,
  pollingStation = 5,
  politicalPartyName = 6,
  votePercentage = 7,
  voteCount = 8,
}
