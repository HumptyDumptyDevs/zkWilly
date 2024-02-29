alter table "public"."whale_alert" drop constraint "public_whale_alert_fromaddress_fkey";

alter table "public"."whale_alert" drop constraint "public_whale_alert_toaddress_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.delete_duplicate_whale_alerts()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    WITH duplicates_cte AS (
        SELECT 
            "txnHash",
            created_at,
            "blockNumber",
            "valueEth",
            "valueUsd",
            "toAddress",
            "fromAddress",
            classification,
            "maxFeePerGas",
            "maxPriorityFeePerGas",
            ROW_NUMBER() OVER (PARTITION BY "valueEth", "toAddress", "fromAddress" ORDER BY created_at) AS row_num
        FROM 
            public.whale_alert
    )
    DELETE FROM 
        public.whale_alert
    WHERE 
        ("valueEth", "toAddress", "fromAddress") IN (SELECT "valueEth", "toAddress", "fromAddress" FROM duplicates_cte WHERE row_num > 1);
END;
$function$
;


