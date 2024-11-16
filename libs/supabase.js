
import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabase = createClient('https://qhpschuaekpysoqsglsb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFocHNjaHVhZWtweXNvcXNnbHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTQ1OTM0MTQsImV4cCI6MjAxMDE2OTQxNH0.O3EvbgH-Kc-K9U2gv8dmMan8EWSF-mTN0sit2SAWnHU')

export default supabase