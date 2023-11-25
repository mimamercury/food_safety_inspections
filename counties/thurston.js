import * as path from 'path'
import format from 'date-fns/format/index.js'
import * as dirname from '@editorialapp/datatools/dirname'
import { slugify } from '@editorialapp/datatools/text'
import { writeJson } from '@editorialapp/datatools/json'
import { get } from '../utilities.js'

// TODO: reshape output
// - { metadata: {}, rows: [] }
// - put key: label hash in metadata
// - map keys to values in each row
// - convert ints and dates where appropriate in each row

const url = 'https://www.co.thurston.wa.us/apps/eh-food-inspections/index.asp?mod=third'
const thurston_data_directory = dirname.join(import.meta.url, '../data/thurston')

const today = Date.now()
const date = format(today, 'yyyy_MM_dd_hh_mm_ss')

const filename = `thurston_food_inspections_${date}.json`
const filepath = path.join(thurston_data_directory, filename)

const { page, browser } = await get({ url })

async function scrape (page) {
    const rows = []
    const headers = await page.locator('h1 b span.text_large').allTextContents()
    
    let counter = 0
    for (const header of headers) {
        const table = await page.locator('table').nth(counter)
        counter++

        rows.push({
            header: parse_header(header),
            table: await parse_table(table)
        })
    }

    return rows
}

const scraped = await scrape(page)
await writeJson(filepath, scraped, { minify: false })
await browser.close()

function parse_header (header) {
   const [establishment, partial_address] = header.trim().split('-')
   return {
      establishment: establishment.trim(),
      partial_address: partial_address.trim()
   }
}

async function parse_table (table) {
    const data = {}

    const labels = await table.locator('tbody > tr:nth-child(1) td').allTextContents() 

    data.keys = labels.map((label) => {
        return {
            key: slugify(label.trim()),
            label: label.trim()
        }
    })

    data.values = await table.locator('tbody > tr:nth-child(2) td').allInnerTexts()
    return data
}
