create table "public"."addresses" (
    "address" text not null,
    "created_at" timestamp with time zone not null default now(),
    "type" text,
    "txnCount" bigint,
    "known" boolean default false,
    "name" text
);


create table "public"."blocks" (
    "blockNumber" text not null,
    "created_at" timestamp with time zone not null default now(),
    "txnsCount" integer,
    "status" text
);


create table "public"."prices" (
    "symbol" text not null,
    "updated_at" timestamp with time zone not null default now(),
    "priceUsd" double precision
);


create table "public"."whale_alert" (
    "txnHash" text not null,
    "created_at" timestamp with time zone not null default now(),
    "blockNumber" text,
    "valueEth" double precision,
    "valueUsd" double precision,
    "toAddress" text,
    "fromAddress" text,
    "classification" smallint,
    "maxFeePerGas" text,
    "maxPriorityFeePerGas" text
);


CREATE UNIQUE INDEX addresses_pkey ON public.addresses USING btree (address);

CREATE UNIQUE INDEX blocks_pkey ON public.blocks USING btree ("blockNumber");

CREATE UNIQUE INDEX prices_pkey ON public.prices USING btree (symbol);

CREATE UNIQUE INDEX whale_alert_pkey ON public.whale_alert USING btree ("txnHash");

alter table "public"."addresses" add constraint "addresses_pkey" PRIMARY KEY using index "addresses_pkey";

alter table "public"."blocks" add constraint "blocks_pkey" PRIMARY KEY using index "blocks_pkey";

alter table "public"."prices" add constraint "prices_pkey" PRIMARY KEY using index "prices_pkey";

alter table "public"."whale_alert" add constraint "whale_alert_pkey" PRIMARY KEY using index "whale_alert_pkey";

alter table "public"."whale_alert" add constraint "public_whale_alert_blocknumber_fkey" FOREIGN KEY ("blockNumber") REFERENCES blocks("blockNumber") not valid;

alter table "public"."whale_alert" validate constraint "public_whale_alert_blocknumber_fkey";

alter table "public"."whale_alert" add constraint "public_whale_alert_fromaddress_fkey" FOREIGN KEY ("fromAddress") REFERENCES addresses(address) not valid;

alter table "public"."whale_alert" validate constraint "public_whale_alert_fromaddress_fkey";

alter table "public"."whale_alert" add constraint "public_whale_alert_toaddress_fkey" FOREIGN KEY ("toAddress") REFERENCES addresses(address) not valid;

alter table "public"."whale_alert" validate constraint "public_whale_alert_toaddress_fkey";

grant delete on table "public"."addresses" to "anon";

grant insert on table "public"."addresses" to "anon";

grant references on table "public"."addresses" to "anon";

grant select on table "public"."addresses" to "anon";

grant trigger on table "public"."addresses" to "anon";

grant truncate on table "public"."addresses" to "anon";

grant update on table "public"."addresses" to "anon";

grant delete on table "public"."addresses" to "authenticated";

grant insert on table "public"."addresses" to "authenticated";

grant references on table "public"."addresses" to "authenticated";

grant select on table "public"."addresses" to "authenticated";

grant trigger on table "public"."addresses" to "authenticated";

grant truncate on table "public"."addresses" to "authenticated";

grant update on table "public"."addresses" to "authenticated";

grant delete on table "public"."addresses" to "service_role";

grant insert on table "public"."addresses" to "service_role";

grant references on table "public"."addresses" to "service_role";

grant select on table "public"."addresses" to "service_role";

grant trigger on table "public"."addresses" to "service_role";

grant truncate on table "public"."addresses" to "service_role";

grant update on table "public"."addresses" to "service_role";

grant delete on table "public"."blocks" to "anon";

grant insert on table "public"."blocks" to "anon";

grant references on table "public"."blocks" to "anon";

grant select on table "public"."blocks" to "anon";

grant trigger on table "public"."blocks" to "anon";

grant truncate on table "public"."blocks" to "anon";

grant update on table "public"."blocks" to "anon";

grant delete on table "public"."blocks" to "authenticated";

grant insert on table "public"."blocks" to "authenticated";

grant references on table "public"."blocks" to "authenticated";

grant select on table "public"."blocks" to "authenticated";

grant trigger on table "public"."blocks" to "authenticated";

grant truncate on table "public"."blocks" to "authenticated";

grant update on table "public"."blocks" to "authenticated";

grant delete on table "public"."blocks" to "service_role";

grant insert on table "public"."blocks" to "service_role";

grant references on table "public"."blocks" to "service_role";

grant select on table "public"."blocks" to "service_role";

grant trigger on table "public"."blocks" to "service_role";

grant truncate on table "public"."blocks" to "service_role";

grant update on table "public"."blocks" to "service_role";

grant delete on table "public"."prices" to "anon";

grant insert on table "public"."prices" to "anon";

grant references on table "public"."prices" to "anon";

grant select on table "public"."prices" to "anon";

grant trigger on table "public"."prices" to "anon";

grant truncate on table "public"."prices" to "anon";

grant update on table "public"."prices" to "anon";

grant delete on table "public"."prices" to "authenticated";

grant insert on table "public"."prices" to "authenticated";

grant references on table "public"."prices" to "authenticated";

grant select on table "public"."prices" to "authenticated";

grant trigger on table "public"."prices" to "authenticated";

grant truncate on table "public"."prices" to "authenticated";

grant update on table "public"."prices" to "authenticated";

grant delete on table "public"."prices" to "service_role";

grant insert on table "public"."prices" to "service_role";

grant references on table "public"."prices" to "service_role";

grant select on table "public"."prices" to "service_role";

grant trigger on table "public"."prices" to "service_role";

grant truncate on table "public"."prices" to "service_role";

grant update on table "public"."prices" to "service_role";

grant delete on table "public"."whale_alert" to "anon";

grant insert on table "public"."whale_alert" to "anon";

grant references on table "public"."whale_alert" to "anon";

grant select on table "public"."whale_alert" to "anon";

grant trigger on table "public"."whale_alert" to "anon";

grant truncate on table "public"."whale_alert" to "anon";

grant update on table "public"."whale_alert" to "anon";

grant delete on table "public"."whale_alert" to "authenticated";

grant insert on table "public"."whale_alert" to "authenticated";

grant references on table "public"."whale_alert" to "authenticated";

grant select on table "public"."whale_alert" to "authenticated";

grant trigger on table "public"."whale_alert" to "authenticated";

grant truncate on table "public"."whale_alert" to "authenticated";

grant update on table "public"."whale_alert" to "authenticated";

grant delete on table "public"."whale_alert" to "service_role";

grant insert on table "public"."whale_alert" to "service_role";

grant references on table "public"."whale_alert" to "service_role";

grant select on table "public"."whale_alert" to "service_role";

grant trigger on table "public"."whale_alert" to "service_role";

grant truncate on table "public"."whale_alert" to "service_role";

grant update on table "public"."whale_alert" to "service_role";


