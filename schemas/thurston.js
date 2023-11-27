export const food_safety_inspection_rows = {
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
}

export const food_safety_inspection_metadata = {
    title: 'food_safety_inspection_metadata',
    required: ['columns'],
    properties: {
        columns: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    key: { type: 'string' },
                    label: { type: 'string' }
                }
            }
        }
    }
}
