const app = require("express")();
const fs = require('fs-extra');
const crypto = require('crypto');
const hbs = require('handlebars');
const path = require('path');

let chrome = {};
let puppeteer;

const compile = async function (templateName, data) {
  const filePath = path.join(process.cwd(), 'templates', `${templateName}.hbs`);
  const html = await fs.readFile(filePath, 'utf-8');
  return hbs.compile(html)(data);
}


function base64Encode(file) {
  return fs.readFileSync(file, { encoding: 'base64' });
}

const image = (filename) => {
  return "data:image/png;base64," + base64Encode(filename);
}


const data_ = {
  test: {
      fullName: "student.fullName",
      image: image(path.join(process.cwd(), `certif_8.png`)),
      qr_code: image(path.join(process.cwd(), `certif_8.png`)),
      date :"1212121",
      local : "Kech",
      filiere :"kdkd",
      cin: "student.cin",
      cne: "student.cne",
      mention: "student.mention",
      titre_diplome : "kkeke",
      ministere:  null,
      presidence: null,
      etablissement:  null,
      fileName: path.join(process.cwd(),'test.pdf'),

  }
};


if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require("chrome-aws-lambda");
  puppeteer = require("puppeteer-core");
} else {
  puppeteer = require("puppeteer");
}

app.get("/api", async (req, res) => {
  let options = {};

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    };
  }

  try {
    let browser = await puppeteer.launch(options);

    let page = await browser.newPage();
    const content = await compile('index', data_);

    await page.setContent(content);
    await page.emulateMediaType('screen');
    const ress = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
    })

    console.log(ress)
    await browser.close();
    //send file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=certificate.pdf');
    res.send(ress);
  } catch (err) {
    console.error(err);
    return null;
  }
});

app.listen(process.env.PORT || 8986, () => {
  console.log("Server started");
});

module.exports = app;
