-- export all geocodes to be included
COPY (
SELECT
        CASE 
                -- manually set Jen Henderson's lat
                WHEN vr_id = 330129 THEN 38.96769
                -- manually fix this one downtown voter's lat
                WHEN vr_id = 323026 THEN 38.950234
                -- manually fix these non-downtown voters' lats
                WHEN vr_id in (364640, 361307) THEN 38.9524282
                ELSE lat
        END AS lat,
        CASE 
                -- manually set Jen Henderson's lng
                WHEN vr_id = 330129 THEN -92.34277
                -- manually fix this one downtown voter's lng
                WHEN vr_id = 323026 THEN -92.329726
                -- manually fixt these non-downtown voters' lngs
                WHEN vr_id in (364640, 361307) THEN -92.3222419
                ELSE lng
        END AS lng,
        CASE 
                -- set these voters as being in the business loop cid 
                WHEN vr_id IN (330129, 329766, 130333, 336586, 344827, 14681, 167573, 292551, 350866
                                , 277493, 300768, 323622, 332100, 231772) THEN 'BL'
                -- set these voters as being in the downtown cid 
                WHEN vr_cid = 1 THEN 'DT'
                ELSE 'No'
        END AS cid
FROM voters_geocodes
JOIN voters
ON voter_id = voters.vr_id
WHERE (
-- include all of the downtown cid voters
        vr_cid = 1
) OR (

            status = 'OK'
        AND res_cty_st = 'COLUMBIA'
        AND location_type IN ('ROOFTOP', 'RANGE_INTERPOLATED')
        AND vr_zipa <> '0'
        AND administrative_area_level_2 = 'Boone County'
) 
) TO '/Users/gordo/cid_map/www/data/geocodes.csv' CSV HEADER;

-- export voters non-cid voters
COPY (
SELECT lat, lng
FROM voters_geocodes
JOIN voters
ON voter_id = voters.vr_id
WHERE status = 'OK'
AND res_cty_st = 'COLUMBIA'
AND location_type IN ('ROOFTOP', 'RANGE_INTERPOLATED')
AND vr_zipa <> '0'
AND administrative_area_level_2 = 'Boone County'
-- exclude downtown cid voters
AND vr_cid = 0
-- exclude loop cid voters
AND vr_id NOT IN (
        330129, 329766, 130333, 336586, 344827, 14681, 167573, 292551, 350866, 277493, 300768, 323622, 332100, 231772
)
) TO '/Users/gordo/cid_map/www/data/non_cid_voters.csv' CSV HEADER;

-- export voters loop cid voters
COPY (
SELECT 
        -- manually set Jen Henderson's lat and lng values
        CASE WHEN vr_id = 330129 THEN 38.96769
        ELSE lat
        END AS lat,
        CASE WHEN vr_id = 330129 THEN -92.34277
        ELSE lng
        END AS lng
FROM voters_geocodes
JOIN voters
ON voter_id = voters.vr_id
-- vr_ids of voters found in loop cid
WHERE vr_id IN (
        330129, 329766, 130333, 336586, 344827, 14681, 167573, 292551, 350866, 277493, 300768, 323622, 332100, 231772
)
) TO '/Users/gordo/cid_map/www/data/loop_cid_voters.csv' CSV HEADER;

--export downtown cid voters
COPY (
SELECT 
        -- manually fix this one guy's geocode
        CASE WHEN vr_id = 323026 THEN 38.950234
        ELSE lat
        END AS lat,
        CASE WHEN vr_id = 323026 THEN -92.329726
        ELSE lng
        END AS lng
FROM voters_geocodes
JOIN voters
ON voter_id = voters.vr_id
-- include only downtown cidvoters
WHERE vr_cid = 1
) TO '/Users/gordo/cid_map/www/data/downtown_cid_voters.csv' CSV HEADER;