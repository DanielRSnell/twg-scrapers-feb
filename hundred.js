const axios = require('axios');
const cheerio = require('cheerio');
const { parse } = require('json2csv');
const fs = require('fs');

const url = 'https://www.thehundred-seven.org/hbculist.html';

axios.get(url)
  .then(response => {
    const html = response.data;
    const $ = cheerio.load(html);
    const schools = [];

    $('.card-block a').each((_, element) => {
      const name = $(element).text().trim();
      const link = $(element).attr('href');
      // Assuming we want to exclude links without href or with only '#'
      if (link && link !== '#' && name) {
        schools.push({ name, link });
      }
    });

    // Exclude duplicates if necessary
    const uniqueSchools = Array.from(new Set(schools.map(s => JSON.stringify(s)))).map(s => JSON.parse(s));

    const csv = parse(uniqueSchools, ['name', 'link']);
    fs.writeFileSync('hundred-seven.csv', csv);
    console.log('The data has been saved to hundred-seven.csv');
  })
  .catch(error => console.error('An error occurred:', error));
