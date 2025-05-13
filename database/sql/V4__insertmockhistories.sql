INSERT INTO users (name, surname, google_subject, email) VALUES
('John', 'Doe', '123456', 'john.doe@example.com'),
('Jane', 'Smith', '123457', 'jane.smith@example.com'),
('Mike', 'Johnson', '123458', 'mike.johnson@example.com');

INSERT INTO history (user_id, timestamp) 
SELECT user_id, 
       CASE 
           WHEN name = 'John' AND email = 'john.doe@example.com' THEN '2024-05-10 10:15:30'::timestamp
           WHEN name = 'John' AND email = 'john.doe@example.com' THEN '2024-05-11 14:20:45'::timestamp
           WHEN name = 'Jane' AND email = 'jane.smith@example.com' THEN '2024-05-10 16:30:15'::timestamp
           WHEN name = 'Jane' AND email = 'jane.smith@example.com' THEN '2024-05-12 09:45:22'::timestamp
           WHEN name = 'Mike' AND email = 'mike.johnson@example.com' THEN '2024-05-11 11:55:40'::timestamp
       END
FROM users
WHERE name IN ('John', 'Jane', 'Mike');

WITH history_entries AS (
    SELECT h.history_id, u.name, u.user_id, h.timestamp
    FROM history h
    JOIN users u ON h.user_id = u.user_id
)
INSERT INTO history_questions (history_id, question_id, option_id)
SELECT 
    he.history_id,
    CASE 
        WHEN he.name = 'John' AND he.timestamp = (SELECT MIN(timestamp) FROM history_entries WHERE name = 'John') 
        THEN q.question_id
        WHEN he.name = 'John' AND he.timestamp = (SELECT timestamp FROM history_entries WHERE name = 'John' ORDER BY timestamp OFFSET 1 LIMIT 1) 
        THEN q.question_id
        WHEN he.name = 'Jane' AND he.timestamp = (SELECT MIN(timestamp) FROM history_entries WHERE name = 'Jane') 
        THEN q.question_id
        WHEN he.name = 'Jane' AND he.timestamp = (SELECT timestamp FROM history_entries WHERE name = 'Jane' ORDER BY timestamp OFFSET 1 LIMIT 1) 
        THEN q.question_id
        WHEN he.name = 'Mike' 
        THEN q.question_id
    END AS question_id,
    CASE 
        WHEN he.name = 'John' AND he.timestamp = (SELECT MIN(timestamp) FROM history_entries WHERE name = 'John') 
        THEN (
            CASE 
                WHEN q.scenario_id = 1 THEN 
                    CASE 
                        WHEN q.question_id = 1 THEN 3
                        WHEN q.question_id = 2 THEN 8
                        WHEN q.question_id = 3 THEN 11
                        WHEN q.question_id = 4 THEN 18
                        WHEN q.question_id = 5 THEN 53
                    END
            END
        )
        WHEN he.name = 'John' AND he.timestamp = (SELECT timestamp FROM history_entries WHERE name = 'John' ORDER BY timestamp OFFSET 1 LIMIT 1) 
        THEN (
            CASE 
                WHEN q.scenario_id = 2 THEN 
                    CASE 
                        WHEN q.question_id = 16 THEN 33
                        WHEN q.question_id = 17 THEN 42
                        WHEN q.question_id = 18 THEN 56
                        WHEN q.question_id = 19 THEN 59
                        WHEN q.question_id = 20 THEN 70
                    END
            END
        )
        WHEN he.name = 'Jane' AND he.timestamp = (SELECT MIN(timestamp) FROM history_entries WHERE name = 'Jane') 
        THEN (
            CASE 
                WHEN q.scenario_id = 3 THEN 
                    CASE 
                        WHEN q.question_id = 31 THEN 61
                        WHEN q.question_id = 32 THEN 67
                        WHEN q.question_id = 33 THEN 76
                        WHEN q.question_id = 34 THEN 106
                        WHEN q.question_id = 35 THEN 110
                    END
            END
        )
        WHEN he.name = 'Jane' AND he.timestamp = (SELECT timestamp FROM history_entries WHERE name = 'Jane' ORDER BY timestamp OFFSET 1 LIMIT 1) 
        THEN (
            CASE 
                WHEN q.scenario_id = 4 THEN 
                    CASE 
                        WHEN q.question_id = 46 THEN 176
                        WHEN q.question_id = 47 THEN 182
                        WHEN q.question_id = 48 THEN 188
                        WHEN q.question_id = 49 THEN 194
                        WHEN q.question_id = 50 THEN 200
                    END
            END
        )
        WHEN he.name = 'Mike' 
        THEN (
            CASE 
                WHEN q.scenario_id = 5 THEN 
                    CASE 
                        WHEN q.question_id = 61 THEN 241
                        WHEN q.question_id = 62 THEN 247
                        WHEN q.question_id = 63 THEN 253
                        WHEN q.question_id = 64 THEN 259
                        WHEN q.question_id = 65 THEN 265
                    END
            END
        )
    END AS option_id
FROM history_entries he
CROSS JOIN questions q
WHERE 
    (he.name = 'John' AND 
     ((he.timestamp = (SELECT MIN(timestamp) FROM history_entries WHERE name = 'John') AND q.scenario_id = 1) OR
      (he.timestamp = (SELECT timestamp FROM history_entries WHERE name = 'John' ORDER BY timestamp OFFSET 1 LIMIT 1) AND q.scenario_id = 2)) AND
     q.question_id IN (1, 2, 3, 4, 5, 16, 17, 18, 19, 20))
    OR 
    (he.name = 'Jane' AND 
     ((he.timestamp = (SELECT MIN(timestamp) FROM history_entries WHERE name = 'Jane') AND q.scenario_id = 3) OR
      (he.timestamp = (SELECT timestamp FROM history_entries WHERE name = 'Jane' ORDER BY timestamp OFFSET 1 LIMIT 1) AND q.scenario_id = 4)) AND
     q.question_id IN (31, 32, 33, 34, 35, 46, 47, 48, 49, 50))
    OR
    (he.name = 'Mike' AND q.scenario_id = 5 AND 
     q.question_id IN (61, 62, 63, 64, 65));