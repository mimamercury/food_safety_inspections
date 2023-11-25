import { chromium } from 'playwright'

export async function on_load (page, { timeout = 10000 } = {}) {
    return new Promise(async (resolve, reject) => {
        // setTimeout(() => {
        //     reject(`Timeout on page load: ${timeout}`)
        // }, timeout)

        // page.once('load', resolve)
    })
}

export async function get ({ url, headless = true }) {
    const browser = await chromium.launch({ headless })
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto(url)
    // await on_load(page)

    return { browser, page }
}

export function error (message) {
    throw new Error(message)
}
