const axios = require('axios');
const { parse } = require('json2csv');
const fs = require('fs');

const url = 'https://portal.chcimpact.org/PortalConnectorMvc/Services/Data/Grid/QueryAllDataItems/596cf0da-c47a-4220-be81-b35a8bc6ed47';

async function fetchAllData() {
    try {
        // Start with page 1 to get total number of records
        const initialResponse = await axios.post(url, {
            cache: false,
            page: 1,
            pageSize: 1,
        });

        const totalRecords = initialResponse.data.total;
        let allData = [];

        // Adjust pageSize according to the total number of records and rate limits
        const pageSize = Math.min(100, totalRecords); // Fetch all if less than 100, or in chunks of 100
        const totalPages = Math.ceil(totalRecords / pageSize);

        for (let page = 1; page <= totalPages; page++) {
            const response = await axios.post(url, {
                cache: false,
                page: page,
                pageSize: pageSize,
            });

            // Map the data to only include relevant columns
            const pageData = response.data.data.map(item => ({
                name: item.name,
                address1_composite: item.address1_composite,
                address2_composite: item.address2_composite,
                telephone1: item.telephone1,
                websiteurl: item.websiteurl,
                chc_256characterstatement: item.chc_256characterstatement,
                sl_federalein: item.sl_federalein,
                chc_ntee1: item.chc_ntee1,
                chc_ntee2: item.chc_ntee2,
                chc_ntee3: item.chc_ntee3,
            }));
            allData = allData.concat(pageData);
            console.log(`Fetched page ${page} of ${totalPages}`);
        }

        // Specify fields for CSV
        const fields = ['name', 'address1_composite', 'address2_composite', 'telephone1', 'websiteurl', 'chc_256characterstatement', 'sl_federalein', 'chc_ntee1', 'chc_ntee2', 'chc_ntee3'];
        const csv = parse(allData, { fields });

        fs.writeFileSync('data.csv', csv);
        console.log('Data has been written to data.csv');

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

fetchAllData();
