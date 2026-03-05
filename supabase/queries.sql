-- Example Supabase Queries for testing and understanding

-- 1. Create a dummy club
insert into public.clubs (name, description)
values ('Tech Club', 'For coding enthusiasts!'), ('Sports Club', 'Outdoor games and fitness');

-- 2. View all clubs
select * from public.clubs;

-- 3. Add an event to a club (assuming club_id is known)
insert into public.events (club_id, title, description, event_date)
values ('<club-uuid>', 'Hackathon 2026', 'Annual 24-hour hackathon', '2026-03-15 09:00:00+00');

-- 4. Get events for a specific club
select * from public.events where club_id = '<club-uuid>';

-- 5. Add a feed post
insert into public.feed_posts (club_id, content)
values ('<club-uuid>', 'Hackathon registrations are now open!');

-- 6. Grant an achievement to a student
insert into public.achievements (user_id, club_id, title, points, granted_by)
values ('<student-user-uuid>', '<club-uuid>', 'Hackathon Winner', 50, '<admin-or-head-uuid>');

-- 7. Add an activity log (simulating attending an event)
insert into public.activity_logs (user_id, action_type, points_awarded)
values ('<student-user-uuid>', 'event_attended', 3);

-- 8. Fetch student activeness score
select * from public.student_scores where user_id = '<student-user-uuid>';

-- 9. Fetch leaderboard (Top active students)
select 
  u.full_name,
  s.activeness_score
from public.student_scores s
join public.users u on s.user_id = u.id
order by s.activeness_score desc
limit 10;
