const { inputs } = require('../info_dir/input_variables.js');
const checked = {
    TRUE: '☒',
};

module.exports = {
//Login function
    login: async function(username, password, page) {
        await page.goto(
            'https://thebluprint.phibetasigma1914.org/PBSICE/public/Login.aspx?',
            {waitUntil: 'load'}
        )
        // Username input
        await page.type
        (
            'input[type="text"]',
            username
        )

        // Password input
        await page.type
        (
            'input[type="password"]',
            password
        )

        await Promise.all([
            page.click('input[value="Sign In"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
        ])

        console.log('Successfully logged in!')
    },

//Function for clicking the "Continue" button
    continueButton: async function(page) {
        await Promise.all([
            page.click(`input[value="Continue"]`),
            page.waitForNavigation({waitUntil: 'networkidle2'})
        ])
    },

    selectProgramType: async function(page, program) {
        //open the dropdown box for program area type
        await page.waitForTimeout(750)
        await page.click
        (
            `input[name="${inputs.PROGRAM_TYPE}"]`
        )

        await page.waitForTimeout(750)
        const progType = await page.$x(`//li[text()="${program}"]`)
        await progType[0].click()
        console.log(`Program Area Focus: ${program}`)

        await page.waitForTimeout(500)
    },

    selectChapterName: async function(page) {
        //open the dropdown box for sponsoring chapter name
        await page.waitForTimeout(250)
        await page.click
        (
            `input[name="${inputs.CHAPTER_NAME}"]`
        )

        await page.waitForTimeout(750)
        const chapterName = await page.$x(`//li[text()="${inputs.CHAPTER}"]`);
        await chapterName[0].click();
        console.log(`Chapter Name: ${inputs.CHAPTER}`)
    },

    blackSpendEvent: async function(page, blackSpdEvnt, blackSpdAmt) {
        await page.waitForTimeout(500)
        if (blackSpdEvnt) {
            //check the box
            await page.click
            (
                `label[for="${inputs.BLACK_SPEND_EVENT}"]`
            )
            console.log('This is a Black Spend Event')

            await page.type('input[value="$0.00"]', blackSpdAmt)
            console.log(`Amount: $${blackSpdAmt}`)
        }
    },

    enterDate: async function(page, date) {
        //let dt = textLines[6].trim()
        //let date = dt.slice(dt.indexOf(':') + 2, dt.length)
        await page.waitForTimeout(250)
        await page.type(
            `input[id="${inputs.DATE}"]`,
            date
        )
        console.log(`Entered Date: ${date}`)
    },

    enterLocation: async function(page, location) {
        await page.waitForTimeout(250)
        if (!location.includes('Enter the location where this event was held')) {
            await page.type(
                `input[id="${inputs.LOCATION}"]`,
                location
            )
            console.log(`Location: ${location}`)
        }
    },

    numServiceHours: async function(page, servHours) {
        await page.type(
            `input[id="${inputs.SERVICE_HOURS}"]`,
            servHours
        )
        console.log(`${servHours} Service Hours Completed`)
    },

    providedMaterials: async function(page, pplMaterials) {
        await page.type(
            `input[id="${inputs.PROVIDED_MATERIALS}"]`,
            pplMaterials
        )
        console.log(`${pplMaterials} people provided materials`)
    },

    amtParticipated: async function(page, pplAttended) {
        await page.type(
            `input[id="${inputs.AMOUNT_PARTICIPATED}"]`,
            pplAttended
        )
        console.log(`${pplAttended} people participated in this event`)
    },

    programDesc: async function(page, description) {
        await page.type(
            `input[id="${inputs.DESCRIPTION}"]`,
            description
        )
        console.log(`Description: ${description}`)
    },

    programGoal: async function(page, goal) {
        await page.type(
            `input[id="${inputs.GOAL}"]`,
            goal
        )
        console.log(`Goal: ${goal}`)
    },

    dispersedFunds: async function(page, disburseType, fundsRecip, amtDisp) {

        //check the box
        await page.click
        (
            `label[for="${inputs.DISPERSED_FUNDS}"]`
        )

        //open the dropdown box for disbursement type
        await page.waitForTimeout(750)
        await page.click
        (
            'input[name="ctl00$ContentCenter$field_00000000000000000000000000000000_e99bf7bd98264090bf3bf4618e9db721"]'
        )
        await page.waitForTimeout(750)
        const progType1 = await page.$x(`//li[text()="${disburseType}"]`)
        await progType1[0].click()
        console.log(`Disbursement Type: ${disburseType}`)

        //open the dropdown box for funds recipient
        await page.waitForTimeout(750)
        await page.click
        (
            'input[name="ctl00$ContentCenter$field_00000000000000000000000000000000_05465f708d2b4ba0a6c99f15a79d6c2c"]'
        )
        await page.waitForTimeout(750)
        const progType2 = await page.$x(`//li[text()="${fundsRecip}"]`)
        await progType2[0].click()
        console.log(`Funds Recipient: ${fundsRecip}`)

        //type amount dispersed
        await page.waitForTimeout(250)
        await page.type(
            'input[id="ctl00_ContentCenter_field_00000000000000000000000000000000_29824c621f4d4d4e91f3a7974103daa9"]',
            amtDisp
        )
        console.log(`${amtDisp} Dispersed.`)
    },

    event: async function(page, textLines) {
        let boxes = [9, 10, 11, 12];
        let dropdowns = [
            'ctl00_ContentCenter_field_00000000000000000000000000000000_890443c1cffd4355969e5bbda26b47a1_Input',
            'ctl00_ContentCenter_field_00000000000000000000000000000000_d6ad4382a86842de82b5d50c21031523_Input',
            'ctl00_ContentCenter_field_00000000000000000000000000000000_560aa9fb4bd0471d96d9264cb62455ab_Input',
            'ctl00_ContentCenter_field_00000000000000000000000000000000_4b4ff85940214b348a58dc3642392954_Input'
        ];

        //check the box
        for (let i = 0; i < 4; ++i) {
            await page.waitForTimeout(750)
            await page.click
            (
                `input[id="${dropdowns[i]}"]`
            )
            if (textLines[boxes[i]].includes(checked.TRUE)) {
                //open the dropdown box for disbursement type
                await page.waitForTimeout(750)
                const eventType = await page.$x(`//li[text()="Yes"]`);
                await eventType[0].click();
                console.log(`${textLines[boxes[i] - 8]}: Yes`)
            } else {
                //open the dropdown box for disbursement type
                await page.waitForTimeout(750)
                const eventType = await page.$x(`//li[text()="No"]`);
                await eventType[0].click();
                console.log(`${textLines[boxes[i] - 8]}: No`)
            }
        }
    },

    rateProgram: async function(page, rating, recommend) {
        //Rating
        await page.waitForTimeout(750)
        await page.click
        (
            'input[id="ctl00_ContentCenter_field_00000000000000000000000000000000_c3328cd0d62749bd83c1f52363ca9386_Input"]'
        )

        await page.waitForTimeout(750)
        const event1 = await page.$x(`//li[text()="${rating}"]`)
        await event1[0].click()
        console.log(`Event Success: ${rating}`)

        //Recommend
        await page.waitForTimeout(750)
        await page.click
        (
            'input[id="ctl00_ContentCenter_field_00000000000000000000000000000000_3ad8807580ff43f38717e054394d5362_Input"]'
        )

        await page.waitForTimeout(750)
        const event2 = await page.$x(`//li[text()="${recommend}"]`)
        await event2[0].click()
        console.log(`Recommend for Future?: ${recommend}`)
    }
}
