INSERT INTO math_topics (id, name, grade_label, sort_order) VALUES
  ('algebra', 'Algebra', '8+', 1),
  ('geometry', 'Geometry', '8+', 2),
  ('statistics', 'Statistics', '8+', 3),
  ('number-theory', 'Number Theory', '8+', 4),
  ('calculus', 'Calculus', '10+', 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (id, topic_id, title, level, sort_order) VALUES
  ('linearEquations', 'algebra', 'Linear Equations', 'easy', 1),
  ('quadraticEquations', 'algebra', 'Quadratic Equations', 'medium', 2),
  ('anglesLines', 'geometry', 'Angles & Lines', 'easy', 1),
  ('triangles', 'geometry', 'Triangles', 'medium', 2),
  ('meanMedian', 'statistics', 'Mean & Median', 'easy', 1),
  ('primesFactors', 'number-theory', 'Primes & Factors', 'easy', 1),
  ('limitsIntro', 'calculus', 'Intro to Limits', 'hard', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO questions (id, lesson_id, prompt, choices, correct_answer, sort_order) VALUES
  -- Algebra: linearEquations
  ('q_alg_lin_1', 'linearEquations', 'Solve: x + 5 = 9', '["2", "3", "4", "5"]', '4', 1),
  ('q_alg_lin_2', 'linearEquations', 'Solve: 2x = 10', '["4", "5", "6", "10"]', '5', 2),
  ('q_alg_lin_3', 'linearEquations', 'Solve: x - 3 = 7', '["4", "7", "10", "11"]', '10', 3),
  -- Algebra: quadraticEquations
  ('q_alg_quad_1', 'quadraticEquations', 'Solve for positive x: x^2 = 16', '["2", "4", "8", "16"]', '4', 1),
  ('q_alg_quad_2', 'quadraticEquations', 'What is the y-intercept of y = x^2 + 3?', '["0", "1", "3", "4"]', '3', 2),
  -- Geometry: anglesLines
  ('q_geo_ang_1', 'anglesLines', 'Adjacent angles on a straight line sum to:', '["90", "120", "180", "360"]', '180', 1),
  ('q_geo_ang_2', 'anglesLines', 'A right angle measures:', '["45", "60", "90", "120"]', '90', 2),
  -- Geometry: triangles
  ('q_geo_tri_1', 'triangles', 'Sum of interior angles of a triangle:', '["90", "180", "270", "360"]', '180', 1),
  ('q_geo_tri_2', 'triangles', 'Hypotenuse of right triangle with legs 3 and 4:', '["5", "6", "7", "25"]', '5', 2),
  -- Statistics: meanMedian
  ('q_stat_mm_1', 'meanMedian', 'Mean of 2, 4, 6 is:', '["3", "4", "5", "6"]', '4', 1),
  ('q_stat_mm_2', 'meanMedian', 'Median of 1, 5, 9 is:', '["1", "4", "5", "9"]', '5', 2),
  -- Number theory: primesFactors
  ('q_nt_pf_1', 'primesFactors', 'Which of these is a prime number?', '["4", "6", "9", "11"]', '11', 1),
  ('q_nt_pf_2', 'primesFactors', 'Prime factorization of 12 is:', '["2x6", "3x4", "2x2x3", "12x1"]', '2x2x3', 2),
  -- Calculus: limitsIntro
  ('q_calc_lim_1', 'limitsIntro', 'Limit of x as x approaches 5:', '["0", "1", "5", "infinity"]', '5', 1),
  ('q_calc_lim_2', 'limitsIntro', 'Limit of 1/x as x approaches infinity:', '["0", "1", "infinity", "-1"]', '0', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO achievements (id, name, description) VALUES
  ('first_lesson', 'firstSteps', 'Complete your first lesson'),
  ('streak_3_days', 'consistentLearner', 'Learn for 3 days in a row'),
  ('xp_100', 'firstSteps', 'Reach 100 total XP')
ON CONFLICT (id) DO NOTHING;
