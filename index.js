const app = require('express')();
const puppeteer = require('puppeteer');
const cron = require('node-cron');
const secrets = require('./secrets');

const listener = app.listen(8650, () => {
    console.log(`Listening on port ${listener.address().port}`);
})


cron.schedule('0 6-21 * * *', async () => {
    start();
}, { scheduled: true, timezone: "America/Denver" });


async function start() {

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto('https://www.instagram.com/accounts/login/?source=auth_switcher');

        await page.waitForSelector('input[name=username]')
        await page.type('input[name=username]', secrets.USERNAME);

        await page.type('input[name=password]', secrets.PASSWORD);

        await page.click('button[type=submit]');

        await page.waitForNavigation('load');


        await page.goto('https://www.instagram.com/explore/tags/usagiveaway/');

        //Select first contest
        await page.waitForSelector("#react-root > section > main > article > div:nth-child(3) > div > div:nth-child(1) > div:nth-child(1) > a")
        await page.click("#react-root > section > main > article > div:nth-child(3) > div > div:nth-child(1) > div:nth-child(1) > a")



        const messages = ['Would love to win this!', 'Love it!', 'Looks great!', '*Fingers Crossed*', 'I hope I win!'];
        for (let i = 0; i < 10; i++) {
            await enterContests(page, messages[i]);
        }

        await browser.close();

    } catch (error) {
        console.log(error)
    }
};






async function enterContests(page, message) {
    //Wait for dialog to load
    await page.waitForSelector("body > div._2dDPU.vCf6V > div.zZYga > div > article > header > div.o-MQd.z8cbW > div.PQo_0.RqtMr > div.bY2yH > button")

    //Need to check if already liked, followed, saved, commented....etc.
    const isFollowing = await page.$eval("body > div._2dDPU.vCf6V > div.zZYga > div > article > header > div.o-MQd.z8cbW > div.PQo_0.RqtMr > div.bY2yH > button", e => e.innerText);
    if (isFollowing.includes('Following')) {
        // Next contest
        await page.click("body > div._2dDPU.vCf6V > div.EfHg9 > div > div > a")
        await page.waitFor(200)
        return enterContests(page, message);
    }
    //Follow
    await page.click("body > div._2dDPU.vCf6V > div.zZYga > div > article > header > div.o-MQd.z8cbW > div.PQo_0.RqtMr > div.bY2yH > button")
    await page.waitFor(200)

    //Like
    await page.waitForSelector("body > div._2dDPU.vCf6V > div.zZYga > div > article > div.eo2As > section.ltpMr.Slqrh > span.fr66n > button")
    await page.click("body > div._2dDPU.vCf6V > div.zZYga > div > article > div.eo2As > section.ltpMr.Slqrh > span.fr66n > button")
    await page.waitFor(200)


    //Save
    await page.click("body > div._2dDPU.vCf6V > div.zZYga > div > article > div.eo2As > section.ltpMr.Slqrh > span.wmtNn > button")
    await page.waitFor(200)

    //Comment
    if (await page.$("body > div._2dDPU.vCf6V > div.zZYga > div > article > div.eo2As > section.sH9wk._JgwE > div > form > textarea") !== null) {
        await page.type("body > div._2dDPU.vCf6V > div.zZYga > div > article > div.eo2As > section.sH9wk._JgwE > div > form > textarea", message)
        await page.click("body > div._2dDPU.vCf6V > div.zZYga > div > article > div.eo2As > section.sH9wk._JgwE > div > form > button")
        await page.waitFor(200)
    }

    // Next contest
    await page.click("body > div._2dDPU.vCf6V > div.EfHg9 > div > div > a")
    await page.waitFor(200)
}