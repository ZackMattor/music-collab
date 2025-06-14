-- Performance indexes for Music Collaboration Platform
-- Based on ARCHITECTURE.md specifications

-- Performance indexes for projects
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at);
CREATE INDEX IF NOT EXISTS idx_projects_last_accessed_at ON projects(last_accessed_at);
CREATE INDEX IF NOT EXISTS idx_projects_is_active ON projects(is_active);

-- Performance indexes for stems
CREATE INDEX IF NOT EXISTS idx_stems_project_id ON stems(project_id);
CREATE INDEX IF NOT EXISTS idx_stems_order ON stems("order");
CREATE INDEX IF NOT EXISTS idx_stems_last_modified_by ON stems(last_modified_by);

-- Performance indexes for segments with time range queries
CREATE INDEX IF NOT EXISTS idx_segments_stem_id ON stem_segments(stem_id);
CREATE INDEX IF NOT EXISTS idx_segments_time_range ON stem_segments(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_segments_type ON stem_segments(type);
CREATE INDEX IF NOT EXISTS idx_segments_last_modified_by ON stem_segments(last_modified_by);

-- Performance indexes for collaborators
CREATE INDEX IF NOT EXISTS idx_collaborators_project_user ON project_collaborators(project_id, user_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_user_id ON project_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_role ON project_collaborators(role);
CREATE INDEX IF NOT EXISTS idx_collaborators_is_online ON project_collaborators(is_online);

-- Real-time collaboration indexes
CREATE INDEX IF NOT EXISTS idx_sessions_project_id ON collaboration_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON collaboration_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_is_playing ON collaboration_sessions(is_playing);

-- Session participants indexes
CREATE INDEX IF NOT EXISTS idx_participants_session_id ON session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON session_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_socket_id ON session_participants(socket_id);

-- Session changes indexes for real-time sync
CREATE INDEX IF NOT EXISTS idx_changes_session_id ON session_changes(session_id);
CREATE INDEX IF NOT EXISTS idx_changes_timestamp ON session_changes(timestamp);
CREATE INDEX IF NOT EXISTS idx_changes_change_type ON session_changes(change_type);
CREATE INDEX IF NOT EXISTS idx_changes_entity_id ON session_changes(entity_id);

-- User activity indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_stems_project_order ON stems(project_id, "order");
CREATE INDEX IF NOT EXISTS idx_segments_stem_time ON stem_segments(stem_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_collaborators_project_role ON project_collaborators(project_id, role);
CREATE INDEX IF NOT EXISTS idx_changes_session_timestamp ON session_changes(session_id, timestamp);
