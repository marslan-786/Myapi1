// required packages for Node.js
// npm install jsdom pdf-node
const { JSDOM } = require('jsdom');
const { exec } = require('child_process');

// Main function that handles the API request
module.exports = async (req, res) => {
    // 1. Get the reference number from the URL query parameters
    const { refno } = req.query;

    // Check if the reference number is missing
    if (!refno) {
        return res.status(400).json({ error: 'Reference number (refno) is required.' });
    }

    try {
        // Dynamically import the pdf-node module
        const PDFModule = await import('pdf-node');
        const PDF = PDFModule.default;

        // 2. Construct the full curl command with the lowercase 'get' method
        const curlCommand = `curl -X get "https://bill.pitc.com.pk/mepcobill/general?refno=${refno}"`;

        // 3. Execute the curl command as a child process
        const htmlContent = await new Promise((resolve, reject) => {
            exec(curlCommand, (error, stdout, stderr) => {
                if (error) {
                    // Log the error from curl for debugging
                    console.error(`Curl error: ${stderr}`);
                    return reject(new Error('Failed to fetch data using curl.'));
                }
                resolve(stdout);
            });
        });

        // 4. Use JSDOM to parse the HTML and find the specific bill data div
        const dom = new JSDOM(htmlContent);
        const billData = dom.window.document.getElementById('main-content');

        // Check if the bill data element was found
        if (!billData) {
            throw new Error('Bill data not found in the HTML response. The HTML structure might have changed.');
        }

        // 5. Convert the extracted HTML element to a string for PDF conversion
        const billHtmlString = billData.outerHTML;

        // 6. Convert the HTML string to a PDF buffer
        const options = {
            format: 'A4',
            orientation: 'portrait',
            border: '10mm'
        };
        
        // Use a Promise to handle the asynchronous nature of pdf-node
        const pdfBuffer = await new Promise((resolve, reject) => {
            const pdf = new PDF(billHtmlString, options);
            pdf.toBuffer((err, buffer) => {
                if (err) {
                    return reject(err);
                }
                resolve(buffer);
            });
        });

        // 7. Set the response headers to send a PDF file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="bill_${refno}.pdf"`);
        
        // 8. Send the PDF buffer as the response
        res.status(200).send(pdfBuffer);

    } catch (error) {
        // Handle any errors that occur during the process
        console.error('API Error:', error);
        res.status(500).json({ error: 'Failed to generate PDF.', details: error.message });
    }
};
            };
