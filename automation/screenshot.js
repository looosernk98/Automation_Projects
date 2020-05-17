let puppeteer = require("puppeteer");
let fs = require("fs");
let countryName = process.argv[2];
let cFile = process.argv[3];

(async function () {
  try {

    let data = await fs.promises.readFile(cFile)
    let { user, pwd, url1,fuser,fpwd ,url2 } = JSON.parse(data);

    let browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ["--start-maximized","--disable-notifications"]
    })
    let pages = await browser.pages()
    let page = pages[0]
    
    await page.goto("https://www.worldometers.info/coronavirus/#countries", {waitUntil: 'load', timeout: 0})

    await page.waitForSelector("input[type=search]")
  
    await page.type("input[type=search]", countryName)

    await Promise.all([
      page.click("tbody tr td .mt_a"), page.waitForNavigation({
        waitUntil: "networkidle2"
      })
    ])
    
    let options = {
      path: "IMAGES\\sreen.jpeg",
      type: "jpeg",
      quality: 100,
      clip: {
        x: 250,
        y: 155,
        width: 666,
        height: 690,  // dont increase height more than need bcoz it will goes on taking same ss until the given height is fulfilled
      }
    }
    await autoScroll(page);
     await page.screenshot(options); 
//*****************************************screenshot taken*******************************/

    await page.goto(url2, { waitUntil: "networkidle2" });
    await page.waitForSelector("input[type=email]");
    await page.type("input[type=email]", fuser, { delay: 100 });
    await page.type("input[type=password]", fpwd, { delay: 100 });

    await Promise.all([
      page.click(".login_form_login_button"), page.waitForNavigation({
        waitUntil: "networkidle2"
      })
    ])
     //*************************************fb login completed*************************************/

     let [fileChooser]=await Promise.all([page.waitForFileChooser(),page.click("div[class=_3jk]")])
     await fileChooser.accept(["D:\\lecture 2\\scrapping\\fair\\activity\\myProjects\\IMAGES\\sreen.jpeg"])
     //*******************************screen.jpeg file upload completed*******************************/

     let disable = await page.$('._1mf7._4r1q._4jy0._4jy3._4jy1._51sy.selected._42ft[disabled]');
     while(disable !==null){
       disable = await page.$('._1mf7._4r1q._4jy0._4jy3._4jy1._51sy.selected._42ft[disabled]');
     }
      sleep(5000);
     let postbutton = await page.$('._1mf7._4r1q._4jy0._4jy3._4jy1._51sy.selected._42ft');
     await postbutton.click();
//********************************post button clicked*******************************************************/
  } catch (err) {
    console.log(err);
  }
})();

function sleep (duration){
  let curTime=Date.now();
  let limit=duration+curTime;
  while(curTime<limit){
      curTime=Date.now();
  }
}
async function autoScroll(page){
  await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
          let totalHeight = 0;
          let distance = 50;
          let timer = setInterval(() => {
              let scrollHeight = 150;
              window.scrollBy(0, distance);
              totalHeight += distance;

              if(totalHeight >= scrollHeight){
                  clearInterval(timer);
                  resolve();
              }
          }, 100);
      });
  });
}
