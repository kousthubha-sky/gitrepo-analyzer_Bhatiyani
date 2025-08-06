-- Create analysis_history table in Supabase
CREATE TABLE IF NOT EXISTS analysis_history (
    id SERIAL PRIMARY KEY,
    repo_name VARCHAR(255) NOT NULL,
    repo_url VARCHAR(500) NOT NULL,
    owner VARCHAR(100) NOT NULL,
    stars INTEGER DEFAULT 0,
    forks INTEGER DEFAULT 0,
    total_commits INTEGER DEFAULT 0,
    total_contributors INTEGER DEFAULT 0,
    primary_language VARCHAR(50),
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_analysis_history_analyzed_at ON analysis_history(analyzed_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_history_repo_url ON analysis_history(repo_url);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (you can make this more restrictive later)
CREATE POLICY "Allow all operations on analysis_history" ON analysis_history
    FOR ALL 
    TO anon 
    USING (true) 
    WITH CHECK (true);
