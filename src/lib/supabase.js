import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zvljdibztkelgkrnusti.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2bGpkaWJ6dGtlbGdrcm51c3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4Mjg2MjksImV4cCI6MjA4NzQwNDYyOX0.QBpmUwMsb1EDndAJt__GqqGO0SzGGjyv7QO9xUrsz-w';

export const supabase = createClient(supabaseUrl, supabaseKey);
