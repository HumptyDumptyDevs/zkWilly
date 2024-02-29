revoke delete on table "public"."blocks" from "anon";

revoke insert on table "public"."blocks" from "anon";

revoke references on table "public"."blocks" from "anon";

revoke select on table "public"."blocks" from "anon";

revoke trigger on table "public"."blocks" from "anon";

revoke truncate on table "public"."blocks" from "anon";

revoke update on table "public"."blocks" from "anon";

revoke delete on table "public"."blocks" from "authenticated";

revoke insert on table "public"."blocks" from "authenticated";

revoke references on table "public"."blocks" from "authenticated";

revoke select on table "public"."blocks" from "authenticated";

revoke trigger on table "public"."blocks" from "authenticated";

revoke truncate on table "public"."blocks" from "authenticated";

revoke update on table "public"."blocks" from "authenticated";

revoke delete on table "public"."blocks" from "service_role";

revoke insert on table "public"."blocks" from "service_role";

revoke references on table "public"."blocks" from "service_role";

revoke select on table "public"."blocks" from "service_role";

revoke trigger on table "public"."blocks" from "service_role";

revoke truncate on table "public"."blocks" from "service_role";

revoke update on table "public"."blocks" from "service_role";

alter table "public"."whale_alert" drop constraint "public_whale_alert_blocknumber_fkey";

alter table "public"."blocks" drop constraint "blocks_pkey";

drop index if exists "public"."blocks_pkey";

drop table "public"."blocks";

alter table "public"."addresses" add column "is_whale" boolean;


