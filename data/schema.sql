DROP TABLE IF EXISTS weather, event, movie, yelp, location;


CREATE TABLE location (
  id SERIAL PRIMARY KEY,
  latitude DECIMAL,
  longitude DECIMAL,
  formatted_query VARCHAR(555),
  search_query VARCHAR(555)
);

CREATE TABLE weather (
  id SERIAL PRIMARY KEY,
  forecast VARCHAR(555),
  time CHAR(15),
  created_at BIGINT,
  location_id INTEGER REFERENCES location(id)
);

CREATE TABLE event (
  id  SERIAL PRIMARY KEY,
  link VARCHAR(555),
  name VARCHAR(555),
  event_date CHAR(15),
  summary VARCHAR(1000),
  created_at BIGINT,
  location_id INTEGER REFERENCES location(id)
);

CREATE TABLE movie (
  id  SERIAL PRIMARY KEY,
  title VARCHAR(555),  
  overview VARCHAR(1000),
  average_votes DECIMAL,
  total_votes INTEGER,
  image_url VARCHAR(500),
  popularity DECIMAL,
  released_on CHAR(15),
  created_at BIGINT,
  location_id INTEGER REFERENCES location(id)
);

CREATE TABLE yelp (
  id  SERIAL PRIMARY KEY,
  name VARCHAR(555),  
  image_url VARCHAR(500),
  price CHAR(5),
  rating DECIMAL,
  url VARCHAR(555),
  created_at BIGINT,
  location_id INTEGER REFERENCES location(id)
);

