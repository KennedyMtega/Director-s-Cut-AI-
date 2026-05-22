-- RLS Policies — admin-only access for all tables

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspiration_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE monetization_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_only" ON settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_only" ON inspiration_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_only" ON content_posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_only" ON platform_posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_only" ON post_metrics FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_only" ON comments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_only" ON monetization_config FOR ALL USING (auth.role() = 'authenticated');
