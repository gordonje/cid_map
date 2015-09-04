from models import *
from time import sleep
from config import api_key
from requests import Session
import json

# import googlemaps
# gmaps = googlemaps.Client(key=api_key)

# get already geocoded voters
geocoded = [] 

for i in Voter_Geocode.select():
	geocoded.append(i.voter_id)

# set up a requests session
with Session() as r_sesh:

	# loop over all the Columbia city voters who are not yet geocoded
	for voter in Voter.select().where(~(Voter.vr_id << geocoded) & (Voter.res_cty_st == 'COLUMBIA')).order_by(Voter.vr_id):

		# set up an address string
		address_str = '{vr_housno} {vr_dir} {vr_street} {vr_kind} {vr_suffix} {vr_apt} {vr_add2} {res_cty_st} MO {vr_zipa}'.format(**voter.__dict__['_data']).replace('None ', '')
		print '   Getting geocodes for {0} (vr_id: {1})'.format(address_str, voter.vr_id)
		
		# and the request arguments
		url = 'https://maps.googleapis.com/maps/api/geocode/json'
		params = {'key': api_key, 'address': address_str}
		# pause for a tenth of a second
		sleep(.13)
		
		# make the get request
		try: 
			response = r_sesh.get(url, params = params)
		except Exception as e:
			print type(e)
			print e
		else:
			# if we get a response, turn the json into a dict
			dict_response = json.loads(response.content)
			print '   Response Status: {}'.format(dict_response['status'])

			geocode = Voter_Geocode(
				  voter = voter.vr_id
				, service = 'GoogleV3'
				, status = dict_response['status']
				, json_results = response.content
			)

			# set the lat attribute, if included in the results
			try:
				geocode.lat = dict_response['results'][0]['geometry']['location']['lat']
			except IndexError:
				pass
			# set the lng attribute, if included in the results
			try:
				geocode.lng = dict_response['results'][0]['geometry']['location']['lng']
			except IndexError:
				pass
			# set the location_type attribute, if included in the results
			try:
				geocode.location_type = dict_response['results'][0]['geometry']['location_type']
			except IndexError:
				pass

			# try saving the geocode
			try:
				with db.atomic():
					geocode.save()
			except Exception as e:
				if 'duplicate' in e.message:
					print 'Duplicate'
				else:
					print 'Error on line #{0}: {1}'.format(inspect.currentframe().f_lineno, e)

		print '--------------'	

print 'fin.'

