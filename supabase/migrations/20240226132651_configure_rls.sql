alter table "public"."addresses" enable row level security;

alter table "public"."blocks" enable row level security;

alter table "public"."prices" enable row level security;

alter table "public"."whale_alert" enable row level security;

create policy "Admin Insert"
on "public"."addresses"
as permissive
for insert
to service_role
with check (true);


create policy "Admin Update"
on "public"."addresses"
as permissive
for update
to service_role
with check (true);


create policy "Enable read access for all users"
on "public"."addresses"
as permissive
for select
to public
using (true);


create policy "Admin Insert"
on "public"."prices"
as permissive
for insert
to service_role
with check (true);


create policy "Admin Update"
on "public"."prices"
as permissive
for update
to service_role
with check (true);


create policy "Enable read access for all users"
on "public"."prices"
as permissive
for select
to public
using (true);


create policy "Admin insert"
on "public"."whale_alert"
as permissive
for insert
to service_role
with check (true);


create policy "Enable read access for all users"
on "public"."whale_alert"
as permissive
for select
to public
using (true);



