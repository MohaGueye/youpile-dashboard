import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Function to parse .env.local manually to avoid extra dependencies
function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env.local')
    if (!fs.existsSync(envPath)) return {}
    const content = fs.readFileSync(envPath, 'utf8')
    const env = {}
    content.split('\n').forEach(line => {
        const [key, ...value] = line.split('=')
        if (key && value) env[key.trim()] = value.join('=').trim()
    })
    return env
}

const env = loadEnv()
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('xxxxx')) {
    console.error('❌ Erreur : Veuillez remplir les variables NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans le fichier .env.local avec vos vraies clés Supabase.')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdmin(email, pass) {
    console.log(`🚀 Création du compte admin pour : ${email}...`)

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: pass,
        email_confirm: true
    })

    if (authError) {
        if (authError.message.includes('already registered')) {
            console.log('ℹ️ L\'utilisateur existe déjà dans Auth. Tentative de promotion en admin...')
            const { data: users } = await supabase.auth.admin.listUsers()
            const existingUser = users.users.find(u => u.email === email)
            if (existingUser) {
                await promoteToAdmin(existingUser.id)
            }
        } else {
            console.error('❌ Erreur Auth:', authError.message)
        }
        return
    }

    if (authData.user) {
        console.log('✅ Utilisateur créé avec succès.')
        await promoteToAdmin(authData.user.id)
    }
}

async function promoteToAdmin(userId) {
    console.log(`⚖️ Promotion de l'ID ${userId} en super_admin...`)

    const { error: dbError } = await supabase
        .from('admins')
        .upsert({ id: userId, role: 'super_admin' }, { onConflict: 'id' })

    if (dbError) {
        console.error('❌ Erreur Base de données:', dbError.message)
    } else {
        console.log('🎉 Terminé ! Vous pouvez maintenant vous connecter sur http://localhost:3000/login')
        console.log(`📧 Email: admin@youpile.com`)
        console.log(`🔑 Pass: YoupileAdmin2024!`)
    }
}

createAdmin('admin@youpile.com', 'YoupileAdmin2024!')
