import { chromium } from 'playwright-chromium'
import Ajv from 'ajv'

export async function get ({ url, headless = true }) {
    const browser = await chromium.launch({ headless })
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto(url)
    // await on_load(page)

    return { browser, page }
}

export function multi_error (message, errors) {
    const full_message = `${errors.length} errors
        ${message}

        Errors:

        ${errors.join('\n\n')}
    
    `

    throw new Error(message)
}

export function check_schema (data, schema) {
    const ajv = new Ajv({ strict: false })
    const validate = ajv.compile(schema)
    return validate(data)
}
