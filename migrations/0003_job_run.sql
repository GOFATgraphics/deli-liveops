-- Desk can run a job through delivery: OTP on the job, payout note.

alter table jobs add column if not exists delivery_code text;
alter table jobs add column if not exists payout_note text;
