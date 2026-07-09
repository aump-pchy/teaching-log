UPDATE users 
SET password_hash = '$2b$10$Wr9Q./U3EY1J2aDcsL6/nuKqwU9fFmAJ2mhsueiB9F04jgUVkoLUW'
WHERE email = 'admin@loeitc.ac.th'
RETURNING id, email, LEFT(password_hash, 25) as hash_check;
