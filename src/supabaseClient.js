import { createClient } from '@supabase/supabase-js'

// Initialize the Supabase client
const supabaseUrl = 'https://feqnxbahwsomdociezti.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlcW54YmFod3NvbWRvY2llenRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNDQ5MDcsImV4cCI6MjA3MjYyMDkwN30.xNhFSMzW3vLQrGB6yfVt4w_R_f1iIm0CyTkR50B65aQ'


export const supabase = createClient(supabaseUrl, supabaseKey);