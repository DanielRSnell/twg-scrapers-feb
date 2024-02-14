const axios = require('axios');
const cheerio = require('cheerio');
const { parse } = require('json2csv');
const fs = require('fs');

const links = require('./links.json');

async function scrapeDetails(link) {
  try {
    const response = await axios(link);
    const html = response.data;
    const $ = cheerio.load(html);
    const title = $('.mos-Title').text().trim();
    const address = $('.t-Card .card-body .card-text.arvo').text().trim().replace(/\n/g, ', ');
    const phone = $('.telephone .card-phone-text').text().trim();
    const website = $('.card-item.card-bold a[data-type="website"]').attr('href');
    console.log(`Scraped: ${title}`);
    return { title, address, phone, website };
  } catch (error) {
    console.error(`Error scraping ${link}:`, error.message);
    return {};
  }
}

async function main() {
  // Map each link to a scrapeDetails promise
  const scrapePromises = links.map(link => scrapeDetails(link));

  // Use Promise.allSettled to wait for all promises to settle (either fulfill or reject)
  const results = await Promise.allSettled(scrapePromises);

  // Filter out successfully scraped details
  const details = results.filter(result => result.status === 'fulfilled' && Object.keys(result.value).length).map(result => result.value);

  // Convert details to CSV
  const csv = parse(details, ['title', 'address', 'phone', 'website']);
  fs.writeFileSync('mil-sheet.csv', csv);
  console.log('Details have been saved to mil-sheet.csv');
}

main();
