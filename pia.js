async function runPIA() {
    const functions = require('./operations_dir/functions')
    const puppeteer = require('puppeteer');
    const {loginInfo} = require('./info_dir/login_info.js');
    const {inputs} = require('./info_dir/input_variables.js');
    const {signature} = require('./info_dir/signature_info');

    var txt = require('./extract_report.js');

    const checked = {
        TRUE: '☒',
    };
    const link = 'https://thebluprint.phibetasigma1914.org/PBSICE/ICE/Actions/SubmitForm.aspx?formcode=PIA&contactid=100210'

    var input = document.getElementById("upload_report");
    var file = input.value.split("\\");
    var dir = "reports/" + file[file.length - 1];

    var img_input = document.getElementById("upload_image");
    var img_file = img_input.value.split("\\");
    var img = "pics/" + img_file[img_file.length - 1];

    txt.extract(dir)

    // This code reads a chapter report txt file and stores to an array
    var fs = require("fs")
    var textLines = fs
        .readFileSync("blank_report.txt")
        .toString('utf-8')
        .split("\n");

    await (async () => {
        document.getElementById("submission_status").textContent = "Starting Upload...";
        const browser = await puppeteer.launch({
            headless: true  // set to "false" if you want to see in action, "true" for headless
        })
        const page = await browser.newPage()
        await page.setViewport({width: 1280, height: 720})

        document.getElementById("loginInfo").textContent =
            "Username: " + loginInfo.USERNAME + "   |   Password: " + loginInfo.PASSWORD
        await functions.login(loginInfo.USERNAME, loginInfo.PASSWORD, page)
        document.getElementById("submission_status").textContent = "Successfully Logged In!";

        await page.goto
        (
            link,
            {waitUntil: 'networkidle2'}
        )

        /** Section 1 **/

        await functions.continueButton(page)
        document.getElementById("submission_status").textContent = "On the Selection page...";
        console.log("\nOn the Selection page...")

        /** Section 2 **/

        await page.click(`label[for="${inputs.ON_DEMAND_ID}"]`)

        await functions.continueButton(page)
        document.getElementById("submission_status").textContent = "Creating On-Demand PIA...";
        console.log("\nCreating On-Demand PIA...")

        document.getElementById("submission_status").textContent = "PIA Created!";


        /** Section 3 **/

        console.log("\nPopulating data...")
        document.getElementById("submission_status").textContent = "Populating Data...";
        // select the program area focus
        await functions.selectProgramType(page,
            textLines[0].slice(textLines[0].indexOf(':') + 1,
                textLines[0].length).trim()
        )

        // select the chapter name (eta)
        await functions.selectChapterName(page)

        //Check if the report was for a black spend event. If so, get the amount
        let bse = textLines[1].trim()
        let blackSpdEvnt = false
        let blackSpdAmt = ""
        if (bse.includes(checked.TRUE)) {
            blackSpdEvnt = true
            blackSpdAmt = bse.slice(bse.indexOf(':') + 1, bse.length).trim()
        }
        // if black spend event, then check the box
        await functions.blackSpendEvent(page, blackSpdEvnt, blackSpdAmt)

        //Date
        let date = textLines[3].slice(3, textLines[3].search(/\b, the Brothers of the Eta Chapter\b/)).trim()
        await functions.enterDate(page, date)

        //Service Hours
        let servHours = ""
        if (!textLines[19].includes('[Number of hours]')) {
            servHours = textLines[19].replace('Total Number of Hours Served: ', '')
            servHours = servHours.replace(' hours', '')
            await functions.numServiceHours(page, servHours.trim())
        }

        //Location
        let location = textLines[2].slice(textLines[2].indexOf('n') + 2, textLines[2].length).trim()
        await functions.enterLocation(page, location)

        //Description
        let description = textLines[3].trim()
        await functions.programDesc(page, description)

        //Goal
        let goal = textLines[4].slice(textLines[4].indexOf(':') + 1, textLines[4].length).trim()
        await functions.programGoal(page, goal)

        //People who provided materials
        let pplMaterials = textLines[18].slice(textLines[18].search(/\bOut of that number\b/), textLines[18].length)
        pplMaterials = pplMaterials.slice(pplMaterials.indexOf(',') + 1, pplMaterials.search(/\bprovided\b/)).trim()
        await functions.providedMaterials(page, pplMaterials)

        //People who attended
        let pplAttended = textLines[18].slice(
            textLines[18].indexOf(':') + 2, textLines[18].search(/\bbrothers participated\b/)
        ).trim()
        await functions.amtParticipated(page, pplAttended)

        //Dispersed Funds
        if (textLines[14].includes(checked.TRUE)) {
            let disburseType = textLines[15].slice(textLines[15].indexOf(':') + 1, textLines[15].length).trim()
            let fundsRecip = textLines[16].slice(textLines[16].indexOf(':') + 1, textLines[16].length).trim()
            let amtDisp = textLines[17].slice(textLines[17].indexOf(':') + 1, textLines[17].length).trim()

            await functions.dispersedFunds(page, disburseType, fundsRecip, amtDisp)
        }

        //Outside Speaker
        await page.click(
            `input[id="${inputs.OUTSIDE_SPEAKER}"]`
        )
        await page.waitForTimeout(750)
        if (textLines[13].includes(checked.TRUE)) {
            const speaker = await page.$x(`//li[text()="Yes"]`);
            await speaker[0].click();
            console.log('There was an Outside Speaker.')
        } else {
            const speaker = await page.$x(`//li[text()="No"]`);
            await speaker[0].click();
            console.log('No Outside Speaker.')
        }

        //Events
        await functions.event(page, textLines)

        //Rating
        let rating = textLines[20].slice(textLines[20].indexOf(':') + 2, textLines[20].length).trim()
        let recommend = textLines[21].slice(textLines[21].indexOf('?') + 2, textLines[21].length).trim()
        await functions.rateProgram(page, rating, recommend)

        document.getElementById("submission_status").textContent = "Uploading Image...";

        const elementHandle = await page.$('input[type="file"]')
        await elementHandle.uploadFile(img)
        document.getElementById("submission_status").textContent = "Data Populated!";
        console.log('Uploaded Image!')

        await functions.continueButton(page)
        document.getElementById("submission_status").textContent = "Validating Information...";
        console.log('\n4. Validating information...')

        /** Section 4 **/
        await page.waitForTimeout(750)

        let first = await page.$(`label[for="${signature.FIRST_NAME}"]`)
        let firstName = await page.evaluate(el => el.textContent, first)
        await page.type(
            `input[id="${signature.FIRST_NAME}"]`,
            firstName
        )
        console.log(`Entered first name: ${firstName}`)

        let last = await page.$(`label[for="${signature.LAST_NAME}"]`)
        let lastName = await page.evaluate(el => el.textContent, last)
        await page.type(
            `input[id="${signature.LAST_NAME}"]`,
            lastName
        )
        console.log(`Entered last name: ${lastName}`)

        let today = await page.$(`label[for="${signature.TODAYS_DATE}"]`)
        let todayDate = await page.evaluate(el => el.textContent, today)
        await page.type(
            `input[id="${signature.TODAYS_DATE}"]`,
            todayDate
        )
        console.log(`Entered today\'s date: ${todayDate}`)

        //Submit PIA
        await functions.continueButton(page)
        console.log("\nPIA Submitted Successfully!")
        await page.waitForTimeout(500)

        await browser.close()
    })();

    return 0;
}