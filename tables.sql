DROP TABLE users;
DROP TABLE events;

-- create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username varchar(255),
  email varchar(255),
  password varchar(255),
  num_events INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- create events table
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  organizer_id INTEGER,
  name varchar(255),
  category varchar(255),
  date_ DATE,
  starttime TIME,
  endtime TIME,
  description TEXT,
  num_interests INTEGER DEFAULT 0,
  lat FLOAT,
  lng FLOAT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
