-- Workouts Table
create table if not exists public.workouts (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references public.profiles(id) on delete cascade not null,
  date date not null default current_date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Workout Exercises Table
create table if not exists public.workout_exercises (
  id uuid default gen_random_uuid() primary key,
  workout_id uuid references public.workouts(id) on delete cascade not null,
  exercise_name text not null,
  sets integer not null default 0,
  reps integer not null default 0,
  weight numeric not null default 0,
  completed boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies for Workouts
alter table public.workouts enable row level security;

create policy "Members can view their own workouts"
  on public.workouts for select
  using (auth.uid() = member_id);

create policy "Members can insert their own workouts"
  on public.workouts for insert
  with check (auth.uid() = member_id);

create policy "Admins can view all workouts"
  on public.workouts for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- RLS Policies for Workout Exercises
alter table public.workout_exercises enable row level security;

create policy "Members can view their own workout exercises"
  on public.workout_exercises for select
  using (
    exists (
      select 1 from public.workouts
      where workouts.id = workout_exercises.workout_id and workouts.member_id = auth.uid()
    )
  );

create policy "Members can insert their own workout exercises"
  on public.workout_exercises for insert
  with check (
    exists (
      select 1 from public.workouts
      where workouts.id = workout_exercises.workout_id and workouts.member_id = auth.uid()
    )
  );

create policy "Admins can view all workout exercises"
  on public.workout_exercises for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
