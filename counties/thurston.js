import * as path from 'path'
import format from 'date-fns/format/index.js'
import * as dirname from '@editorialapp/datatools/dirname'
import { slugify } from '@editorialapp/datatools/text'
import { writeJson } from '@editorialapp/datatools/json'
import { get, multi_error, check_schema } from '../utilities.js'

const url = 'https://www.co.thurston.wa.us/apps/eh-food-inspections/index.asp?mod=third'
const thurston_data_directory = dirname.join(import.meta.url, '../data/thurston')

const today = Date.now()
const date = format(today, 'yyyy_MM_dd_hh_mm_ss')

const filename = `thurston_food_inspections_${date}.json`
const filepath = path.join(thurston_data_directory, filename)

const { page, browser } = await get({ url })

async function download (page) {
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

function format_data (results) {
// TODO: reshape output
// - { metadata: {}, rows: [] }
// - put key: label hash in metadata
// - map keys to values in each row
// - convert ints and dates where appropriate in each row
    const data = {
        metadata: {},
        rows: []
    }

    const first_row = results[0]
    data.metadata.columns = first_row.table.keys

    for (const { header, table } of results) {
        const row = {
            ...header
        }

        for (const [index, value] of Object.entries(table.values)) {
            const key = table.keys[index].key

            if (!row[key]) {
                if (key.includes('points')) {
                    row[key] = +value
                } else {
                    row[key] = value
                }
            }
        }

        data.rows.push(row)
    }

    check(data)
    return data
}

function check (data) {
    const { rows, metadata } = data
    const errors = []

    const valid = check_schema(metadata, {
        title: 'food_safety_inspection_metadata',
        required: ['columns'],

    })

    if (!valid) {
        errors = [...valid.errors]
    }

    for (const row of rows) {
        const valid = check_schema(row, {
            title: 'food_safety_inspection_rows',
            required: ['permit_type', 'inspection_date', 'red_points', 'blue_points', 'tital_points', 'deficiencies', 'inspection_notes'],
            properties: {
                establishment: { type: 'string' },
                partial_address: { type: 'string' },
                permit_type: { type: 'string' },
                inspection_date: { type: 'string' }, 
                red_points: { type: 'number' },
                blue_points: { type: 'number' },
                total_points: { type: 'number' },
                deficiencies: { type: 'string' }, 
                inspection_notes: { type: 'string' }
            }
        })

        if (valid.errors && valid.errors.length) {
            errors = [errors, ...valid.errors]
        }
    }

    if (!errors.length) {
        return true
    }

    multi_error(`validating thurston data failed ${date}`, errors)
}

const results = format_data((await download(page)))
await writeJson(filepath, results, { minify: false })
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
