import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ggbghhgcptasohznbxcy.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnYmdoaGdjcHRhc29oem5ieGN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MDQzOTIsImV4cCI6MjA5NTA4MDM5Mn0.hi9o3-ZPCBHCM8GwoZ71yeTYRSVFPEWsU9j9CY9wKOU';

export const supabase = createClient(supabaseUrl, supabaseKey);