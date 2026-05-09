const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testCreate() {
    const email = `test_admin_fixed@example.com`
    const password = 'Password123!'
    
    console.log('Testing createUser (first time) with:', email)
    await supabase.auth.admin.createUser({ email, password, email_confirm: true })
    
    console.log('Testing createUser (second time) with same email...')
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
    })
    
    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Success:', data)
        // Cleanup
        await supabase.auth.admin.deleteUser(data.user.id)
    }
}

testCreate()
