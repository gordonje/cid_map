from models import *
from time import sleep
from config import api_key
from requests import Session
import json

# import googlemaps
# gmaps = googlemaps.Client(key=api_key)

# get already geocoded voters
geocoded = [] 

print '   Checking current geocodes...'

# for i in Voter_Geocode.select():
# 	geocoded.append(i.voter_id)

# set up a requests session
with Session() as r_sesh:

	# loop over all the Columbia city voters who are not yet geocoded
	for voter in Voter.select(
					 ).where(
					 	~(Voter.vr_id << geocoded) 
					   & (Voter.res_cty	_st == 'COLUMBIA')
					 ).order_by(Voter.vr_id):

		# set up an address string
		address_str = '{vr_housno} {vr_dir} {vr_street} {vr_kind} {vr_suffix} {vr_apt} {vr_add2} {res_cty_st} MO {vr_zipa}'.format(**voter.__dict__['_data']).replace('None ', '')
		print '   Getting geocodes for {0} (vr_id: {1})'.format(address_str, voter.vr_id)
		
		# and the request arguments
		url = 'https://maps.googleapis.com/maps/api/geocode/json'
		params = {
					  'address': address_str
					# exclude results that aren't in Boone County
					, 'components': 'administrative_area_level_2:Boone County'
					# bias results to area surrounding CoMO
					, 'bounds': '38.7738743197085,-92.5692039802915|39.2191059,-92.1350410197085'
					, 'key': api_key
				}
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

			# check to see if results include a geocode
			try:
				geometry = dict_response['results'][0]['geometry']
			except (IndexError, KeyError):
				pass
			else:
				# set the lat attribute, if included in the results
				geocode.lat = geometry['location']['lat']
				# set the lng attribute, if included in the results
				geocode.lng = geometry['location']['lng']
				# set the location_type attribute, if included in the results
				geocode.location_type = geometry['location_type']

			# check to see if results include a formatted address
			try:
				geocode.formated_address = dict_response['results'][0]['formatted_address']
			except (IndexError, KeyError):
				pass

			# check to see if results include address components
			try:
				address_components = dict_response['results'][0]['address_components']
			except (IndexError, KeyError):
				pass
			else: 
				# set up a dictionary for the address components
				addr_dict = {}
				# add all the components to the dict
				for i in address_components:
					addr_dict[i['types'][0]] = i['long_name']

				# now set each geocode attribute
				try:
					geocode.street_number = addr_dict['street_number']
				except KeyError:
					geocode.street_number = None
				try:
					geocode.route = addr_dict['route']
				except KeyError:
					geocode.route = None
				try:
					geocode.locality = addr_dict['locality']
				except KeyError:
					geocode.locality = None
				try:
					geocode.administrative_area_level_3 = addr_dict['administrative_area_level_3']
				except KeyError:
					geocode.administrative_area_level_3 = None
				try:
					geocode.administrative_area_level_2 = addr_dict['administrative_area_level_2']
				except KeyError:
					geocode.administrative_area_level_2 = None
				try:
					geocode.administrative_area_level_1 = addr_dict['administrative_area_level_1']
				except KeyError:
					geocode.administrative_area_level_1 = None
				try:
					geocode.postal_code = addr_dict['postal_code']
				except KeyError:
					geocode.postal_code = None
				try:
					geocode.postal_code_suffix = addr_dict['postal_code_suffix']
				except KeyError:
					geocode.postal_code_suffix = None
				try:
					geocode.country = addr_dict['country']
				except KeyError:
					geocode.country = None

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

