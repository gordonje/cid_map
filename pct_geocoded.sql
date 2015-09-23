select 
          voters_geocodes.status
        , location_type
        , count(*) as total
        , count(*)::float / (select count(*) from public.voters_geocodes) as pct
from public.voters_geocodes
group by 1, 2
order by 4 DESC;