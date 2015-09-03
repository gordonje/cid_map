from models import *
from time import sleep
import googlemaps
from config import api_key

gmaps = googlemaps.Client(key=api_key)

# get already geocoded voters
geocoded = [] 

for i in Voter_Geocode.select():
	geocoded.append(i.voter_id)

for voter in Voter.select().where(~(Voter.vr_id << geocoded) & (Voter.res_cty_st == 'COLUMBIA')).order_by(Voter.vr_id):

	address_str = '{vr_housno} {vr_dir} {vr_street} {vr_kind} {vr_suffix} {vr_apt} {vr_add2} {res_cty_st} MO {vr_zipa}'.format(**voter.__dict__['_data']).replace('None ', '')
	print '   Getting geocodes for {0} (vr_id: {1})'.format(address_str, voter.vr_id)

	sleep(.2)

	try:
		results = gmaps.geocode(address_str)
	except Exception as e:
		print type(e)
		print e
	else:
		print '   Success'

		with db.atomic():
			Voter_Geocode.create(
				  voter = voter.vr_id
				, service = 'GoogleV3'
				, lat = results[0]['geometry']['location']['lat']
				, lng = results[0]['geometry']['location']['lng']
				, location_type = results[0]['geometry']['location_type']
				, json_results = results
			)

print 'fin.'
