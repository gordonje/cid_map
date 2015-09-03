from models import *
from time import sleep
import googlemaps
from config import api_key

gmaps = googlemaps.Client(key=api_key)

for voter in Voter.select():

	address_str = '{vr_housno} {vr_dir} {vr_street} {vr_kind} {vr_suffix} {vr_apt} {vr_add2} {res_cty_st} MO {vr_zipa}'.format(**voter.__dict__['_data']).replace('None ', '')
	print '   Getting geocodes for {}'.format(address_str)

	sleep(.3)

	try:
		# results = geolocator.geocode(address_str)
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
