const puppeteer = require("puppeteer")
const notifier = require('node-notifier');
const path = require('path');

// var matchName = process.argv[2];

let page ;

let url = "https://www.cricbuzz.com/" ;

(async function(){
    try{
        let browser = await puppeteer.launch({
            headless : false,
            defaultViewport : null,
            args :["--start-maximized"],
        });
    
        let pages = await browser.pages();
    
        page = pages[0];
        await page.goto(url);
        
        await Promise.all([
            page.click("#cb-main-menu .cb-hm-mnu-itm"), page.waitForNavigation({
              waitUntil: "networkidle2"
            })
          ])
        
        let matchLink = await getCorrectMatchLink(page);
         console.log(matchLink)
        await page.goto(matchLink)

        setInterval(async()=>{
            await page.reload();
            await getScoreOnInterval(page)
        }, 3000);
    }
    catch(err){
      console.log(err);
    }
    
})();


// function sleep (duration){
//     let curTime=Date.now();
//     let limit=duration+curTime;
//     while(curTime<limit){
//         curTime=Date.now();
//     }
//   }

  async function getScoreOnInterval(page){
    let scorecard = await page.evaluate(function(){
        let arr=[];
        let score = document.querySelector('.cb-font-20.text-bold.inline-block.ng-binding').innerText
        let batsman1 = document.querySelectorAll(".cb-col.cb-col-100.cb-min-itm-rw.ng-scope .cb-col.cb-col-50")[0].innerText
        let batsman2 = document.querySelectorAll(".cb-col.cb-col-100.cb-min-itm-rw.ng-scope .cb-col.cb-col-50")[1].innerText
        let batsman1_runs = document.querySelectorAll(".cb-col.cb-col-100.cb-min-itm-rw.ng-scope .cb-col.cb-col-50")[0].nextSibling.innerText
        let ballsPlayedBy_1 = document.querySelectorAll(".cb-col.cb-col-100.cb-min-itm-rw.ng-scope .cb-col.cb-col-50")[0].nextElementSibling.nextElementSibling.innerText
        let batsman2_runs = document.querySelectorAll(".cb-col.cb-col-100.cb-min-itm-rw.ng-scope .cb-col.cb-col-50")[1].nextSibling.innerText
        let ballsPlayedBy_2= document.querySelectorAll(".cb-col.cb-col-100.cb-min-itm-rw.ng-scope .cb-col.cb-col-50")[1].nextElementSibling.nextElementSibling.innerText
         
        arr[0] =score;
        arr[1]=
        {
            name :batsman1,
            runs:batsman1_runs,
            balls:ballsPlayedBy_1
        }
    
        arr[2]=
        {
            name :batsman2,
            runs:batsman2_runs,
            balls:ballsPlayedBy_2
        }

       return arr;
    })

    // console.log(scorecard);
    return sendScoreCardNotification(scorecard);

  }

 async function getCorrectMatchLink(page){
      return await page.evaluate(()=>{
        let link;
        var elements = document.querySelectorAll("h3 a");

        for(let i=0; i<elements.length; i++){
           let title = document.querySelectorAll("h3 a")[i].innerText.split(",")[0];

           if(title=='Essex vs Derbyshire'){
               link = document.querySelectorAll("h3 a")[i].href
           }
        } 
        return link;
    })
 }


 function sendScoreCardNotification(scorecard){

    let msg = `1. ${scorecard[1].name.split("*")[0]}  :  ${scorecard[2].runs}  (${scorecard[2].balls}) \n2. ${scorecard[2].name} :  ${scorecard[1].runs}  (${scorecard[1].balls})`
       
    notifier.notify({
            
            title: scorecard[0],
            message:msg,
            icon: path.join(__dirname, 'smile.png'),
            sound: true,
            wait: true
          },
          function (err, response) {
            console.log(response);
          }
        );
 }