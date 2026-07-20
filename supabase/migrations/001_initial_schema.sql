-- Farms table
CREATE TABLE IF NOT EXISTS farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Fields table with PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE TABLE IF NOT EXISTS fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    boundary JSONB NOT NULL DEFAULT '[]',
    center_lat FLOAT,
    center_lng FLOAT,
    area_ha FLOAT DEFAULT 0,
    geom geometry(POLYGON, 4326),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Crops table
CREATE TABLE IF NOT EXISTS crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
    crop_type TEXT NOT NULL,
    variety TEXT DEFAULT '',
    planting_date DATE,
    expected_harvest DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Analyses table
CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'info',
    severity TEXT DEFAULT 'info',
    message TEXT DEFAULT '',
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Chat sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE SET NULL,
    title TEXT DEFAULT 'New Chat',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Chat messages (for RAG memory)
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user',
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Knowledge base (for RAG)
CREATE TABLE IF NOT EXISTS knowledge_docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    source TEXT DEFAULT '',
    embedding vector(1536),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_docs ENABLE ROW LEVEL SECURITY;
