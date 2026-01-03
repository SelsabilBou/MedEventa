-- Create missing survey-related tables for the survey functionality
-- These complement the existing sondage tables

CREATE TABLE IF NOT EXISTS survey (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES evenement(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS survey_question (
    id INT PRIMARY KEY AUTO_INCREMENT,
    survey_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('text', 'rating', 'yesno', 'multiple') DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES survey(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS survey_response (
    id INT PRIMARY KEY AUTO_INCREMENT,
    survey_id INT NOT NULL,
    user_id INT NOT NULL,
    question_id INT NOT NULL,
    answer_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES survey(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES survey_question(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_survey_event ON survey(event_id);
CREATE INDEX IF NOT EXISTS idx_survey_question_survey ON survey_question(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_response_survey ON survey_response(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_response_user ON survey_response(user_id);
