const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const url = 'https://installations.militaryonesource.mil/view-all';

async function fetchAndSaveLinks() {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        let links = [];

        // Assuming .installation > a is the correct selector for links
        $('.installation > a').each((index, element) => {
            const href = $(element).attr('href');
            if (href) {
                links.push(href);
            }
        });

        // Save the links as JSON
        fs.writeFileSync('links.json', JSON.stringify(links, null, 2));
        console.log('Links have been saved to links.json');
    } catch (error) {
        console.error('Error fetching or parsing the page:', error);
    }
}

fetchAndSaveLinks();
