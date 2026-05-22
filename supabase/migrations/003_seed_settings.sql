-- Seed default rows

INSERT INTO settings (post_time_utc, default_hashtags)
VALUES ('14:00:00', ARRAY['#solitudescript','#minimalism','#philosophy','#innerpeace','#contemplation'])
ON CONFLICT DO NOTHING;

INSERT INTO monetization_config (instagram_follower_threshold, youtube_subscriber_threshold)
VALUES (100000, 100000)
ON CONFLICT DO NOTHING;
