const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
    const { data, error } = await supabase.from('listings').select(`
    *,
    listing_photos(url, is_main, sort_order),
    brands(name),
    categories(name),
    profiles!user_id(id, username, avatar_url, rating)
  `).eq('status', 'active');

    if (error) {
        console.error('Supabase Query Error:', JSON.stringify(error, null, 2));
    } else {
        console.log(`Success! Fetched ${data.length} listings.`);
    }
}

testQuery();
